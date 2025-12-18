const { containers } = require('../config/cosmosdb');
const Product = require('../models/Product');

// Get all products
const getAllProducts = async (req, res) => {
  try {
    const container = containers.products();
    const { resources: products } = await container.items
      .query('SELECT * FROM c ORDER BY c.createdAt DESC')
      .fetchAll();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get product by ID
const getProductById = async (req, res) => {
  try {
    const container = containers.products();

    // Query by ID since we don't know the partition key (category)
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.id = @id',
      parameters: [
        {
          name: '@id',
          value: req.params.id
        }
      ]
    };

    const { resources: products } = await container.items
      .query(querySpec)
      .fetchAll();

    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(products[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get product by SKU
const getProductBySku = async (req, res) => {
  try {
    const container = containers.products();
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.sku = @sku',
      parameters: [
        {
          name: '@sku',
          value: req.params.sku
        }
      ]
    };

    const { resources: products } = await container.items
      .query(querySpec)
      .fetchAll();

    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(products[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get products by category
const getProductsByCategory = async (req, res) => {
  try {
    const container = containers.products();
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.category = @category ORDER BY c.createdAt DESC',
      parameters: [
        {
          name: '@category',
          value: req.params.category
        }
      ]
    };

    const { resources: products } = await container.items
      .query(querySpec)
      .fetchAll();

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new product
const createProduct = async (req, res) => {
  try {
    const container = containers.products();

    // Create Product instance
    const product = new Product({
      id: req.body.id || Date.now().toString(),
      sku: req.body.sku,
      name: req.body.name,
      price: req.body.price,
      category: req.body.category,
      image: req.body.image,
      description: req.body.description,
      stock: req.body.stock
    });

    // Validate product data
    const validation = product.validate();
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors
      });
    }

    // Check if SKU already exists (SKU must be unique)
    const skuCheckQuery = {
      query: 'SELECT * FROM c WHERE c.sku = @sku',
      parameters: [
        {
          name: '@sku',
          value: product.sku
        }
      ]
    };

    const { resources: existingProducts } = await container.items
      .query(skuCheckQuery)
      .fetchAll();

    if (existingProducts.length > 0) {
      return res.status(409).json({ error: 'SKU already exists. SKU must be unique.' });
    }

    // Create product in database
    const { resource: createdProduct } = await container.items.create(product.toJSON());
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update product (full update)
const updateProduct = async (req, res) => {
  try {
    const container = containers.products();

    // First, find the product to get its partition key (category)
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.id = @id',
      parameters: [{ name: '@id', value: req.params.id }]
    };
    const { resources: foundProducts } = await container.items.query(querySpec).fetchAll();

    if (foundProducts.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const existingProduct = foundProducts[0];

    // If SKU is being updated, check for uniqueness
    if (req.body.sku && req.body.sku !== existingProduct.sku) {
      const skuCheckQuery = {
        query: 'SELECT * FROM c WHERE c.sku = @sku',
        parameters: [
          {
            name: '@sku',
            value: req.body.sku
          }
        ]
      };

      const { resources: existingProducts } = await container.items
        .query(skuCheckQuery)
        .fetchAll();

      if (existingProducts.length > 0) {
        return res.status(409).json({ error: 'SKU already exists. SKU must be unique.' });
      }
    }

    // Create updated product instance
    const updatedProductData = {
      ...existingProduct,
      sku: req.body.sku !== undefined ? req.body.sku : existingProduct.sku,
      name: req.body.name !== undefined ? req.body.name : existingProduct.name,
      price: req.body.price !== undefined ? req.body.price : existingProduct.price,
      category: req.body.category !== undefined ? req.body.category : existingProduct.category,
      image: req.body.image !== undefined ? req.body.image : existingProduct.image,
      description: req.body.description !== undefined ? req.body.description : existingProduct.description,
      stock: req.body.stock !== undefined ? req.body.stock : existingProduct.stock
    };

    const product = new Product(updatedProductData);

    // Validate updated data
    const validation = product.validate();
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors
      });
    }

    // Update timestamp
    product.updateTimestamp();

    // Use the product's category as partition key
    const { resource: result } = await container.item(req.params.id, product.category).replace(product.toJSON());
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Partial update product
const partialUpdateProduct = async (req, res) => {
  try {
    const container = containers.products();

    // First, find the product to get its partition key (category)
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.id = @id',
      parameters: [{ name: '@id', value: req.params.id }]
    };
    const { resources: foundProducts } = await container.items.query(querySpec).fetchAll();

    if (foundProducts.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const existingProduct = foundProducts[0];

    // If SKU is being updated, check for uniqueness
    if (req.body.sku && req.body.sku !== existingProduct.sku) {
      const skuCheckQuery = {
        query: 'SELECT * FROM c WHERE c.sku = @sku',
        parameters: [
          {
            name: '@sku',
            value: req.body.sku
          }
        ]
      };

      const { resources: existingProducts } = await container.items
        .query(skuCheckQuery)
        .fetchAll();

      if (existingProducts.length > 0) {
        return res.status(409).json({ error: 'SKU already exists. SKU must be unique.' });
      }
    }

    // Only update provided fields
    const updatedProductData = {
      ...existingProduct,
      ...(req.body.sku && { sku: req.body.sku }),
      ...(req.body.name && { name: req.body.name }),
      ...(req.body.price !== undefined && { price: req.body.price }),
      ...(req.body.category && { category: req.body.category }),
      ...(req.body.image && { image: req.body.image }),
      ...(req.body.description !== undefined && { description: req.body.description }),
      ...(req.body.stock !== undefined && { stock: req.body.stock })
    };

    const product = new Product(updatedProductData);

    // Validate updated data
    const validation = product.validate();
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors
      });
    }

    // Update timestamp
    product.updateTimestamp();

    // Use the product's category as partition key
    const { resource: result } = await container.item(req.params.id, product.category).replace(product.toJSON());
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const container = containers.products();

    // First, find the product to get its partition key (category)
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.id = @id',
      parameters: [{ name: '@id', value: req.params.id }]
    };
    const { resources: foundProducts } = await container.items.query(querySpec).fetchAll();

    if (foundProducts.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const productToDelete = foundProducts[0];

    // Delete using the product's category as partition key
    await container.item(req.params.id, productToDelete.category).delete();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  getProductBySku,
  getProductsByCategory,
  createProduct,
  updateProduct,
  partialUpdateProduct,
  deleteProduct
};
