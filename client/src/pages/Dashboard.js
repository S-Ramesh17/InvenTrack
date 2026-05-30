import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSummary } from '../services/reportsService';
import { getMovements } from '../services/reportsService';
import Layout from '../components/Layout';

const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [recentMovements, setRecentMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const summaryRes = await getSummary();
        setSummary(summaryRes.data);

        if (user?.role === 'admin') {
          const movRes = await getMovements();
          setRecentMovements(movRes.data.slice(0, 5));
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) return <Layout><div className="loading">Loading dashboard...</div></Layout>;

  return (
    <Layout>
      <div className="page-header">
        <h1>👋 Hello, {user?.name?.split(' ')[0] || 'User'}</h1>
        <p>
          {user?.role === 'admin'
            ? 'Here is your inventory overview for today.'
            : 'Here is your activity summary.'}
        </p>
      </div>

      {/* Admin Stats */}
      {user?.role === 'admin' && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">📦</div>
            <div className="stat-info">
              <h3>{summary?.totalProducts ?? 0}</h3>
              <p>Total Products</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">🏭</div>
            <div className="stat-info">
              <h3>{summary?.totalInventory ?? 0}</h3>
              <p>Total Inventory Units</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon red">🚨</div>
            <div className="stat-info">
              <h3>{summary?.criticalStock ?? 0}</h3>
              <p>Critical Stock Items</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon yellow">⚠️</div>
            <div className="stat-info">
              <h3>{summary?.lowStock ?? 0}</h3>
              <p>Low Stock Items</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon purple">🚀</div>
            <div className="stat-info">
              <h3>{summary?.fastMoving ?? 0}</h3>
              <p>Fast Moving Products</p>
            </div>
          </div>
        </div>
      )}

      {/* Staff Stats */}
      {user?.role === 'staff' && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">📦</div>
            <div className="stat-info">
              <h3>{summary?.totalProducts ?? 0}</h3>
              <p>Total Products</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">✅</div>
            <div className="stat-info">
              <h3>{summary?.todayMovements ?? 0}</h3>
              <p>Stock Updates Today</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon red">🚨</div>
            <div className="stat-info">
              <h3>{summary?.criticalStock ?? 0}</h3>
              <p>Critical Items</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity for Admin */}
      {user?.role === 'admin' && recentMovements.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2>📋 Recent Stock Movements</h2>
          </div>

          {/* ── DESKTOP TABLE (>768px) ── */}
          <div className="table-container desktop-table">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Performed By</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentMovements.map((m) => (
                  <tr key={m._id}>
                    <td>{m.productId?.productName || 'Unknown'}</td>
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
                    <td>{m.performedBy}</td>
                    <td>{new Date(m.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── MOBILE CARDS (≤768px) ── */}
          <div className="mobile-cards">
            {recentMovements.map((m) => (
              <div className="mc-movement-card" key={m._id}>
                <div className="mc-row mc-row--between">
                  <span className="mc-product-name">{m.productId?.productName || 'Unknown'}</span>
                  <span className={`badge badge-${m.movementType === 'IN' ? 'in' : 'out'}`}>
                    {m.movementType === 'IN' ? '📥 IN' : '📤 OUT'}
                  </span>
                </div>
                <div className="mc-divider" />
                <div className="mc-fields">
                  <div className="mc-field">
                    <span className="mc-label">Quantity</span>
                    <span
                      className="mc-value mc-value--bold"
                      style={{ color: m.movementType === 'IN' ? 'var(--secondary)' : 'var(--danger)' }}
                    >
                      {m.movementType === 'IN' ? '+' : '-'}{m.quantity}
                    </span>
                  </div>
                  <div className="mc-field">
                    <span className="mc-label">By</span>
                    <span className="mc-value">{m.performedBy}</span>
                  </div>
                  <div className="mc-field">
                    <span className="mc-label">Date</span>
                    <span className="mc-value">{new Date(m.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Out of stock alert */}
      {summary?.outOfStock > 0 && (
        <div className="alert alert-error" style={{ marginTop: '16px' }}>
          ⚠️ <strong>{summary.outOfStock} product(s)</strong> are out of stock. Please update inventory immediately.
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;
