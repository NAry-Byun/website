const express = require('express');
const router = express.Router();
const { containers } = require('../config/cosmosdb');

// Get all orders
router.get('/', async (req, res) => {
  try {
    const container = containers.orders();
    const { resources: orders } = await container.items
      .query('SELECT * FROM c')
      .fetchAll();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get order by id
router.get('/:id', async (req, res) => {
  try {
    const container = containers.orders();
    const { resource: order } = await container.item(req.params.id, req.query.userId).read();
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ error: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get orders by user id
router.get('/user/:userId', async (req, res) => {
  try {
    const container = containers.orders();
    const { resources: orders } = await container.items
      .query({
        query: 'SELECT * FROM c WHERE c.userId = @userId',
        parameters: [{ name: '@userId', value: req.params.userId }]
      })
      .fetchAll();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new order
router.post('/', async (req, res) => {
  try {
    const container = containers.orders();
    const newOrder = {
      id: req.body.id || Date.now().toString(),
      userId: req.body.userId,
      items: req.body.items, // Array of {productId, name, price, quantity}
      totalAmount: req.body.totalAmount,
      status: req.body.status || 'pending',
      shippingAddress: req.body.shippingAddress,
      createdAt: new Date().toISOString()
    };
    const { resource: createdOrder } = await container.items.create(newOrder);
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update order status
router.put('/:id', async (req, res) => {
  try {
    const container = containers.orders();
    const { resource: existingOrder } = await container.item(req.params.id, req.body.userId).read();

    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updatedOrder = {
      ...existingOrder,
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    const { resource: result } = await container.item(req.params.id, req.body.userId).replace(updatedOrder);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete order
router.delete('/:id', async (req, res) => {
  try {
    const container = containers.orders();
    await container.item(req.params.id, req.query.userId).delete();
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
