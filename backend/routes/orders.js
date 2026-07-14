const express = require('express');
const router = express.Router();
const db = require('../data/db');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// POST: Place New Order
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, paymentDetails } = req.body;

    if (!items || items.length === 0 || !shippingAddress || !paymentMethod) {
      return res.status(400).json({ message: 'Missing order details' });
    }

    // Calculate dynamic totals to verify client-side calculations
    let totalMrp = 0;
    let totalCost = 0;
    
    items.forEach(item => {
      totalMrp += item.price.mrp * item.qty;
      totalCost += item.price.cost * item.qty;
    });

    const discount = totalMrp - totalCost;
    const deliveryCharges = totalCost > 500 ? 0 : 40;
    const finalAmount = totalCost + deliveryCharges;

    const newOrder = {
      id: 'ord_' + Date.now(),
      userId: req.user.id,
      userName: req.user.name,
      userEmail: req.user.email,
      items,
      shippingAddress,
      paymentMethod,
      paymentDetails: paymentDetails || { status: 'Success', transactionId: 'TXN_' + Date.now() },
      pricing: {
        totalMrp,
        discount,
        deliveryCharges,
        finalAmount
      },
      orderStatus: 'Ordered', // Ordered -> Shipped -> Out for Delivery -> Delivered
      statusTimeline: [
        { status: 'Ordered', timestamp: new Date().toISOString() }
      ],
      createdAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };

    await db.createOrder(newOrder);

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ message: 'Server error while placing order' });
  }
});

// GET: Current User's Orders
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userOrders = await db.getUserOrders(req.user.id);
    res.json(userOrders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Server error while fetching orders' });
  }
});

// GET: All Orders (Admin Only)
router.get('/all', authenticateToken, isAdmin, async (req, res) => {
  try {
    const orders = await db.getOrders();
    res.json(orders);
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ message: 'Server error while fetching system orders' });
  }
});

// PUT: Update Order Status (Admin Only)
router.put('/:id/status', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Ordered', 'Shipped', 'Out for Delivery', 'Delivered'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status update' });
    }

    const orders = await db.getOrders();
    const order = orders.find(o => o.id === req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.statusTimeline.push({
      status,
      timestamp: new Date().toISOString()
    });

    const updatedOrder = await db.updateOrderStatus(req.params.id, status, order.statusTimeline);

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error while updating status' });
  }
});

module.exports = router;
