"use client";
import { useState, useRef, useEffect } from "react";
import { api } from "@/lib/api";

const STEPS = ["Your Info", "Technical", "Projects", "Problem Solving", "Behavioral", "Complete"];

const STEP_MAP = {
    technical: 1,
    project: 2,
    problem_solving: 3,
    behavioral: 4,
    completed: 5,
};

// Curated tech stack suggestions
const TECH_SUGGESTIONS = [
    "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "Ruby", "PHP",
    "Swift", "Kotlin", "Dart", "Scala", "R", "MATLAB", "Perl", "Haskell", "Elixir", "Clojure",
    "React", "Next.js", "Vue.js", "Angular", "Svelte", "Nuxt.js", "Gatsby", "Remix",
    "Node.js", "Express.js", "FastAPI", "Django", "Flask", "Spring Boot", "Rails", "Laravel", "ASP.NET",
    "React Native", "Flutter", "SwiftUI", "Jetpack Compose", "Ionic", "Expo",
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Supabase", "Firebase", "DynamoDB", "Cassandra",
    "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "Jenkins", "GitHub Actions", "CircleCI",
    "GraphQL", "REST API", "gRPC", "WebSocket", "OAuth", "JWT",
    "TensorFlow", "PyTorch", "Keras", "scikit-learn", "Pandas", "NumPy", "OpenCV",
    "Machine Learning", "Deep Learning", "NLP", "Computer Vision", "Data Science",
    "Git", "Linux", "Nginx", "Apache", "Elasticsearch", "RabbitMQ", "Kafka",
    "HTML", "CSS", "Tailwind CSS", "Bootstrap", "SASS", "Material UI", "Figma",
    "Vercel", "Netlify", "Heroku", "DigitalOcean", "Cloudflare",
    "Jest", "Cypress", "Selenium", "JUnit", "PyTest", "Mocha",
    "Blockchain", "Solidity", "Web3.js", "Ethers.js",
    "Unity", "Unreal Engine", "Godot",
].sort();

