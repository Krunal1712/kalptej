const express = require('express');
const router = express.Router();
const db = require('../data/db');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// POST: Place New Order
router.post('/', authenticateToken, (req, res) => {
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

    const orders = db.getOrders();
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
      createdAt: new Date().toISOString()
    };

    orders.push(newOrder);
    db.saveOrders(orders);

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ message: 'Server error while placing order' });
  }
});

// GET: Current User's Orders
router.get('/', authenticateToken, (req, res) => {
  try {
    const orders = db.getOrders();
    const userOrders = orders.filter(o => o.userId === req.user.id);
    // Sort by latest order first
    userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(userOrders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Server error while fetching orders' });
  }
});

// GET: All Orders (Admin Only)
router.get('/all', authenticateToken, isAdmin, (req, res) => {
  try {
    const orders = db.getOrders();
    // Sort by latest order first
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(orders);
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ message: 'Server error while fetching system orders' });
  }
});

// PUT: Update Order Status (Admin Only)
router.put('/:id/status', authenticateToken, isAdmin, (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Ordered', 'Shipped', 'Out for Delivery', 'Delivered'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status update' });
    }

    const orders = db.getOrders();
    const index = orders.findIndex(o => o.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orders[index];
    order.orderStatus = status;
    order.statusTimeline.push({
      status,
      timestamp: new Date().toISOString()
    });

    orders[index] = order;
    db.saveOrders(orders);

    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error while updating status' });
  }
});

module.exports = router;
