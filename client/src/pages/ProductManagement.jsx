import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { Trash2, Edit, Plus, LogOut, Search, ArrowLeft } from "lucide-react";
import axios from "axios";

const API_URL = "http://localhost:3000/api";

function ProductManagement() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2; // 페이지당 2개씩 표시

  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    sku: "",
    name: "",
    price: "",
    category: "",
    description: "",
    stock: "",
    image: "",
  });

  // Cloudinary 위젯 열기
  const openCloudinaryWidget = (callback) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      alert('Cloudinary 설정이 필요합니다. .env 파일을 확인하세요.');
      return;
    }

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: cloudName,
        uploadPreset: uploadPreset,
        sources: ['local', 'url', 'camera'],
        multiple: false,
        resourceType: 'image',
        clientAllowedFormats: ['png', 'jpg', 'jpeg', 'webp'],
        maxFileSize: 5000000, // 5MB
        folder: 'products',
      },
      (error, result) => {
        if (!error && result && result.event === 'success') {
          callback(result.info.secure_url);
        }
      }
    );
    widget.open();
  };

  // 어드민 권한 체크
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      alert('로그인이 필요합니다');
      navigate('/login');
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      setUser(userData);

      if (userData.user_type !== 'admin') {
        alert('관리자 권한이 필요합니다');
        navigate('/');
      }
    } catch (e) {
      alert('로그인 정보가 올바르지 않습니다');
      navigate('/login');
    }
  }, [navigate]);

  // 상품 목록 불러오기
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('상품 목록 조회 실패:', error);
      alert('상품 목록을 불러오는데 실패했습니다');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('user-updated'));
    navigate('/');
  };

  const handleAddProduct = async () => {
    if (!newProduct.sku || !newProduct.name || !newProduct.price || !newProduct.category || !newProduct.image) {
      alert("필수 항목을 모두 입력해주세요 (SKU, 상품명, 가격, 카테고리, 이미지)");
      return;
    }

    try {
      const productData = {
        sku: newProduct.sku,
        name: newProduct.name,
        price: Number(newProduct.price),
        category: newProduct.category,
        image: newProduct.image,
        description: newProduct.description || "",
        stock: Number(newProduct.stock) || 0,
      };

      await axios.post(`${API_URL}/products`, productData);
      alert("상품이 추가되었습니다");
      setIsAddProductOpen(false);
      setNewProduct({
        sku: "",
        name: "",
        price: "",
        category: "",
        description: "",
        stock: "",
        image: "",
      });
      fetchProducts();
    } catch (error) {
      console.error('상품 추가 실패:', error);
      alert(error.response?.data?.error || '상품 추가에 실패했습니다');
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    try {
      const productData = {
        sku: editingProduct.sku,
        name: editingProduct.name,
        price: Number(editingProduct.price),
        category: editingProduct.category,
        image: editingProduct.image,
        description: editingProduct.description || "",
        stock: Number(editingProduct.stock) || 0,
      };

      await axios.put(`${API_URL}/products/${editingProduct.id}`, productData);
      alert("상품이 수정되었습니다");
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('상품 수정 실패:', error);
      alert(error.response?.data?.error || '상품 수정에 실패했습니다');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm("정말 이 상품을 삭제하시겠습니까?")) return;

    try {
      await axios.delete(`${API_URL}/products/${productId}`);
      alert("상품이 삭제되었습니다");
      fetchProducts();
    } catch (error) {
      console.error('상품 삭제 실패:', error);
      alert('상품 삭제에 실패했습니다');
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // 페이지 변경 핸들러
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 검색어 변경시 첫 페이지로 이동
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                대시보드
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">상품 관리</h1>
                <p className="text-sm text-gray-500">제품 등록 및 관리</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">
                {user.name}님 (관리자)
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-1" />
                로그아웃
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/')}>
                사용자 페이지로
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-gray-900">제품 목록</CardTitle>
                <CardDescription>등록된 모든 제품을 관리합니다</CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="상품명, SKU, 카테고리 검색"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Button
                  onClick={() => setIsAddProductOpen(true)}
                  className="bg-gray-900 hover:bg-gray-800 text-white whitespace-nowrap"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  제품 추가
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingProducts ? (
              <div className="text-center py-8 text-gray-500">로딩 중...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-32">SKU</TableHead>
                    <TableHead className="min-w-[200px]">제품명</TableHead>
                    <TableHead className="w-28">카테고리</TableHead>
                    <TableHead className="w-28">가격</TableHead>
                    <TableHead className="w-20">재고</TableHead>
                    <TableHead className="text-right w-44">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-gray-400">
                        {searchTerm ? "검색 결과가 없습니다" : "등록된 상품이 없습니다"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded-md border border-gray-200"
                              />
                            ) : (
                              <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-md border border-gray-200">
                                <span className="text-gray-400 text-xs">No Image</span>
                              </div>
                            )}
                            <span className="font-medium">{product.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.category}</Badge>
                        </TableCell>
                        <TableCell>{product.price.toLocaleString()}원</TableCell>
                        <TableCell>
                          <Badge variant={product.stock < 30 ? "destructive" : "secondary"}>{product.stock}개</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingProduct({ ...product })}
                              className="border-blue-200 hover:bg-blue-50 hover:border-blue-400"
                              title="제품 수정"
                            >
                              <Edit className="h-4 w-4 text-blue-600" />
                              <span className="ml-1 text-blue-600 text-xs">수정</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteProduct(product.id)}
                              className="border-red-200 hover:bg-red-50 hover:border-red-400"
                              title="제품 삭제"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                              <span className="ml-1 text-red-600 text-xs">삭제</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}

            {/* Pagination Controls */}
            {!isLoadingProducts && filteredProducts.length > 0 && totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  이전
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className={currentPage === pageNum ? "bg-gray-900 hover:bg-gray-800 text-white" : ""}
                  >
                    {pageNum}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  다음
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Product Dialog */}
      <Dialog
        open={editingProduct !== null}
        onOpenChange={(open) => !open && setEditingProduct(null)}
      >
        {editingProduct && (
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>제품 수정</DialogTitle>
              <DialogDescription>제품 정보를 수정하세요</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-sku">SKU</Label>
                  <Input
                    id="edit-sku"
                    value={editingProduct.sku}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-category">카테고리</Label>
                  <select
                    id="edit-category"
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    <option value="">선택하세요</option>
                    <option value="스킨케어">스킨케어</option>
                    <option value="바디케어">바디케어</option>
                    <option value="홈케어">홈케어</option>
                  </select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-name">제품명</Label>
                <Input
                  id="edit-name"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-price">가격 (원)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-stock">재고</Label>
                  <Input
                    id="edit-stock"
                    type="number"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-image">이미지</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => openCloudinaryWidget((url) => setEditingProduct({ ...editingProduct, image: url }))}
                    className="flex-1"
                  >
                    이미지 업로드
                  </Button>
                  {editingProduct.image && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setEditingProduct({ ...editingProduct, image: "" })}
                    >
                      제거
                    </Button>
                  )}
                </div>
                {editingProduct.image && (
                  <div className="mt-2 relative w-full h-48 border border-gray-200 rounded-md overflow-hidden">
                    <img
                      src={editingProduct.image}
                      alt="미리보기"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">설명</Label>
                <Textarea
                  id="edit-description"
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingProduct(null)}>
                취소
              </Button>
              <Button onClick={handleUpdateProduct} className="bg-gray-900 hover:bg-gray-800 text-white">
                수정
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Add Product Dialog */}
      <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>새 제품 추가</DialogTitle>
            <DialogDescription>새로운 제품 정보를 입력하세요</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="sku">SKU (고유번호) <span className="text-red-500">*</span></Label>
                <Input
                  id="sku"
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                  placeholder="SKIN-001"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">카테고리 <span className="text-red-500">*</span></Label>
                <select
                  id="category"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  <option value="">선택하세요</option>
                  <option value="스킨케어">스킨케어</option>
                  <option value="바디케어">바디케어</option>
                  <option value="홈케어">홈케어</option>
                </select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">제품명 <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                placeholder="로즈 페이셜 오일"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">가격 (원) <span className="text-red-500">*</span></Label>
                <Input
                  id="price"
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  placeholder="89000"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stock">재고</Label>
                <Input
                  id="stock"
                  type="number"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                  placeholder="45"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image">이미지 <span className="text-red-500">*</span></Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => openCloudinaryWidget((url) => setNewProduct({ ...newProduct, image: url }))}
                  className="flex-1"
                >
                  이미지 업로드
                </Button>
                {newProduct.image && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setNewProduct({ ...newProduct, image: "" })}
                  >
                    제거
                  </Button>
                )}
              </div>
              {newProduct.image && (
                <div className="mt-2 relative w-full h-48 border border-gray-200 rounded-md overflow-hidden">
                  <img
                    src={newProduct.image}
                    alt="미리보기"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                placeholder="제품 설명을 입력하세요"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddProductOpen(false)}>
              취소
            </Button>
            <Button onClick={handleAddProduct} className="bg-gray-900 hover:bg-gray-800 text-white">
              추가
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ProductManagement;
