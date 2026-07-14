const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const PRODUCTS_FILE = path.join(__dirname, 'products.json');
const USERS_FILE = path.join(__dirname, 'users.json');
const ORDERS_FILE = path.join(__dirname, 'orders.json');

// Read/write JSON helpers for fallback
function readJsonFile(filePath, defaultData = []) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf8');
      return defaultData;
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data || JSON.stringify(defaultData));
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return defaultData;
  }
}

function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing to file ${filePath}:`, error);
    return false;
  }
}

// Database Connection State
let useMySQL = false;
let pool = null;

// Initialize connection
async function initDB() {
  const host = process.env.DB_HOST;
  const isRender = process.env.RENDER || false;
  
  // Only attempt MySQL if we are NOT on Render OR if a custom database host is configured
  // (We don't want to try localhost on Render since it will fail)
  const shouldTryMySQL = host && (!isRender || (host !== 'localhost' && host !== '127.0.0.1'));

  if (shouldTryMySQL) {
    try {
      const dbConfig = {
        host: host,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'kalptaj_db',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        connectTimeout: 3000 // 3 seconds timeout
      };

      pool = mysql.createPool(dbConfig);
      // Test connection
      const conn = await pool.getConnection();
      conn.release();
      useMySQL = true;
      console.log('✅ Database: Connected to MySQL successfully!');
    } catch (err) {
      console.warn('⚠️ Database: MySQL connection failed. Falling back to local JSON database. Error:', err.message);
      useMySQL = false;
    }
  } else {
    console.log('ℹ️ Database: Running with local JSON database fallback.');
    useMySQL = false;
  }
}

// Trigger lazy init or execute on load
initDB();

// Helper for executing queries (only if MySQL is enabled)
async function query(sql, params) {
  if (!useMySQL || !pool) return [];
  const [results] = await pool.query(sql, params);
  return results;
}

// Map database product row to Frontend format
function mapProduct(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    shortTitle: row.shortTitle,
    description: row.description,
    price: {
      mrp: row.price_mrp,
      cost: row.price_cost,
      discount: row.price_discount
    },
    category: row.category,
    image: row.image,
    rating: {
      rate: row.rating_rate,
      count: row.rating_count
    },
    specifications: typeof row.specifications === 'string' ? JSON.parse(row.specifications) : row.specifications,
    createdAt: row.createdAt
  };
}

// Map database order row to Frontend format
function mapOrder(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.userId,
    userName: row.userName,
    userEmail: row.userEmail,
    items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
    shippingAddress: typeof row.shippingAddress === 'string' ? JSON.parse(row.shippingAddress) : row.shippingAddress,
    paymentMethod: row.paymentMethod,
    paymentDetails: typeof row.paymentDetails === 'string' ? JSON.parse(row.paymentDetails) : row.paymentDetails,
    pricing: typeof row.pricing === 'string' ? JSON.parse(row.pricing) : row.pricing,
    orderStatus: row.orderStatus,
    statusTimeline: typeof row.statusTimeline === 'string' ? JSON.parse(row.statusTimeline) : row.statusTimeline,
    createdAt: row.createdAt
  };
}

module.exports = {
  // Users Helpers
  getUsers: async () => {
    if (useMySQL) {
      return await query('SELECT * FROM users');
    } else {
      return readJsonFile(USERS_FILE);
    }
  },
  
  findUserByEmail: async (email) => {
    if (useMySQL) {
      const rows = await query('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email]);
      return rows[0] || null;
    } else {
      const users = readJsonFile(USERS_FILE);
      return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
    }
  },

  createUser: async (user) => {
    if (useMySQL) {
      await query(
        'INSERT INTO users (id, name, email, password, role, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
        [user.id, user.name, user.email, user.password, user.role, user.createdAt]
      );
    } else {
      const users = readJsonFile(USERS_FILE);
      users.push(user);
      writeJsonFile(USERS_FILE, users);
    }
    return user;
  },

  // Products Helpers
  getProducts: async (search = '', category = '') => {
    if (useMySQL) {
      let sql = 'SELECT * FROM products';
      const params = [];
      const conditions = [];

      if (category) {
        conditions.push('LOWER(category) = LOWER(?)');
        params.push(category);
      }

      if (search) {
        conditions.push('(LOWER(title) LIKE ? OR LOWER(shortTitle) LIKE ? OR LOWER(description) LIKE ? OR LOWER(category) LIKE ?)');
        const searchWildcard = `%${search.toLowerCase()}%`;
        params.push(searchWildcard, searchWildcard, searchWildcard, searchWildcard);
      }

      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }

      const rows = await query(sql, params);
      return rows.map(mapProduct);
    } else {
      let products = readJsonFile(PRODUCTS_FILE);
      if (category) {
        products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
      }
      if (search) {
        const queryStr = search.toLowerCase();
        products = products.filter(p => 
          p.title.toLowerCase().includes(queryStr) || 
          p.shortTitle.toLowerCase().includes(queryStr) ||
          p.description.toLowerCase().includes(queryStr) ||
          p.category.toLowerCase().includes(queryStr)
        );
      }
      return products;
    }
  },

  getProductById: async (id) => {
    if (useMySQL) {
      const rows = await query('SELECT * FROM products WHERE id = ?', [id]);
      return rows[0] ? mapProduct(rows[0]) : null;
    } else {
      const products = readJsonFile(PRODUCTS_FILE);
      return products.find(p => p.id === id) || null;
    }
  },

  createProduct: async (product) => {
    if (useMySQL) {
      await query(
        'INSERT INTO products (id, title, shortTitle, description, price_mrp, price_cost, price_discount, category, image, rating_rate, rating_count, specifications, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          product.id,
          product.title,
          product.shortTitle,
          product.description,
          product.price.mrp,
          product.price.cost,
          product.price.discount,
          product.category,
          product.image,
          product.rating.rate,
          product.rating.count,
          JSON.stringify(product.specifications || {}),
          product.createdAt || new Date().toISOString()
        ]
      );
    } else {
      const products = readJsonFile(PRODUCTS_FILE);
      products.push(product);
      writeJsonFile(PRODUCTS_FILE, products);
    }
    return product;
  },

  updateProduct: async (id, product) => {
    if (useMySQL) {
      await query(
        'UPDATE products SET title = ?, shortTitle = ?, description = ?, price_mrp = ?, price_cost = ?, price_discount = ?, category = ?, image = ?, specifications = ? WHERE id = ?',
        [
          product.title,
          product.shortTitle,
          product.description,
          product.price.mrp,
          product.price.cost,
          product.price.discount,
          product.category,
          product.image,
          JSON.stringify(product.specifications || {}),
          id
        ]
      );
      return await module.exports.getProductById(id);
    } else {
      const products = readJsonFile(PRODUCTS_FILE);
      const index = products.findIndex(p => p.id === id);
      if (index !== -1) {
        products[index] = { ...products[index], ...product };
        writeJsonFile(PRODUCTS_FILE, products);
        return products[index];
      }
      return null;
    }
  },

  deleteProduct: async (id) => {
    if (useMySQL) {
      const result = await query('DELETE FROM products WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } else {
      const products = readJsonFile(PRODUCTS_FILE);
      const filtered = products.filter(p => p.id !== id);
      if (products.length !== filtered.length) {
        writeJsonFile(PRODUCTS_FILE, filtered);
        return true;
      }
      return false;
    }
  },

  // Orders Helpers
  getOrders: async () => {
    if (useMySQL) {
      const rows = await query('SELECT * FROM orders ORDER BY createdAt DESC');
      return rows.map(mapOrder);
    } else {
      const orders = readJsonFile(ORDERS_FILE);
      orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return orders;
    }
  },

  getUserOrders: async (userId) => {
    if (useMySQL) {
      const rows = await query('SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC', [userId]);
      return rows.map(mapOrder);
    } else {
      const orders = readJsonFile(ORDERS_FILE);
      const userOrders = orders.filter(o => o.userId === userId);
      userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return userOrders;
    }
  },

  createOrder: async (order) => {
    if (useMySQL) {
      await query(
        'INSERT INTO orders (id, userId, userName, userEmail, items, shippingAddress, paymentMethod, paymentDetails, pricing, orderStatus, statusTimeline, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          order.id,
          order.userId,
          order.userName,
          order.userEmail,
          JSON.stringify(order.items),
          JSON.stringify(order.shippingAddress),
          order.paymentMethod,
          JSON.stringify(order.paymentDetails),
          JSON.stringify(order.pricing),
          order.orderStatus,
          JSON.stringify(order.statusTimeline),
          order.createdAt
        ]
      );
    } else {
      const orders = readJsonFile(ORDERS_FILE);
      orders.push(order);
      writeJsonFile(ORDERS_FILE, orders);
    }
    return order;
  },

  updateOrderStatus: async (id, status, statusTimeline) => {
    if (useMySQL) {
      await query(
        'UPDATE orders SET orderStatus = ?, statusTimeline = ? WHERE id = ?',
        [status, JSON.stringify(statusTimeline), id]
      );
      const rows = await query('SELECT * FROM orders WHERE id = ?', [id]);
      return rows[0] ? mapOrder(rows[0]) : null;
    } else {
      const orders = readJsonFile(ORDERS_FILE);
      const index = orders.findIndex(o => o.id === id);
      if (index !== -1) {
        orders[index].orderStatus = status;
        orders[index].statusTimeline = statusTimeline;
        writeJsonFile(ORDERS_FILE, orders);
        return orders[index];
      }
      return null;
    }
  }
};
