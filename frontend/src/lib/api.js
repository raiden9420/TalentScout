const API_BASE = "http://localhost:8000/api";

async function fetchAPI(endpoint, options = {}) {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const config = {
        ...options,
        headers,
    };

    try {
        const res = await fetch(`${API_BASE}${endpoint}`, config);
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.detail || "API request failed");
        }
        return res.json();
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
}

export const api = {
    login: (password) => fetchAPI("/auth/login", {
        method: "POST",
        body: JSON.stringify({ password }),
    }),

    startInterview: (data) => fetchAPI("/interviews/start", {
        method: "POST",
        body: JSON.stringify(data),
    }),

    sendMessage: (interviewId, content) => fetchAPI(`/interviews/${interviewId}/message`, {
        method: "POST",
        body: JSON.stringify({ content, role: "user" }),
    }),

    getInterviewStatus: (interviewId) => fetchAPI(`/interviews/${interviewId}/status`),

    analyzeResume: (formData) => {
        // Need special handling for FormData (don't set Content-Type)
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        return fetch(`${API_BASE}/resumes/analyze`, {
            method: "POST",
            headers: { ...(token && { Authorization: `Bearer ${token}` }) },
            body: formData
        }).then(async res => {
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.detail || "Analysis failed");
            }
            return res.json();
        });
    },

    getCandidates: (status) => fetchAPI(`/candidates${status ? `?status=${status}` : ""}`),
    getCandidateScores: (id) => fetchAPI(`/candidates/${id}/scores`),
    getStats: () => fetchAPI("/candidates/stats/summary"),

    getKeywords: () => fetchAPI("/resumes/keywords"),
    addKeyword: (data) => fetchAPI("/resumes/keywords", {
        method: "POST",
        body: JSON.stringify(data)
    })
};
