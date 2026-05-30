import React, { useState, useEffect } from 'react';
import { getRecommendations, getProductInsight } from '../services/aiService';
import Layout from '../components/Layout';

const AIInsights = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  // Gemini insight modal
  const [insightModal, setInsightModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [insight, setInsight] = useState(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightError, setInsightError] = useState('');

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const res = await getRecommendations();
        setRecommendations(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecs();
  }, []);

  const handleGenerateInsight = async (product) => {
    setSelectedProduct(product);
    setInsight(null);
    setInsightError('');
    setInsightModal(true);
    setInsightLoading(true);

    try {
      const res = await getProductInsight(product._id);
      setInsight(res.data.insight);
    } catch (err) {
      setInsightError(err.response?.data?.message || 'Failed to generate AI insight.');
    } finally {
      setInsightLoading(false);
    }
  };

  const getRiskClass = (risk) => {
    if (!risk) return 'risk-medium';
    const r = risk.toLowerCase();
    if (r === 'low') return 'risk-low';
    if (r === 'medium') return 'risk-medium';
    if (r === 'high') return 'risk-high';
    if (r === 'critical') return 'risk-critical';
    return 'risk-medium';
  };

  const getCardClass = (health) => {
    const s = health?.status || '';
    if (s === 'Healthy') return 'healthy';
    if (s === 'Low') return 'low';
    if (s === 'Critical') return 'critical';
    if (s === 'Out Of Stock') return 'out';
    return '';
  };

  const filtered = filter === 'ALL'
    ? recommendations
    : filter === 'FAST'
    ? recommendations.filter((r) => r.isFastMoving)
    : filter === 'CRITICAL'
    ? recommendations.filter((r) => r.stockHealth.status === 'Critical' || r.stockHealth.status === 'Out Of Stock')
    : filter === 'RESTOCK'
    ? recommendations.filter((r) => r.reorderRecommendation !== 'No Action Required')
    : recommendations;

  return (
    <Layout>
      <div className="page-header">
        <h1>🤖 AI Insights</h1>
        <p>Rule-based stock recommendations and AI-powered product analysis.</p>
      </div>

      {/* Legend */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-body" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '0.85rem' }}>
            <span>📊 <strong>Stock Health:</strong></span>
            <span><span className="badge badge-green">Healthy</span> — Stock ≥ Min + 20</span>
            <span><span className="badge badge-yellow">Low</span> — Stock &lt; Min + 20</span>
            <span><span className="badge badge-orange">Critical</span> — Stock &lt; Min</span>
            <span><span className="badge badge-red">Out Of Stock</span> — Stock = 0</span>
            <span><span className="badge badge-purple">🚀 Fast Moving</span> — Sales &gt; 100/mo</span>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="filter-bar" style={{ marginBottom: '16px' }}>
        {[
          { key: 'ALL', label: 'All Products' },
          { key: 'CRITICAL', label: '🚨 Critical' },
          { key: 'FAST', label: '🚀 Fast Moving' },
          { key: 'RESTOCK', label: '📦 Needs Restock' },
        ].map((f) => (
          <button
            key={f.key}
            className={`btn btn-sm ${filter === f.key ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading">Analyzing inventory...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🤖</div>
          <p>No products match this filter.</p>
        </div>
      ) : (
        <div className="rec-grid">
          {filtered.map((rec) => (
            <div key={rec._id} className={`rec-card ${getCardClass(rec.stockHealth)}`}>
              <h4>{rec.productName}</h4>
              <div className="sku">{rec.sku}</div>

              <div className="rec-meta">
                <span><strong>Stock:</strong> {rec.stock}</span>
                <span><strong>Min:</strong> {rec.minimumStock}</span>
                <span><strong>Sales/mo:</strong> {rec.monthlySales}</span>
              </div>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                <span className={`badge badge-${
                  rec.stockHealth.status === 'Healthy' ? 'green'
                  : rec.stockHealth.status === 'Low' ? 'yellow'
                  : rec.stockHealth.status === 'Critical' ? 'orange'
                  : 'red'
                }`}>
                  {rec.stockHealth.status}
                </span>
                {rec.isFastMoving && (
                  <span className="badge badge-purple">🚀 Fast Moving</span>
                )}
              </div>

              <div className="rec-footer">
                <span className="reorder-text">
                  💡 {rec.reorderRecommendation}
                </span>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => handleGenerateInsight(rec)}
                >
                  🤖 AI Insight
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Insight Modal */}
      {insightModal && (
        <div className="modal-overlay" onClick={() => setInsightModal(false)}>
          <div className="modal" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🤖 AI Insight — {selectedProduct?.productName}</h3>
              <button className="modal-close" onClick={() => setInsightModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              {insightLoading && (
                <div className="loading" style={{ padding: '30px' }}>
                  Generating AI insight from Gemini...
                </div>
              )}

              {insightError && (
                <div className="alert alert-error">{insightError}</div>
              )}

              {insight && !insightLoading && (
                <div className="insight-card">
                  {/* Inventory Health */}
                  <div className="insight-field">
                    <h4>Inventory Health</h4>
                    <p>{insight.inventoryHealth || 'N/A'}</p>
                  </div>

                  {/* Risk Level */}
                  <div className="insight-field">
                    <h4>Risk Level</h4>
                    <span className={`risk-badge ${getRiskClass(insight.riskLevel)}`}>
                      {insight.riskLevel || 'Unknown'}
                    </span>
                  </div>

                  {/* Suggested Reorder */}
                  <div className="insight-field">
                    <h4>Suggested Reorder Quantity</h4>
                    <p>{insight.suggestedReorderQuantity || 'N/A'}</p>
                  </div>

                  {/* Improvement Suggestions */}
                  {insight.improvementSuggestions && (
                    <div className="insight-field">
                      <h4>Improvement Suggestions</h4>
                      <ul className="suggestion-list">
                        {(Array.isArray(insight.improvementSuggestions)
                          ? insight.improvementSuggestions
                          : [insight.improvementSuggestions]
                        ).map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Raw fallback */}
                  {insight.rawResponse && (
                    <div className="insight-field">
                      <h4>AI Response</h4>
                      <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem' }}>{insight.rawResponse}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setInsightModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AIInsights;
