import React, { useState, useEffect } from 'react';
import { getProducts } from '../services/productService';
import { stockIn, stockOut } from '../services/inventoryService';
import Layout from '../components/Layout';

const getStockHealth = (stock, minStock) => {
  if (stock === 0) return { label: 'Out Of Stock', cls: 'badge-red' };
  if (stock < minStock) return { label: 'Critical', cls: 'badge-orange' };
  if (stock < minStock + 20) return { label: 'Low', cls: 'badge-yellow' };
  return { label: 'Healthy', cls: 'badge-green' };
};

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('IN');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [remarks, setRemarks] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
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

  const openModal = (product, type) => {
    setSelectedProduct(product);
    setModalType(type);
    setQuantity('');
    setRemarks('');
    setModalError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quantity || Number(quantity) <= 0) {
      setModalError('Please enter a valid quantity.');
      return;
    }

    setModalLoading(true);
    setModalError('');

    try {
      const payload = { productId: selectedProduct._id, quantity: Number(quantity), remarks };

      if (modalType === 'IN') {
        await stockIn(payload);
        setSuccessMsg(`✅ Stock In: Added ${quantity} units to ${selectedProduct.productName}`);
      } else {
        await stockOut(payload);
        setSuccessMsg(`✅ Stock Out: Removed ${quantity} units from ${selectedProduct.productName}`);
      }

      closeModal();
      fetchProducts();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setModalError(err.response?.data?.message || 'Error updating stock.');
    } finally {
      setModalLoading(false);
    }
  };

  const filtered = products.filter((p) =>
    p.productName.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="page-header">
        <h1>🏭 Inventory Management</h1>
        <p>Update stock levels and track inventory movements.</p>
      </div>

      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      <div className="card">
        <div className="card-header">
          <h2>Stock Overview ({filtered.length} products)</h2>
          <input
            className="search-input"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: '280px' }}
          />
        </div>

        {loading ? (
          <div className="loading">Loading inventory...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏭</div>
            <p>No products found.</p>
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
                    <th>Current Stock</th>
                    <th>Min. Stock</th>
                    <th>Status</th>
                    <th>Location</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => {
                    const health = getStockHealth(p.stock, p.minimumStock);
                    return (
                      <tr key={p._id}>
                        <td><strong>{p.productName}</strong></td>
                        <td style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.8rem' }}>{p.sku}</td>
                        <td>{p.category}</td>
                        <td><strong>{p.stock}</strong></td>
                        <td>{p.minimumStock}</td>
                        <td><span className={`badge ${health.cls}`}>{health.label}</span></td>
                        <td>{p.warehouseLocation || '—'}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => openModal(p, 'IN')}
                            >
                              + Stock In
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => openModal(p, 'OUT')}
                              disabled={p.stock === 0}
                            >
                              − Stock Out
                            </button>
                          </div>
                        </td>
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
                  <div className="mc-inventory-card" key={p._id}>
                    {/* Card Header */}
                    <div className="mc-row mc-row--between">
                      <span className="mc-product-name">{p.productName}</span>
                      <span className={`badge ${health.cls}`}>{health.label}</span>
                    </div>

                    <div className="mc-sku">{p.sku}</div>
                    <div className="mc-divider" />

                    {/* Stock highlight strip */}
                    <div className="mc-stock-strip">
                      <div className="mc-stock-item">
                        <span className="mc-stock-num">{p.stock}</span>
                        <span className="mc-stock-lbl">Current Stock</span>
                      </div>
                      <div className="mc-stock-sep" />
                      <div className="mc-stock-item">
                        <span className="mc-stock-num mc-stock-num--muted">{p.minimumStock}</span>
                        <span className="mc-stock-lbl">Min. Stock</span>
                      </div>
                    </div>

                    <div className="mc-divider" />

                    {/* Fields */}
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

                    {/* Action Buttons */}
                    <div className="mc-actions">
                      <button
                        className="btn btn-success btn-sm mc-btn-half"
                        onClick={() => openModal(p, 'IN')}
                      >
                        + Stock In
                      </button>
                      <button
                        className="btn btn-danger btn-sm mc-btn-half"
                        onClick={() => openModal(p, 'OUT')}
                        disabled={p.stock === 0}
                      >
                        − Stock Out
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Stock Modal */}
      {showModal && selectedProduct && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {modalType === 'IN' ? '📥 Stock In' : '📤 Stock Out'}: {selectedProduct.productName}
              </h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {modalError && <div className="alert alert-error">{modalError}</div>}

                <div className="alert alert-info" style={{ marginBottom: '16px' }}>
                  <strong>Current Stock:</strong> {selectedProduct.stock} units &nbsp;|&nbsp;
                  <strong>Min Stock:</strong> {selectedProduct.minimumStock} units
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Quantity {modalType === 'IN' ? 'to Add' : 'to Remove'} *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={modalType === 'OUT' ? selectedProduct.stock : undefined}
                    className="form-input"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                    placeholder={`Enter quantity (max: ${modalType === 'OUT' ? selectedProduct.stock : '∞'})`}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Remarks (optional)</label>
                  <input
                    className="form-input"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="e.g. Monthly restock, Shipment received..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`btn ${modalType === 'IN' ? 'btn-success' : 'btn-danger'}`}
                  disabled={modalLoading}
                >
                  {modalLoading ? 'Processing...' : modalType === 'IN' ? 'Confirm Stock In' : 'Confirm Stock Out'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Inventory;
