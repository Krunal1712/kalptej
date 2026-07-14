const mysql = require('mysql2/promise');

// Setup connection config from environment variables
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'kalptaj_db',
  port: parseInt(process.env.DB_PORT || '3306', 10)
};

const pool = mysql.createPool(dbConfig);

// Helper for executing queries
async function query(sql, params) {
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
  pool,
  query,

  // Users Helpers
  getUsers: async () => {
    return await query('SELECT * FROM users');
  },
  
  findUserByEmail: async (email) => {
    const rows = await query('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email]);
    return rows[0] || null;
  },

  createUser: async (user) => {
    await query(
      'INSERT INTO users (id, name, email, password, role, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
      [user.id, user.name, user.email, user.password, user.role, user.createdAt]
    );
    return user;
  },

  // Products Helpers
  getProducts: async (search = '', category = '') => {
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
  },

  getProductById: async (id) => {
    const rows = await query('SELECT * FROM products WHERE id = ?', [id]);
    return rows[0] ? mapProduct(rows[0]) : null;
  },

  createProduct: async (product) => {
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
    return product;
  },

  updateProduct: async (id, product) => {
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
  },

  deleteProduct: async (id) => {
    const result = await query('DELETE FROM products WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  // Orders Helpers
  getOrders: async () => {
    const rows = await query('SELECT * FROM orders ORDER BY createdAt DESC');
    return rows.map(mapOrder);
  },

  getUserOrders: async (userId) => {
    const rows = await query('SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC', [userId]);
    return rows.map(mapOrder);
  },

  createOrder: async (order) => {
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
    return order;
  },

  updateOrderStatus: async (id, status, statusTimeline) => {
    await query(
      'UPDATE orders SET orderStatus = ?, statusTimeline = ? WHERE id = ?',
      [status, JSON.stringify(statusTimeline), id]
    );
    const rows = await query('SELECT * FROM orders WHERE id = ?', [id]);
    return rows[0] ? mapOrder(rows[0]) : null;
  }
};
