class Product {
  constructor({ id, sku, name, price, category, image, description, stock = 0, createdAt, updatedAt }) {
    this.id = id;
    this.sku = sku; // 상품 고유 식별자 (항상 유니크해야 함)
    this.name = name;
    this.price = price;
    this.category = category;
    this.image = image; // 이미지 URL 또는 경로
    this.description = description || ''; // 선택 사항
    this.stock = stock; // 재고 수량
    this.createdAt = createdAt || new Date().toISOString();
    this.updatedAt = updatedAt || new Date().toISOString();
  }

  validate() {
    const errors = [];

    // 필수 필드 검증
    if (!this.sku || typeof this.sku !== 'string' || this.sku.trim() === '') {
      errors.push('SKU는 필수 항목입니다');
    }

    if (!this.name || typeof this.name !== 'string' || this.name.trim() === '') {
      errors.push('상품 이름은 필수 항목입니다');
    }

    if (this.price === undefined || this.price === null) {
      errors.push('가격은 필수 항목입니다');
    } else if (typeof this.price !== 'number' || this.price < 0) {
      errors.push('가격은 0 이상의 숫자여야 합니다');
    }

    if (!this.category || typeof this.category !== 'string' || this.category.trim() === '') {
      errors.push('카테고리는 필수 항목입니다');
    }

    if (!this.image || typeof this.image !== 'string' || this.image.trim() === '') {
      errors.push('이미지는 필수 항목입니다');
    }

    // 재고는 선택 사항이지만 제공된 경우 검증
    if (this.stock !== undefined && (typeof this.stock !== 'number' || this.stock < 0)) {
      errors.push('재고는 0 이상의 숫자여야 합니다');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  updateTimestamp() {
    this.updatedAt = new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      sku: this.sku,
      name: this.name,
      price: this.price,
      category: this.category,
      image: this.image,
      description: this.description,
      stock: this.stock,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Product;
