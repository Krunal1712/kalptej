const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, 'products.json');
const USERS_FILE = path.join(__dirname, 'users.json');
const ORDERS_FILE = path.join(__dirname, 'orders.json');

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

module.exports = {
  getProducts: () => readJsonFile(PRODUCTS_FILE),
  saveProducts: (products) => writeJsonFile(PRODUCTS_FILE, products),
  
  getUsers: () => readJsonFile(USERS_FILE),
  saveUsers: (users) => writeJsonFile(USERS_FILE, users),
  
  getOrders: () => readJsonFile(ORDERS_FILE),
  saveOrders: (orders) => writeJsonFile(ORDERS_FILE, orders)
};
