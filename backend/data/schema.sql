CREATE DATABASE IF NOT EXISTS kalptaj_db;
USE kalptaj_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    createdAt DATETIME NOT NULL
);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    shortTitle VARCHAR(100) NOT NULL,
    description TEXT,
    price_mrp INT NOT NULL,
    price_cost INT NOT NULL,
    price_discount INT DEFAULT 0,
    category VARCHAR(100) NOT NULL,
    image VARCHAR(512) NOT NULL,
    rating_rate FLOAT DEFAULT 5.0,
    rating_count INT DEFAULT 1,
    specifications JSON,
    createdAt DATETIME NOT NULL
);

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(50) PRIMARY KEY,
    userId VARCHAR(50) NOT NULL,
    userName VARCHAR(100) NOT NULL,
    userEmail VARCHAR(100) NOT NULL,
    items JSON NOT NULL,
    shippingAddress JSON NOT NULL,
    paymentMethod VARCHAR(50) NOT NULL,
    paymentDetails JSON NOT NULL,
    pricing JSON NOT NULL,
    orderStatus VARCHAR(50) DEFAULT 'Ordered',
    statusTimeline JSON NOT NULL,
    createdAt DATETIME NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
