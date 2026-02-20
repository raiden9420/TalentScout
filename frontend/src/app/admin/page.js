"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function AdminPage() {
  const [candidates, setCandidates] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [scores, setScores] = useState({});

  useEffect(() => {
    Promise.all([
      api.getCandidates().catch(() => []),
      api.getStats().catch(() => null)
    ]).then(([cands, sts]) => {
      setCandidates(cands);
      setStats(sts);
      setLoading(false);
    });
  }, []);

  const toggleExpand = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!scores[id]) {
      try {
        const data = await api.getCandidateScores(id);
        setScores(prev => ({ ...prev, [id]: data }));
      } catch {
        setScores(prev => ({ ...prev, [id]: [] }));
      }
    }
  };

  return (
    <div className="container" style={{ padding: "40px 0" }}>
      <h1 className="text-gradient" style={{ marginBottom: "2rem" }}>Admin Dashboard</h1>

      {stats && (
        <div className="stats-grid">
          <div className="glass stat-card">
            <div className="stat-icon">👥</div>
            <h3>Total Candidates</h3>
            <div className="stat-value">{stats.total_candidates}</div>
          </div>
          <div className="glass stat-card">
            <div className="stat-icon">✅</div>
            <h3>Completed</h3>
            <div className="stat-value">{stats.completed_interviews}</div>
          </div>
          <div className="glass stat-card">
            <div className="stat-icon">📊</div>
            <h3>Avg Score</h3>
            <div className="stat-value">{stats.avg_score}</div>
          </div>
        </div>
      )}

      <div className="glass table-container">
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            Loading candidates...
          </div>
        ) : candidates.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            No candidates yet. Start an interview to see data here.
          </div>
        ) : (
          <table className="candidate-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Position</th>
                <th>Tech Stack</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map(c => (
                <>
                  <tr key={c.id} className="candidate-row" onClick={() => toggleExpand(c.id)}>
                    <td>
                      <span className="expand-icon">{expandedId === c.id ? "▾" : "▸"}</span>
                      {c.name}
                    </td>
                    <td>{c.position}</td>
                    <td>
                      <div className="tech-tags-cell">
                        {(c.tech_stack || "").split(",").slice(0, 3).map((t, i) => (
                          <span key={i} className="mini-tag">{t.trim()}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${c.status?.toLowerCase().replace(" ", "-")}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>{new Date(c.created_at).toLocaleDateString()}</td>
                  </tr>
                  {expandedId === c.id && (
                    <tr key={`${c.id}-detail`} className="detail-row">
                      <td colSpan={5}>
                        <div className="detail-content animate-enter">
                          <div className="detail-info">
                            <span><strong>Email:</strong> {c.email}</span>
                            <span><strong>Experience:</strong> {c.experience} years</span>
                            <span><strong>Location:</strong> {c.location || "—"}</span>
                          </div>
                          {scores[c.id] && scores[c.id].length > 0 ? (
                            <div className="scores-grid">
                              {scores[c.id].map((s, i) => (
                                <div key={i} className="score-item">
                                  <div className="score-cat">{s.category}</div>
                                  <div className="score-val">{s.score}/10</div>
                                  {s.assessment && <div className="score-note">{s.assessment}</div>}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="no-scores">No detailed scores available yet.</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style jsx>{`
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin-bottom: 32px;
                }
                .stat-card {
                    padding: 28px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    transition: transform 0.2s;
                }
                .stat-card:hover { transform: translateY(-2px); }
                .stat-icon {
                    font-size: 2rem;
                    margin-bottom: 8px;
                }
                .stat-card h3 {
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                    margin-bottom: 8px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .stat-value {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .table-container {
                    padding: 0;
                    overflow: hidden;
                }
                .candidate-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .candidate-table th {
                    text-align: left;
                    padding: 16px 20px;
                    color: var(--text-secondary);
                    border-bottom: 1px solid rgba(34, 197, 94, 0.1);
                    font-size: 0.85rem;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    background: rgba(240, 253, 244, 0.4);
                }
                .candidate-table td {
                    padding: 14px 20px;
                    border-bottom: 1px solid rgba(0, 0, 0, 0.04);
                    color: var(--text-primary);
                    font-size: 0.95rem;
                }
                .candidate-row {
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .candidate-row:hover {
                    background: rgba(34, 197, 94, 0.03);
                }
                .expand-icon {
                    margin-right: 8px;
                    color: var(--accent-green);
                    font-size: 0.8rem;
                }

                .tech-tags-cell {
                    display: flex;
                    gap: 6px;
                    flex-wrap: wrap;
                }
                .mini-tag {
                    padding: 2px 8px;
                    background: rgba(34, 197, 94, 0.08);
                    color: var(--accent-green);
                    border-radius: 100px;
                    font-size: 0.75rem;
                    font-weight: 500;
                }

                .status-badge {
                    padding: 4px 12px;
                    border-radius: 100px;
                    font-size: 0.8rem;
                    font-weight: 500;
                    background: rgba(0, 0, 0, 0.04);
                    color: var(--text-muted);
                }
                .status-badge.completed {
                    background: rgba(34, 197, 94, 0.1);
                    color: var(--success);
                }
                .status-badge.in-progress {
                    background: rgba(250, 204, 21, 0.15);
                    color: var(--warning);
                }

                .detail-row td {
                    padding: 0 !important;
                    border-bottom: 1px solid rgba(34, 197, 94, 0.1);
                }
                .detail-content {
                    padding: 20px 24px;
                    background: rgba(240, 253, 244, 0.3);
                }
                .detail-info {
                    display: flex;
                    gap: 24px;
                    flex-wrap: wrap;
                    margin-bottom: 16px;
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                }
                .scores-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                    gap: 12px;
                }
                .score-item {
                    background: white;
                    border: 1px solid rgba(34, 197, 94, 0.1);
                    border-radius: var(--radius-md);
                    padding: 14px;
                }
                .score-cat {
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    color: var(--text-muted);
                    letter-spacing: 0.04em;
                    margin-bottom: 4px;
                }
                .score-val {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--accent-green);
                }
                .score-note {
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                    margin-top: 6px;
                    line-height: 1.4;
                }
                .no-scores {
                    color: var(--text-muted);
                    font-style: italic;
                    font-size: 0.9rem;
                }
            `}</style>
    </div>
  );
}
