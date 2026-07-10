const express = require('express');
const router = express.Router();
const db = require('../data/db');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// GET: All Products (Supports Search and Category filters)
router.get('/', (req, res) => {
  try {
    let products = db.getProducts();
    const { search, category } = req.query;

    if (category) {
      products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const query = search.toLowerCase();
      products = products.filter(p => 
        p.title.toLowerCase().includes(query) || 
        p.shortTitle.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error while fetching products' });
  }
});

// GET: Single Product by ID
router.get('/:id', (req, res) => {
  try {
    const products = db.getProducts();
    const product = products.find(p => p.id === req.params.id);

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
router.post('/', authenticateToken, isAdmin, (req, res) => {
  try {
    const { title, shortTitle, description, price, category, image, specifications } = req.body;

    if (!title || !shortTitle || !price || !category || !image) {
      return res.status(400).json({ message: 'Title, Short Title, Price, Category, and Image are required' });
    }

    const products = db.getProducts();
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
      specifications: specifications || {}
    };

    products.push(newProduct);
    db.saveProducts(products);

    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error while creating product' });
  }
});

// PUT: Update Product (Admin Only)
router.put('/:id', authenticateToken, isAdmin, (req, res) => {
  try {
    const { title, shortTitle, description, price, category, image, specifications } = req.body;
    const products = db.getProducts();
    const index = products.findIndex(p => p.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const existingProduct = products[index];

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

    products[index] = updatedProduct;
    db.saveProducts(products);

    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error while updating product' });
  }
});

// DELETE: Remove Product (Admin Only)
router.delete('/:id', authenticateToken, isAdmin, (req, res) => {
  try {
    const products = db.getProducts();
    const filteredProducts = products.filter(p => p.id !== req.params.id);

    if (products.length === filteredProducts.length) {
      return res.status(404).json({ message: 'Product not found' });
    }

    db.saveProducts(filteredProducts);
    res.json({ message: 'Product successfully deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error while deleting product' });
  }
});

module.exports = router;
