const express = require('express');
const router = express.Router();
const { containers } = require('../config/cosmosdb');

// GET - 모든 주문 조회 (관리자용)
router.get('/', async (req, res) => {
  try {
    const container = containers.orders();
    const { resources: orders } = await container.items
      .query({
        query: "SELECT * FROM c ORDER BY c.createdAt DESC"
      })
      .fetchAll();
    res.json(orders);
  } catch (error) {
    console.error('주문 목록 조회 실패:', error);
    res.status(500).json({ error: '주문 목록 조회에 실패했습니다' });
  }
});

// GET - 특정 사용자의 주문 조회
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const container = containers.orders();
    const { resources: orders } = await container.items
      .query({
        query: "SELECT * FROM c WHERE c.userId = @userId ORDER BY c.createdAt DESC",
        parameters: [{ name: "@userId", value: userId }]
      })
      .fetchAll();
    res.json(orders);
  } catch (error) {
    console.error('사용자 주문 조회 실패:', error);
    res.status(500).json({ error: '주문 조회에 실패했습니다' });
  }
});

// GET - 특정 주문 상세 조회
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId가 필요합니다' });
    }

    const container = containers.orders();
    const { resource: order } = await container.item(id, userId).read();

    if (!order) {
      return res.status(404).json({ error: '주문을 찾을 수 없습니다' });
    }

    res.json(order);
  } catch (error) {
    console.error('주문 조회 실패:', error);
    res.status(500).json({ error: '주문 조회에 실패했습니다' });
  }
});

// POST - 새 주문 생성
router.post('/', async (req, res) => {
  try {
    const { userId, items, totalAmount, tax, shippingFee, status, shippingAddress } = req.body;

    // 필수 필드 검증
    if (!items || items.length === 0) {
      return res.status(400).json({ error: '주문 상품이 필요합니다' });
    }

    if (!shippingAddress) {
      return res.status(400).json({ error: '배송 주소가 필요합니다' });
    }

    const container = containers.orders();
    const newOrder = {
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: userId || 'guest',
      items: items.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        category: item.category,
        image: item.image,
      })),
      totalAmount: totalAmount || 0,
      tax: tax || 0,
      shippingFee: shippingFee || 0,
      status: status || 'pending',
      shippingAddress: {
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        email: shippingAddress.email,
        phone: shippingAddress.phone,
        address: shippingAddress.address,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { resource: createdOrder } = await container.items.create(newOrder);
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('주문 생성 실패:', error);
    res.status(500).json({ error: '주문 생성에 실패했습니다' });
  }
});

// PUT - 주문 상태 업데이트 (관리자용)
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, userId } = req.body;

    if (!status) {
      return res.status(400).json({ error: '상태 값이 필요합니다' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'userId가 필요합니다' });
    }

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: '유효하지 않은 상태 값입니다' });
    }

    const container = containers.orders();
    const { resource: order } = await container.item(id, userId).read();

    if (!order) {
      return res.status(404).json({ error: '주문을 찾을 수 없습니다' });
    }

    order.status = status;
    order.updatedAt = new Date().toISOString();

    const { resource: updatedOrder } = await container.item(id, userId).replace(order);
    res.json(updatedOrder);
  } catch (error) {
    console.error('주문 상태 업데이트 실패:', error);
    res.status(500).json({ error: '주문 상태 업데이트에 실패했습니다' });
  }
});

// PUT - 주문 정보 전체 업데이트
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!updateData.userId) {
      return res.status(400).json({ error: 'userId가 필요합니다' });
    }

    const container = containers.orders();
    const { resource: order } = await container.item(id, updateData.userId).read();

    if (!order) {
      return res.status(404).json({ error: '주문을 찾을 수 없습니다' });
    }

    const updatedOrder = {
      ...order,
      ...updateData,
      id: order.id, // ID는 변경 불가
      userId: order.userId, // userId는 변경 불가 (파티션 키)
      updatedAt: new Date().toISOString(),
    };

    const { resource: result } = await container.item(id, order.userId).replace(updatedOrder);
    res.json(result);
  } catch (error) {
    console.error('주문 업데이트 실패:', error);
    res.status(500).json({ error: '주문 업데이트에 실패했습니다' });
  }
});

// DELETE - 주문 삭제 (관리자용)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId가 필요합니다' });
    }

    const container = containers.orders();
    const { resource: order } = await container.item(id, userId).read();

    if (!order) {
      return res.status(404).json({ error: '주문을 찾을 수 없습니다' });
    }

    await container.item(id, userId).delete();
    res.json({ message: '주문이 삭제되었습니다', deletedOrder: order });
  } catch (error) {
    console.error('주문 삭제 실패:', error);
    res.status(500).json({ error: '주문 삭제에 실패했습니다' });
  }
});

module.exports = router;
