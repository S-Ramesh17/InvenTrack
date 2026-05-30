import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/productService';
import Layout from '../components/Layout';

// Stock health helper
const getStockHealth = (stock, minStock) => {
  if (stock === 0) return { label: 'Out Of Stock', cls: 'badge-red' };
  if (stock < minStock) return { label: 'Critical', cls: 'badge-orange' };
  if (stock < minStock + 20) return { label: 'Low', cls: 'badge-yellow' };
  return { label: 'Healthy', cls: 'badge-green' };
};

const emptyForm = {
  productName: '', sku: '', category: '', price: '',
  stock: '', minimumStock: '', monthlySales: '', warehouseLocation: ''
};

const Products = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setForm({
      productName: product.productName,
      sku: product.sku,
      category: product.category,
      price: product.price,
      stock: product.stock,
      minimumStock: product.minimumStock,
      monthlySales: product.monthlySales,
      warehouseLocation: product.warehouseLocation,
    });
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setForm(emptyForm);
    setFormError('');
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id, form);
        setSuccessMsg('Product updated successfully.');
      } else {
        await createProduct(form);
        setSuccessMsg('Product added successfully.');
      }
      closeModal();
      fetchProducts();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error saving product.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteProduct(id);
      setSuccessMsg('Product deleted.');
      fetchProducts();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting product.');
    }
  };

  const filtered = products.filter((p) =>
    p.productName.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="page-header">
        <h1>📦 Products</h1>
        <p>Manage your product catalog and inventory items.</p>
      </div>

      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      <div className="card">
        <div className="card-header">
          <h2>All Products ({filtered.length})</h2>
          <div className="filter-bar" style={{ margin: 0 }}>
            <input
              className="search-input"
              placeholder="Search by name, SKU, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {isAdmin && (
              <button className="btn btn-primary" onClick={openAddModal}>
                + Add Product
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading products...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <p>No products found. {isAdmin && 'Click "Add Product" to get started.'}</p>
          </div>
        ) : (
          <>
            {/* ── DESKTOP TABLE (>768px) ── */}
            <div className="table-container desktop-table">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Location</th>
                    {isAdmin && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => {
                    const health = getStockHealth(p.stock, p.minimumStock);
                    return (
                      <tr key={p._id}>
                        <td>
                          <strong>{p.productName}</strong>
                          {p.monthlySales > 100 && (
                            <span className="badge badge-purple" style={{ marginLeft: '6px', fontSize: '0.65rem' }}>
                              🚀 Fast Moving
                            </span>
                          )}
                        </td>
                        <td style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.8rem' }}>{p.sku}</td>
                        <td>{p.category}</td>
                        <td>${Number(p.price).toFixed(2)}</td>
                        <td><strong>{p.stock}</strong></td>
                        <td><span className={`badge ${health.cls}`}>{health.label}</span></td>
                        <td>{p.warehouseLocation || '—'}</td>
                        {isAdmin && (
                          <td>
                            <div className="action-buttons">
                              <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(p)}>
                                ✏️ Edit
                              </button>
                              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id, p.productName)}>
                                🗑️
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── MOBILE CARDS (≤768px) ── */}
            <div className="mobile-cards">
              {filtered.map((p) => {
                const health = getStockHealth(p.stock, p.minimumStock);
                return (
                  <div className="mc-product-card" key={p._id}>
                    {/* Header row */}
                    <div className="mc-row mc-row--between">
                      <div className="mc-product-meta">
                        <span className="mc-product-name">{p.productName}</span>
                        {p.monthlySales > 100 && (
                          <span className="badge badge-purple mc-fast-badge">🚀 Fast Moving</span>
                        )}
                      </div>
                      <span className={`badge ${health.cls}`}>{health.label}</span>
                    </div>

                    <div className="mc-sku">{p.sku}</div>
                    <div className="mc-divider" />

                    {/* Price + Stock strip */}
                    <div className="mc-stock-strip">
                      <div className="mc-stock-item">
                        <span className="mc-stock-num mc-stock-num--price">${Number(p.price).toFixed(2)}</span>
                        <span className="mc-stock-lbl">Price</span>
                      </div>
                      <div className="mc-stock-sep" />
                      <div className="mc-stock-item">
                        <span className="mc-stock-num">{p.stock}</span>
                        <span className="mc-stock-lbl">Stock</span>
                      </div>
                    </div>

                    <div className="mc-divider" />

                    {/* Detail fields */}
                    <div className="mc-fields">
                      <div className="mc-field">
                        <span className="mc-label">Category</span>
                        <span className="mc-value">{p.category}</span>
                      </div>
                      <div className="mc-field">
                        <span className="mc-label">Location</span>
                        <span className="mc-value">{p.warehouseLocation || '—'}</span>
                      </div>
                    </div>

                    {/* Admin actions */}
                    {isAdmin && (
                      <div className="mc-actions">
                        <button
                          className="btn btn-secondary btn-sm mc-btn-half"
                          onClick={() => openEditModal(p)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm mc-btn-half"
                          onClick={() => handleDelete(p._id, p.productName)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {formError && <div className="alert alert-error">{formError}</div>}

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Product Name *</label>
                    <input name="productName" className="form-input" value={form.productName}
                      onChange={handleFormChange} required placeholder="Laptop Pro X" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">SKU *</label>
                    <input name="sku" className="form-input" value={form.sku}
                      onChange={handleFormChange} required placeholder="LPT-001" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <input name="category" className="form-input" value={form.category}
                      onChange={handleFormChange} required placeholder="Electronics" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price *</label>
                    <input name="price" type="number" min="0" step="0.01" className="form-input"
                      value={form.price} onChange={handleFormChange} required placeholder="999.99" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Current Stock</label>
                    <input name="stock" type="number" min="0" className="form-input"
                      value={form.stock} onChange={handleFormChange} placeholder="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Minimum Stock</label>
                    <input name="minimumStock" type="number" min="0" className="form-input"
                      value={form.minimumStock} onChange={handleFormChange} placeholder="10" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Monthly Sales</label>
                    <input name="monthlySales" type="number" min="0" className="form-input"
                      value={form.monthlySales} onChange={handleFormChange} placeholder="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Warehouse Location</label>
                    <input name="warehouseLocation" className="form-input" value={form.warehouseLocation}
                      onChange={handleFormChange} placeholder="Aisle A-12" />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Products;
