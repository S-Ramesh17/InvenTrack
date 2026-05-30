import React, { useState, useEffect } from 'react';
import { getMovements } from '../services/reportsService';
import Layout from '../components/Layout';

const Reports = () => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, IN, OUT

  useEffect(() => {
    const fetchMovements = async () => {
      try {
        const res = await getMovements();
        setMovements(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovements();
  }, []);

  const filtered = filter === 'ALL' ? movements : movements.filter((m) => m.movementType === filter);

  const totalIn = movements.filter((m) => m.movementType === 'IN').reduce((s, m) => s + m.quantity, 0);
  const totalOut = movements.filter((m) => m.movementType === 'OUT').reduce((s, m) => s + m.quantity, 0);

  return (
    <Layout>
      <div className="page-header">
        <h1>📋 Reports</h1>
        <p>View all stock movement history and analytics.</p>
      </div>

      {/* Summary stat cards */}
      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        <div className="stat-card">
          <div className="stat-icon blue">📊</div>
          <div className="stat-info">
            <h3>{movements.length}</h3>
            <p>Total Movements</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">📥</div>
          <div className="stat-info">
            <h3>{totalIn}</h3>
            <p>Total Units In</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">📤</div>
          <div className="stat-info">
            <h3>{totalOut}</h3>
            <p>Total Units Out</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Stock Movement History</h2>
          <div className="filter-bar" style={{ margin: 0 }}>
            {['ALL', 'IN', 'OUT'].map((f) => (
              <button
                key={f}
                className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter(f)}
              >
                {f === 'ALL' ? 'All' : f === 'IN' ? '📥 In' : '📤 Out'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading movements...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>No stock movements found.</p>
          </div>
        ) : (
          <>
            {/* ── DESKTOP TABLE (>768px) ── */}
            <div className="table-container desktop-table">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Remarks</th>
                    <th>Performed By</th>
                    <th>Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m, idx) => (
                    <tr key={m._id}>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{idx + 1}</td>
                      <td><strong>{m.productId?.productName || 'Deleted Product'}</strong></td>
                      <td style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.8rem' }}>
                        {m.productId?.sku || '—'}
                      </td>
                      <td>
                        <span className={`badge badge-${m.movementType === 'IN' ? 'in' : 'out'}`}>
                          {m.movementType === 'IN' ? '📥 IN' : '📤 OUT'}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: m.movementType === 'IN' ? 'var(--secondary)' : 'var(--danger)' }}>
                          {m.movementType === 'IN' ? '+' : '-'}{m.quantity}
                        </strong>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{m.remarks || '—'}</td>
                      <td>{m.performedBy}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {new Date(m.date).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── MOBILE CARDS (≤768px) ── */}
            <div className="mobile-cards">
              {filtered.map((m, idx) => (
                <div className="mc-report-card" key={m._id}>
                  {/* Header */}
                  <div className="mc-row mc-row--between">
                    <div className="mc-product-meta">
                      <span className="mc-index">#{idx + 1}</span>
                      <span className="mc-product-name">{m.productId?.productName || 'Deleted Product'}</span>
                    </div>
                    <span className={`badge badge-${m.movementType === 'IN' ? 'in' : 'out'}`}>
                      {m.movementType === 'IN' ? '📥 IN' : '📤 OUT'}
                    </span>
                  </div>

                  {m.productId?.sku && (
                    <div className="mc-sku">{m.productId.sku}</div>
                  )}

                  <div className="mc-divider" />

                  {/* Quantity callout */}
                  <div className="mc-qty-callout" data-type={m.movementType}>
                    <span
                      className="mc-qty-num"
                      style={{ color: m.movementType === 'IN' ? 'var(--secondary)' : 'var(--danger)' }}
                    >
                      {m.movementType === 'IN' ? '+' : '-'}{m.quantity}
                    </span>
                    <span className="mc-qty-label">units {m.movementType === 'IN' ? 'added' : 'removed'}</span>
                  </div>

                  <div className="mc-divider" />

                  {/* Detail fields */}
                  <div className="mc-fields">
                    <div className="mc-field">
                      <span className="mc-label">Performed By</span>
                      <span className="mc-value">{m.performedBy}</span>
                    </div>
                    <div className="mc-field">
                      <span className="mc-label">Date & Time</span>
                      <span className="mc-value">{new Date(m.date).toLocaleString()}</span>
                    </div>
                    {m.remarks && (
                      <div className="mc-field mc-field--full">
                        <span className="mc-label">Remarks</span>
                        <span className="mc-value">{m.remarks}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Reports;