export default function InterviewPage() {
    const [started, setStarted] = useState(false);
    const [formData, setFormData] = useState({
        name: "", email: "", phone: "", experience: "", position: "", location: ""
    });
    const [techTags, setTechTags] = useState([]);
    const [techInput, setTechInput] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [thinking, setThinking] = useState(false);
    const [interviewId, setInterviewId] = useState(null);
    const [currentStepIdx, setCurrentStepIdx] = useState(0);
    const chatEndRef = useRef(null);
    const suggestionsRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, thinking]);

    // Close suggestions on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const filteredSuggestions = TECH_SUGGESTIONS.filter(
        t => t.toLowerCase().includes(techInput.toLowerCase()) && !techTags.includes(t)
    ).slice(0, 8);

    const addTag = (tag) => {
        if (!techTags.includes(tag)) {
            setTechTags([...techTags, tag]);
        }
        setTechInput("");
        setShowSuggestions(false);
    };

    const removeTag = (tag) => {
        setTechTags(techTags.filter(t => t !== tag));
    };

    const handleTechKeyDown = (e) => {
        if (e.key === "Enter" && techInput.trim()) {
            e.preventDefault();
            // Add custom tag if not in suggestions
            addTag(techInput.trim());
        }
        if (e.key === "Backspace" && !techInput && techTags.length) {
            removeTag(techTags[techTags.length - 1]);
        }
    };

    const handleStart = async (e) => {
        e.preventDefault();
        if (techTags.length === 0) {
            alert("Please add at least one technology to your tech stack.");
            return;
        }
        setLoading(true);
        try {
            const payload = {
                candidate: {
                    ...formData,
                    experience: parseFloat(formData.experience) || 0,
                    tech_stack: techTags,
                }
            };
            const res = await api.startInterview(payload);
            setInterviewId(res.interview_id);
            setMessages([{ role: "assistant", content: res.message }]);
            setStarted(true);
            setCurrentStepIdx(1);
        } catch (err) {
            alert("Error starting interview: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input;
        setInput("");
        setMessages((prev) => [...prev, { role: "user", content: userMsg }]);

        setThinking(true);
        try {
            const res = await api.sendMessage(interviewId, userMsg);
            setMessages((prev) => [...prev, { role: "assistant", content: res.message }]);

            if (res.current_step && STEP_MAP[res.current_step] !== undefined) {
                setCurrentStepIdx(STEP_MAP[res.current_step]);
            }
        } catch (err) {
            console.error(err);
            setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setThinking(false);
        }
    };

    const isCompleted = currentStepIdx === 5;

    return (
        <div className="container" style={{ padding: "40px 24px" }}>
            {!started ? (
                <div className="glass form-container animate-enter">
                    <h1 className="text-gradient" style={{ marginBottom: "8px", textAlign: "center" }}>
                        Start Your Interview
                    </h1>
                    <p className="form-subtitle">
                        Fill in your details and our AI interviewer will craft questions just for you.
                    </p>
                    <form onSubmit={handleStart} className="interview-form">
                        <div className="grid-2">
                            <input placeholder="Full Name" className="input" required
                                onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            <input placeholder="Email" className="input" type="email" required
                                onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                        <div className="grid-2">
                            <input placeholder="Phone" className="input" required
                                onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                            <input placeholder="Years of Experience" className="input" type="number" required
                                onChange={e => setFormData({ ...formData, experience: e.target.value })} />
                        </div>
                        <input placeholder="Position (e.g. Backend Engineer)" className="input" required
                            onChange={e => setFormData({ ...formData, position: e.target.value })} />
                        <input placeholder="Location" className="input"
                            onChange={e => setFormData({ ...formData, location: e.target.value })} />

                        {/* Tag-based tech stack input */}
                        <div className="tech-stack-field" ref={suggestionsRef}>
                            <label className="field-label">Tech Stack</label>
                            <div className="tags-input-container">
                                {techTags.map(tag => (
                                    <span key={tag} className="tech-tag">
                                        {tag}
                                        <button type="button" className="tag-remove" onClick={() => removeTag(tag)}>×</button>
                                    </span>
                                ))}
                                <input
                                    className="tags-input"
                                    placeholder={techTags.length ? "Add more..." : "Type a technology (e.g. React, Python)"}
                                    value={techInput}
                                    onChange={(e) => { setTechInput(e.target.value); setShowSuggestions(true); }}
                                    onFocus={() => setShowSuggestions(true)}
                                    onKeyDown={handleTechKeyDown}
                                />
                            </div>
                            {showSuggestions && techInput && filteredSuggestions.length > 0 && (
                                <div className="suggestions-dropdown">
                                    {filteredSuggestions.map(s => (
                                        <div key={s} className="suggestion-item" onClick={() => addTag(s)}>
                                            {s}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }} disabled={loading}>
                            {loading ? "Initializing AI Interviewer..." : "Begin Interview"}
                        </button>
                    </form>
                </div>
            ) : isCompleted ? (
                /* Completion screen */
                <div className="glass completion-card animate-enter">
                    <div className="completion-icon">🎉</div>
                    <h2>Interview Complete!</h2>
                    <p className="completion-text">
                        Thank you for completing the interview. Your responses have been recorded and will be reviewed by our hiring team.
                    </p>
                    <div className="completion-steps">
                        <div className="completion-step">
                            <span className="step-num">1</span>
                            <span>AI Analysis & Scoring</span>
                        </div>
                        <div className="completion-step">
                            <span className="step-num">2</span>
                            <span>HR Team Review</span>
                        </div>
                        <div className="completion-step">
                            <span className="step-num">3</span>
                            <span>Decision & Notification</span>
                        </div>
                    </div>
                    <p className="completion-note">You will hear back from us within 3-5 business days.</p>
                </div>
            ) : (
                <div className="glass interview-interface animate-enter">
                    {/* Progress Bar */}
                    <div className="progress-bar">
                        {STEPS.map((step, i) => (
                            <div key={step} className={`step ${i <= currentStepIdx ? "active" : ""} ${i === currentStepIdx ? "current" : ""}`}>
                                <div className="step-dot">{i <= currentStepIdx ? "✓" : i + 1}</div>
                                <span>{step}</span>
                            </div>
                        ))}
                    </div>

                    <div className="chat-container">
                        <div className="chat-messages">
                            {messages.map((m, i) => (
                                <div key={i} className={`chat-bubble ${m.role} animate-enter`}>
                                    {m.role === "assistant" && <span className="bubble-avatar">🤖</span>}
                                    <div className="bubble-content">{m.content}</div>
                                </div>
                            ))}

                            {thinking && (
                                <div className="chat-bubble assistant animate-enter">
                                    <span className="bubble-avatar">🤖</span>
                                    <div className="bubble-content typing-indicator">
                                        <span></span><span></span><span></span>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        <form onSubmit={handleSend} className="chat-input-area">
                            <input
                                className="input"
                                placeholder="Type your answer..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                autoFocus
                                disabled={thinking}
                            />
                            <button type="submit" className="btn btn-primary" disabled={thinking || !input.trim()}>
                                Send
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                .form-container {
                    max-width: 640px;
                    margin: 0 auto;
                    padding: 40px;
                }
                .form-subtitle {
                    text-align: center;
                    color: var(--text-secondary);
                    margin-bottom: 2rem;
                    font-size: 1rem;
                }
                .interview-form {
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                }
                .grid-2 {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 14px;
                }

                /* Tag input styles */
                .tech-stack-field {
                    position: relative;
                }
                .field-label {
                    display: block;
                    font-size: 0.85rem;
                    font-weight: 500;
                    color: var(--text-secondary);
                    margin-bottom: 6px;
                }
                .tags-input-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    padding: 10px 14px;
                    background: white;
                    border: 1.5px solid #e2e8f0;
                    border-radius: var(--radius-md);
                    min-height: 48px;
                    align-items: center;
                    cursor: text;
                    transition: all 0.2s;
                    box-shadow: var(--shadow-sm);
                }
                .tags-input-container:focus-within {
                    border-color: var(--accent-green);
                    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
                }
                .tech-tag {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    padding: 4px 12px;
                    background: rgba(34, 197, 94, 0.1);
                    color: var(--accent-green);
                    border: 1px solid rgba(34, 197, 94, 0.2);
                    border-radius: 100px;
                    font-size: 0.85rem;
                    font-weight: 500;
                    animation: fadeIn 0.2s ease;
                }
                .tag-remove {
                    background: none;
                    border: none;
                    color: var(--accent-green);
                    cursor: pointer;
                    font-size: 1.1rem;
                    line-height: 1;
                    padding: 0;
                    margin-left: 2px;
                    opacity: 0.6;
                    transition: opacity 0.2s;
                }
                .tag-remove:hover { opacity: 1; }
                .tags-input {
                    border: none;
                    outline: none;
                    flex: 1;
                    min-width: 120px;
                    font-family: inherit;
                    font-size: 0.95rem;
                    color: var(--text-primary);
                    background: transparent;
                }
                .tags-input::placeholder { color: var(--text-muted); }

                .suggestions-dropdown {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: var(--radius-md);
                    box-shadow: var(--shadow-lg);
                    z-index: 50;
                    max-height: 200px;
                    overflow-y: auto;
                    margin-top: 4px;
                }
                .suggestion-item {
                    padding: 10px 16px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    color: var(--text-primary);
                    transition: background 0.15s;
                }
                .suggestion-item:hover {
                    background: rgba(34, 197, 94, 0.08);
                    color: var(--accent-green);
                }

                /* Progress bar */
                .progress-bar {
                    display: flex;
                    justify-content: space-between;
                    padding: 24px 32px;
                    border-bottom: 1px solid rgba(34, 197, 94, 0.1);
                    background: rgba(240, 253, 244, 0.5);
                    border-radius: 20px 20px 0 0;
                }
                .step {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    position: relative;
                }
                .step.active { color: var(--accent-green); }
                .step.current { font-weight: 600; }
                .step-dot {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    background: #f1f5f9;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.7rem;
                    font-weight: 600;
                    color: var(--text-muted);
                    transition: all 0.3s;
                    border: 2px solid transparent;
                }
                .step.active .step-dot {
                    background: var(--accent-green);
                    color: white;
                    border-color: rgba(34, 197, 94, 0.3);
                    box-shadow: 0 0 12px rgba(34, 197, 94, 0.3);
                }

                /* Chat */
                .chat-container {
                    display: flex;
                    flex-direction: column;
                    min-height: 460px;
                    max-height: 65vh;
                    overflow: hidden;
                }
                .chat-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .chat-bubble {
                    display: flex;
                    gap: 12px;
                    max-width: 85%;
                }
                .chat-bubble.user {
                    align-self: flex-end;
                    flex-direction: row-reverse;
                }
                .bubble-content {
                    background: white;
                    border: 1px solid #e8f5e9;
                    padding: 14px 20px;
                    border-radius: 18px;
                    border-top-left-radius: 4px;
                    white-space: pre-wrap;
                    line-height: 1.6;
                    font-size: 0.95rem;
                    color: var(--text-primary);
                    box-shadow: var(--shadow-sm);
                }
                .chat-bubble.user .bubble-content {
                    background: linear-gradient(135deg, #dcfce7, #d1fae5);
                    border: 1px solid rgba(34, 197, 94, 0.15);
                    border-radius: 18px;
                    border-top-right-radius: 4px;
                }
                .bubble-avatar {
                    font-size: 1.5rem;
                    margin-top: -4px;
                    flex-shrink: 0;
                }
                .chat-input-area {
                    padding: 20px;
                    border-top: 1px solid rgba(34, 197, 94, 0.1);
                    display: flex;
                    gap: 12px;
                    background: rgba(240, 253, 244, 0.3);
                    border-radius: 0 0 20px 20px;
                }

                /* Typing indicator */
                .typing-indicator {
                    display: flex;
                    gap: 5px;
                    padding: 16px 20px !important;
                    align-items: center;
                    min-width: 60px;
                }
                .typing-indicator span {
                    width: 8px;
                    height: 8px;
                    background: var(--accent-green);
                    border-radius: 50%;
                    opacity: 0.4;
                    animation: bounce 1.4s infinite ease-in-out both;
                }
                .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
                .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
                @keyframes bounce {
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1); }
                }

                /* Completion screen */
                .completion-card {
                    max-width: 560px;
                    margin: 0 auto;
                    padding: 48px 40px;
                    text-align: center;
                }
                .completion-icon {
                    font-size: 4rem;
                    margin-bottom: 16px;
                }
                .completion-card h2 {
                    font-size: 2rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin-bottom: 12px;
                }
                .completion-text {
                    color: var(--text-secondary);
                    font-size: 1.05rem;
                    line-height: 1.6;
                    margin-bottom: 32px;
                }
                .completion-steps {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    margin-bottom: 32px;
                }
                .completion-step {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 14px 20px;
                    background: rgba(34, 197, 94, 0.06);
                    border-radius: var(--radius-md);
                    text-align: left;
                    font-size: 0.95rem;
                    color: var(--text-primary);
                }
                .step-num {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: var(--accent-green);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 0.85rem;
                    flex-shrink: 0;
                }
                .completion-note {
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    font-style: italic;
                }
            `}</style>
        </div>
    );
}
