"use client";
import { useState } from "react";
import { api } from "@/lib/api";

export default function ResumePage() {
    const [file, setFile] = useState(null);
    const [candidateId, setCandidateId] = useState("");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showIdInput, setShowIdInput] = useState(false);

    const handleAnalyze = async () => {
        if (!file) return;
        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("candidate_id", candidateId || "00000000-0000-0000-0000-000000000000");

        try {
            const res = await api.analyzeResume(formData);
            setResult(res);
        } catch (err) {
            alert("Analysis failed: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container resume-page">
            <div className="glass resume-uploader">
                <h1 className="text-gradient">Resume Analyzer</h1>
                <p className="subtitle">
                    Upload a PDF resume to check keyword compatibility and get instant AI-powered feedback.
                </p>

                <div className={`drop-zone ${file ? "has-file" : ""}`}>
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setFile(e.target.files[0])}
                        id="file-upload"
                        className="file-input"
                    />
                    <label htmlFor="file-upload" className="file-label">
                        {file ? (
                            <div className="file-info">
                                <span className="icon">📄</span>
                                <span className="filename">{file.name}</span>
                                <span className="change-text">Click to change</span>
                            </div>
                        ) : (
                            <div className="upload-placeholder">
                                <div className="icon">☁️</div>
                                <div>Click to Upload PDF</div>
                            </div>
                        )}
                    </label>
                </div>

                <div className="advanced-options">
                    <button
                        className="btn-text"
                        onClick={() => setShowIdInput(!showIdInput)}
                    >
                        {showIdInput ? "Hide Advanced Options" : "Show Advanced Options"}
                    </button>

                    {showIdInput && (
                        <input
                            className="input id-input animate-enter"
                            placeholder="Candidate UUID (Optional)"
                            value={candidateId}
                            onChange={(e) => setCandidateId(e.target.value)}
                        />
                    )}
                </div>

                <button
                    className="btn btn-primary analyze-btn"
                    onClick={handleAnalyze}
                    disabled={loading || !file}
                >
                    {loading ? (
                        <span className="loading-text">Analyzing... <span className="spinner"></span></span>
                    ) : "Analyze Resume"}
                </button>

                {result && (
                    <div className="results-area animate-enter">
                        <div className="score-card glass">
                            <div className="score-circle">
                                <svg viewBox="0 0 36 36" className="circular-chart">
                                    <path className="circle-bg"
                                        d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                    <path className="circle"
                                        strokeDasharray={`${(result.score || 0) * 10}, 100`}
                                        d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                    <text x="18" y="20.35" className="percentage">{result.score}/10</text>
                                </svg>
                            </div>
                            <div className="score-label">Match Score</div>
                        </div>

                        <div className="skills-section">
                            <h3>Skills Detected</h3>
                            <div className="skills-grid">
                                {result.skills_found?.length > 0 ? (
                                    result.skills_found.map(skill => (
                                        <span key={skill} className="tag success animate-enter">{skill}</span>
                                    ))
                                ) : (
                                    <p className="no-skills">No specific keywords matched.</p>
                                )}
                            </div>
                        </div>

                        {result.missing_keywords?.length > 0 && (
                            <div className="skills-section">
                                <h3>Missing Keywords</h3>
                                <div className="skills-grid">
                                    {result.missing_keywords.map(skill => (
                                        <span key={skill} className="tag missing animate-enter">{skill}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style jsx>{`
                .resume-page {
                    padding: 40px 24px;
                    min-height: calc(100vh - 80px);
                    display: flex;
                    align-items: flex-start;
                    justify-content: center;
                }
                .resume-uploader {
                    width: 100%;
                    max-width: 700px;
                    padding: 40px;
                    text-align: center;
                }
                .subtitle {
                    color: var(--text-secondary);
                    margin-bottom: 2rem;
                }
                .file-input {
                    display: none;
                }
                .drop-zone {
                    border: 2px dashed rgba(34, 197, 94, 0.3);
                    border-radius: var(--radius-lg);
                    transition: all 0.3s;
                    background: rgba(240, 253, 244, 0.3);
                    overflow: hidden;
                }
                .drop-zone:hover {
                    border-color: var(--accent-green);
                    background: rgba(240, 253, 244, 0.6);
                }
                .drop-zone.has-file {
                    border-style: solid;
                    border-color: var(--success);
                    background: rgba(34, 197, 94, 0.05);
                }
                .file-label {
                    display: block;
                    padding: 40px;
                    cursor: pointer;
                }
                .upload-placeholder .icon {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                    opacity: 0.8;
                }
                .file-info {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                }
                .file-info .icon { font-size: 2rem; }
                .filename { font-weight: 500; font-size: 1.1rem; color: var(--text-primary); }
                .change-text { font-size: 0.8rem; color: var(--text-muted); }

                .advanced-options {
                    margin-top: 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                }
                .btn-text {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    font-size: 0.85rem;
                    text-decoration: underline;
                    font-family: inherit;
                }
                .id-input {
                    margin-top: 10px;
                    text-align: center;
                }
                .analyze-btn {
                    margin-top: 24px;
                    width: 100%;
                    padding: 16px;
                }

                .loading-text {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid white;
                    border-top-color: transparent;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }

                .results-area {
                    margin-top: 40px;
                    border-top: 1px solid rgba(34, 197, 94, 0.15);
                    padding-top: 40px;
                    display: grid;
                    gap: 32px;
                }
                .score-card {
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .score-label {
                    margin-top: 8px;
                    color: var(--text-secondary);
                    font-weight: 500;
                }
                .circular-chart {
                    display: block;
                    max-width: 120px;
                    max-height: 120px;
                }
                .circle-bg {
                    fill: none;
                    stroke: #e2e8f0;
                    stroke-width: 2.5;
                }
                .circle {
                    fill: none;
                    stroke-width: 2.5;
                    stroke-linecap: round;
                    stroke: var(--accent-green);
                    animation: progress 1s ease-out forwards;
                }
                .percentage {
                    fill: var(--text-primary);
                    font-family: sans-serif;
                    font-weight: bold;
                    font-size: 0.5em;
                    text-anchor: middle;
                }

                .skills-section h3 {
                    margin-bottom: 16px;
                    font-size: 1.1rem;
                    color: var(--text-secondary);
                    text-align: left;
                }
                .skills-grid {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                }
                .tag {
                    padding: 6px 14px;
                    border-radius: 100px;
                    font-size: 0.9rem;
                    background: rgba(34, 197, 94, 0.08);
                    border: 1px solid rgba(34, 197, 94, 0.15);
                    color: var(--text-primary);
                }
                .tag.success {
                    background: rgba(34, 197, 94, 0.1);
                    color: var(--success);
                    border-color: rgba(34, 197, 94, 0.2);
                }
                .tag.missing {
                    background: rgba(250, 204, 21, 0.1);
                    color: var(--warning);
                    border-color: rgba(250, 204, 21, 0.2);
                }
                .no-skills {
                    color: var(--text-muted);
                    font-style: italic;
                }
            `}</style>
        </div>
    );
}
