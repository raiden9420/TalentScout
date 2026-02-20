"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="home-container">
      <div className="hero-section">
        <div className={`hero-content ${mounted ? "animate-enter" : ""}`}>
          <div className="badge-pill">🌿 AI-Powered Hiring Assistant</div>

          <h1 className="hero-title">
            Smart Interviews,<br />
            <span className="text-gradient">Smarter Hiring</span>
          </h1>

          <p className="hero-subtitle">
            Conduct adaptive, conversational AI interviews tailored to each candidate.
            Get instant scoring, insightful reports, and streamlined hiring decisions.
          </p>

          <div className="hero-buttons">
            <Link href="/interview" className="btn btn-primary btn-lg">
              Start Interview →
            </Link>
            <Link href="/admin" className="btn btn-secondary btn-lg">
              Admin Dashboard
            </Link>
          </div>
        </div>

        {/* Feature cards */}
        <div className={`features-grid ${mounted ? "animate-slide-up" : ""}`} style={{ animationDelay: "0.3s" }}>
          <div className="feature-card glass">
            <div className="feature-icon">🤖</div>
            <h3>AI Interviewer</h3>
            <p>Dynamic questions that adapt to each candidate's answers and experience level.</p>
          </div>
          <div className="feature-card glass">
            <div className="feature-icon">📄</div>
            <h3>Resume Analysis</h3>
            <p>Instant keyword matching and ATS scoring for uploaded PDF resumes.</p>
          </div>
          <div className="feature-card glass">
            <div className="feature-icon">📊</div>
            <h3>HR Dashboard</h3>
            <p>Track candidates, view scores, and get AI-generated hiring recommendations.</p>
          </div>
        </div>
      </div>

      <style jsx>{`
                .home-container {
                    min-height: calc(100vh - 80px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    overflow: hidden;
                }
                .hero-section {
                    text-align: center;
                    position: relative;
                    z-index: 10;
                    padding: 0 24px;
                    max-width: 1000px;
                }
                .badge-pill {
                    display: inline-block;
                    padding: 8px 20px;
                    border-radius: 100px;
                    background: rgba(34, 197, 94, 0.08);
                    border: 1px solid rgba(34, 197, 94, 0.2);
                    font-size: 0.9rem;
                    color: var(--accent-green);
                    margin-bottom: 28px;
                    font-weight: 500;
                    letter-spacing: 0.02em;
                }
                .hero-title {
                    font-size: clamp(2.8rem, 6vw, 4.5rem);
                    font-weight: 800;
                    line-height: 1.08;
                    margin-bottom: 24px;
                    letter-spacing: -0.03em;
                    color: var(--text-primary);
                }
                .hero-subtitle {
                    font-size: 1.15rem;
                    color: var(--text-secondary);
                    max-width: 600px;
                    margin: 0 auto 40px;
                    line-height: 1.7;
                }
                .hero-buttons {
                    display: flex;
                    gap: 16px;
                    justify-content: center;
                    margin-bottom: 60px;
                }
                .btn-lg {
                    padding: 16px 32px;
                    font-size: 1.05rem;
                }
                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                    margin-top: 20px;
                    opacity: 0;
                }
                .feature-card {
                    padding: 32px 24px;
                    text-align: center;
                    transition: transform 0.3s, box-shadow 0.3s;
                }
                .feature-card:hover {
                    transform: translateY(-4px);
                    box-shadow: var(--shadow-lg);
                }
                .feature-icon {
                    font-size: 2.5rem;
                    margin-bottom: 16px;
                }
                .feature-card h3 {
                    font-size: 1.1rem;
                    font-weight: 600;
                    margin-bottom: 10px;
                    color: var(--text-primary);
                }
                .feature-card p {
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                    line-height: 1.5;
                }

                @media (max-width: 768px) {
                    .features-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
    </div>
  );
}
