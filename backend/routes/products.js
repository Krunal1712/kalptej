const express = require('express');
const router = express.Router();
const db = require('../data/db');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// GET: All Products (Supports Search and Category filters)
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    const products = await db.getProducts(search, category);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error while fetching products' });
  }
});

// GET: Single Product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await db.getProductById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error while fetching product details' });
  }
});

// POST: Add Product (Admin Only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { title, shortTitle, description, price, category, image, specifications } = req.body;

    if (!title || !shortTitle || !price || !category || !image) {
      return res.status(400).json({ message: 'Title, Short Title, Price, Category, and Image are required' });
    }

    const newProduct = {
      id: 'p_' + Date.now(),
      title,
      shortTitle,
      description: description || '',
      price: {
        mrp: Number(price.mrp) || Number(price.cost),
        cost: Number(price.cost),
        discount: price.discount ? Number(price.discount) : Math.round(((price.mrp - price.cost) / price.mrp) * 100) || 0
      },
      category,
      image,
      rating: {
        rate: 5.0,
        count: 1
      },
      specifications: specifications || {},
      createdAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };

    await db.createProduct(newProduct);

    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error while creating product' });
  }
});

// PUT: Update Product (Admin Only)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { title, shortTitle, description, price, category, image, specifications } = req.body;
    const existingProduct = await db.getProductById(req.params.id);

    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updatedProduct = {
      ...existingProduct,
      title: title || existingProduct.title,
      shortTitle: shortTitle || existingProduct.shortTitle,
      description: description !== undefined ? description : existingProduct.description,
      price: price ? {
        mrp: Number(price.mrp) || Number(price.cost),
        cost: Number(price.cost),
        discount: price.discount ? Number(price.discount) : Math.round(((price.mrp - price.cost) / price.mrp) * 100) || 0
      } : existingProduct.price,
      category: category || existingProduct.category,
      image: image || existingProduct.image,
      specifications: specifications || existingProduct.specifications
    };

    const savedProduct = await db.updateProduct(req.params.id, updatedProduct);
    res.json(savedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error while updating product' });
  }
});

// DELETE: Remove Product (Admin Only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const success = await db.deleteProduct(req.params.id);

    if (!success) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product successfully deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error while deleting product' });
  }
});

module.exports = router;
