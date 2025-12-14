const express = require('express');
const router = express.Router();
const { containers } = require('../config/cosmosdb');

// Get all products
router.get('/', async (req, res) => {
  try {
    const container = containers.products();
    const { resources: products } = await container.items
      .query('SELECT * FROM c')
      .fetchAll();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get product by id
router.get('/:id', async (req, res) => {
  try {
    const container = containers.products();
    const { resource: product } = await container.item(req.params.id, req.query.category).read();
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new product
router.post('/', async (req, res) => {
  try {
    const container = containers.products();
    const newProduct = {
      id: req.body.id || Date.now().toString(),
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      stock: req.body.stock,
      imageUrl: req.body.imageUrl,
      createdAt: new Date().toISOString()
    };
    const { resource: createdProduct } = await container.items.create(newProduct);
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const container = containers.products();
    const { resource: existingProduct } = await container.item(req.params.id, req.body.category).read();

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const updatedProduct = {
      ...existingProduct,
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    const { resource: result } = await container.item(req.params.id, req.body.category).replace(updatedProduct);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const container = containers.products();
    await container.item(req.params.id, req.query.category).delete();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
