import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { Edit2, Trash2, Plus, RefreshCw, ShoppingBag, ClipboardList } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { token, user, API_URL, fetchProducts, products } = useContext(ShopContext);
  const navigate = useNavigate();

  // Route security
  useEffect(() => {
    if (!token || !user || user.role !== 'admin') {
      navigate('/');
    }
  }, [token, user, navigate]);

  const [activeTab, setActiveTab] = useState('products');
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Form States
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProductId, setCurrentProductId] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    shortTitle: '',
    description: '',
    category: 'Mobiles',
    image: '',
    mrp: '',
    cost: '',
    specifications: ''
  });

  const [msg, setMsg] = useState({ type: '', text: '' });

  // Fetch all orders
  const fetchAllOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch(`${API_URL}/orders/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setOrders(data);
      }
    } catch (err) {
      console.error('Error fetching all orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchAllOrders();
    }
  }, [activeTab]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    // Format request body
    const specsObject = {};
    if (formData.specifications) {
      formData.specifications.split('\n').forEach(line => {
        const parts = line.split(':');
        if (parts.length >= 2) {
          specsObject[parts[0].trim()] = parts.slice(1).join(':').trim();
        }
      });
    }

    const payload = {
      title: formData.title,
      shortTitle: formData.shortTitle,
      description: formData.description,
      category: formData.category,
      image: formData.image,
      price: {
        mrp: Number(formData.mrp),
        cost: Number(formData.cost)
      },
      specifications: specsObject
    };

    try {
      const url = isEditing ? `${API_URL}/products/${currentProductId}` : `${API_URL}/products`;
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        setMsg({ type: 'success', text: isEditing ? 'Product updated!' : 'Product added successfully!' });
        setShowForm(false);
        setIsEditing(false);
        // Refresh catalog list
        fetchProducts();
      } else {
        setMsg({ type: 'error', text: data.message || 'Operation failed' });
      }
    } catch (error) {
      console.error('Submit product error:', error);
      setMsg({ type: 'error', text: 'Server error occurred' });
    }
  };

  const handleEditClick = (product) => {
    setIsEditing(true);
    setCurrentProductId(product.id);
    
    // Format specs back to textarea format
    const specsString = Object.entries(product.specifications || {})
      .map(([key, val]) => `${key}: ${val}`)
      .join('\n');

    setFormData({
      title: product.title,
      shortTitle: product.shortTitle,
      description: product.description || '',
      category: product.category,
      image: product.image,
      mrp: product.price.mrp,
      cost: product.price.cost,
      specifications: specsString
    });
    setShowForm(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const res = await fetch(`${API_URL}/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setMsg({ type: 'success', text: 'Product deleted' });
        fetchProducts();
      } else {
        const data = await res.json();
        setMsg({ type: 'error', text: data.message || 'Delete failed' });
      }
    } catch (error) {
      console.error('Delete product error:', error);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setMsg({ type: 'success', text: `Order ${orderId} updated to ${newStatus}` });
        fetchAllOrders();
      } else {
        const data = await res.json();
        setMsg({ type: 'error', text: data.message || 'Status update failed' });
      }
    } catch (error) {
      console.error('Status update error:', error);
    }
  };

  const openAddForm = () => {
    setIsEditing(false);
    setFormData({
      title: '',
      shortTitle: '',
      description: '',
      category: 'Mobiles',
      image: '',
      mrp: '',
      cost: '',
      specifications: ''
    });
    setShowForm(true);
  };

  return (
    <div className="admin-page container animate-fade-in">
      <div className="admin-header flex justify-between align-center">
        <h2>Admin Portal</h2>
        <div className="admin-tabs flex">
          <button 
            className={`admin-tab ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <ShoppingBag size={16} /> Manage Products
          </button>
          <button 
            className={`admin-tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ClipboardList size={16} /> Manage Orders
          </button>
        </div>
      </div>

      {msg.text && (
        <div className={`admin-msg ${msg.type === 'success' ? 'success' : 'error'}`}>
          {msg.text}
        </div>
      )}

      {/* ----------------- PRODUCTS SECTION ----------------- */}
      {activeTab === 'products' && (
        <div className="admin-content-card">
          <div className="table-header-row flex justify-between align-center">
            <h3>Products Inventory</h3>
            {!showForm && (
              <button onClick={openAddForm} className="btn-add-product">
                <Plus size={16} /> Add New Product
              </button>
            )}
          </div>

          {showForm && (
            <form onSubmit={handleFormSubmit} className="product-form animate-scale-in">
              <h4>{isEditing ? 'Edit Product Details' : 'Create Product Catalog Entry'}</h4>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Full Product Title</label>
                  <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Short Title (For Cards)</label>
                  <input type="text" name="shortTitle" value={formData.shortTitle} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange}>
                    <option value="Mobiles">Mobiles</option>
                    <option value="Laptops">Laptops</option>
                    <option value="Audio">Audio</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Home">Home</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Product Image Link</label>
                  <input type="url" name="image" value={formData.image} onChange={handleInputChange} placeholder="URL" required />
                </div>
                <div className="form-group">
                  <label>Original MRP (₹)</label>
                  <input type="number" name="mrp" value={formData.mrp} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Selling Cost Price (₹)</label>
                  <input type="number" name="cost" value={formData.cost} onChange={handleInputChange} required />
                </div>
              </div>
              
              <div className="form-group mt-16">
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" />
              </div>

              <div className="form-group mt-16">
                <label>Specifications (One pair per line - format: `Key : Value`)</label>
                <textarea 
                  name="specifications" 
                  value={formData.specifications} 
                  onChange={handleInputChange} 
                  placeholder="Model: Vivobook&#13;RAM: 8 GB&#13;Storage: 512 GB SSD"
                  rows="4" 
                />
              </div>

              <div className="form-actions mt-16 flex gap-2">
                <button type="submit" className="btn-save">{isEditing ? 'Update Catalog' : 'Add to Catalog'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-cancel">Cancel</button>
              </div>
            </form>
          )}

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Thumbnail</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Original Price</th>
                  <th>Discount Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td>
                      <img src={p.image} alt="" className="table-img" />
                    </td>
                    <td><strong className="table-title">{p.shortTitle}</strong></td>
                    <td>{p.category}</td>
                    <td>₹{p.price.mrp.toLocaleString()}</td>
                    <td>₹{p.price.cost.toLocaleString()}</td>
                    <td>
                      <div className="actions-cell flex gap-2">
                        <button onClick={() => handleEditClick(p)} className="action-icon-btn edit-btn" title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDeleteProduct(p.id)} className="action-icon-btn delete-btn" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ----------------- ORDERS SECTION ----------------- */}
      {activeTab === 'orders' && (
        <div className="admin-content-card">
          <div className="table-header-row flex justify-between align-center">
            <h3>Global Customer Orders</h3>
            <button onClick={fetchAllOrders} className="refresh-btn flex align-center gap-1">
              <RefreshCw size={14} /> Refresh List
            </button>
          </div>

          {ordersLoading ? (
            <p>Loading active orders...</p>
          ) : orders.length === 0 ? (
            <p>No orders registered in the system yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer Details</th>
                    <th>Ordered Items</th>
                    <th>Final Amount</th>
                    <th>Update Tracking Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td><span className="order-id-badge">{order.id}</span></td>
                      <td>
                        <div className="customer-info">
                          <strong>{order.userName}</strong>
                          <p>{order.userEmail}</p>
                          <p className="phone">{order.shippingAddress.phone}</p>
                        </div>
                      </td>
                      <td>
                        <div className="ordered-items-cell">
                          {order.items.map(item => (
                            <div key={item.id} className="small-item-preview">
                              {item.shortTitle} <strong>x {item.qty}</strong>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td><strong>₹{order.pricing.finalAmount.toLocaleString()}</strong></td>
                      <td>
                        <select 
                          value={order.orderStatus} 
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className="status-select"
                        >
                          <option value="Ordered">Ordered</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
