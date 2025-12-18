import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { Trash2, Edit, Plus, Package, ShoppingCart, Users, LogOut, Search } from "lucide-react";
import axios from "axios";

const API_URL = "http://localhost:3000/api";

function Admin() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [orders] = useState([
    { id: "ORD001", customerName: "김민지", items: 3, total: 192000, status: "delivered", date: "2024-01-15" },
    { id: "ORD002", customerName: "이서연", items: 2, total: 127000, status: "shipped", date: "2024-01-16" },
    { id: "ORD003", customerName: "박지훈", items: 1, total: 89000, status: "processing", date: "2024-01-17" },
    { id: "ORD004", customerName: "최수민", items: 4, total: 246000, status: "pending", date: "2024-01-17" },
  ]);

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
      alert("SKU, 상품명, 가격, 카테고리, 이미지는 필수 항목입니다");
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

      setNewProduct({ sku: "", name: "", price: "", category: "", description: "", stock: "", image: "" });
      setIsAddProductOpen(false);
      alert("제품이 추가되었습니다");
      fetchProducts(); // 목록 새로고침
    } catch (error) {
      console.error('상품 등록 실패:', error);
      if (error.response?.data?.error) {
        alert(`상품 등록 실패: ${error.response.data.error}`);
      } else {
        alert('상품 등록에 실패했습니다');
      }
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

      setEditingProduct(null);
      alert("제품이 수정되었습니다");
      fetchProducts(); // 목록 새로고침
    } catch (error) {
      console.error('상품 수정 실패:', error);
      if (error.response?.data?.error) {
        alert(`상품 수정 실패: ${error.response.data.error}`);
      } else {
        alert('상품 수정에 실패했습니다');
      }
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('정말 이 제품을 삭제하시겠습니까?')) return;

    try {
      await axios.delete(`${API_URL}/products/${id}`);
      alert("제품이 삭제되었습니다");
      fetchProducts(); // 목록 새로고침
    } catch (error) {
      console.error('상품 삭제 실패:', error);
      alert('상품 삭제에 실패했습니다');
    }
  };

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    // 주문 관리는 나중에 구현 예정
    alert("주문 상태가 업데이트되었습니다");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "대기중";
      case "processing":
        return "처리중";
      case "shipped":
        return "배송중";
      case "delivered":
        return "배송완료";
      default:
        return status;
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">NATURELLE 관리자</h1>
              <p className="text-sm text-gray-500">관리자 대시보드</p>
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
        {/* Stats Cards */}
        <div className="mb-8 grid gap-6 md:grid-cols-4">
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/admin/products')}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">총 제품</CardTitle>
              <Package className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{products.length}</div>
              <p className="text-xs text-gray-500">재고 총 {products.reduce((sum, p) => sum + p.stock, 0)}개</p>
              <Button variant="link" className="mt-2 p-0 h-auto text-xs">
                상품 관리 →
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">재고 부족</CardTitle>
              <Package className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{products.filter((p) => p.stock < 30).length}</div>
              <p className="text-xs text-gray-500">30개 미만</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">총 주문</CardTitle>
              <ShoppingCart className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
              <p className="text-xs text-gray-500">대기중 {orders.filter((o) => o.status === "pending").length}건</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">총 매출</CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {orders.reduce((sum, o) => sum + o.total, 0).toLocaleString()}원
              </div>
              <p className="text-xs text-gray-500">이번 달</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="bg-gray-100">
            <TabsTrigger value="products">제품 관리</TabsTrigger>
            <TabsTrigger value="orders">주문 관리</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
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
                        <TableHead>SKU</TableHead>
                        <TableHead>제품명</TableHead>
                        <TableHead>카테고리</TableHead>
                        <TableHead>가격</TableHead>
                        <TableHead>재고</TableHead>
                        <TableHead className="text-right">작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center text-gray-400">
                            {searchTerm ? "검색 결과가 없습니다" : "등록된 상품이 없습니다"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredProducts.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{product.category}</Badge>
                            </TableCell>
                            <TableCell>{product.price.toLocaleString()}원</TableCell>
                            <TableCell>
                              <Badge variant={product.stock < 30 ? "destructive" : "secondary"}>{product.stock}개</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Dialog
                                  open={editingProduct?.id === product.id}
                                  onOpenChange={(open) => !open && setEditingProduct(null)}
                                >
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm" onClick={() => setEditingProduct({ ...product })}>
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-[600px]">
                                    <DialogHeader>
                                      <DialogTitle>제품 수정</DialogTitle>
                                      <DialogDescription>제품 정보를 수정하세요</DialogDescription>
                                    </DialogHeader>
                                    {editingProduct && (
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
                                            <Input
                                              id="edit-category"
                                              value={editingProduct.category}
                                              onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                                            />
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
                                              onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                                            />
                                          </div>
                                          <div className="grid gap-2">
                                            <Label htmlFor="edit-stock">재고</Label>
                                            <Input
                                              id="edit-stock"
                                              type="number"
                                              value={editingProduct.stock}
                                              onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                                            />
                                          </div>
                                        </div>
                                        <div className="grid gap-2">
                                          <Label htmlFor="edit-image">이미지 URL</Label>
                                          <Input
                                            id="edit-image"
                                            value={editingProduct.image}
                                            onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                                          />
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
                                    )}
                                    <DialogFooter>
                                      <Button variant="outline" onClick={() => setEditingProduct(null)}>
                                        취소
                                      </Button>
                                      <Button onClick={handleUpdateProduct} className="bg-gray-900 hover:bg-gray-800 text-white">
                                        수정
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteProduct(product.id)}>
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900">주문 목록</CardTitle>
                <CardDescription>모든 주문을 관리하고 상태를 업데이트합니다</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>주문번호</TableHead>
                      <TableHead>고객명</TableHead>
                      <TableHead>상품수</TableHead>
                      <TableHead>금액</TableHead>
                      <TableHead>날짜</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead className="text-right">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>{order.items}개</TableCell>
                        <TableCell>{order.total.toLocaleString()}원</TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>{getStatusText(order.status)}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900"
                          >
                            <option value="pending">대기중</option>
                            <option value="processing">처리중</option>
                            <option value="shipped">배송중</option>
                            <option value="delivered">배송완료</option>
                          </select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

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

export default Admin;
