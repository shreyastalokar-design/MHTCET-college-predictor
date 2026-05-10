import React, { useState, useEffect, useRef } from "react";

// ─── CONFIG ─────────────────────────────────────────────────────────────────
// When deployed, replace with your actual Render backend URL
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

const ALL_CATEGORIES = ["OPEN", "OBC", "SC", "ST", "EWS", "TFWS", "PWD", "Defence"];

const BRANCH_ICONS = {
  "Computer Engineering": "💻",
  "Information Technology": "🖥️",
  "Electronics Engineering": "⚡",
  "Mechanical Engineering": "⚙️",
  "Civil Engineering": "🏗️",
  "Chemical Engineering": "🧪",
};

const TYPE_COLORS = {
  Autonomous: "#6C63FF",
  Government: "#22C55E",
  "Private-Aided": "#F59E0B",
  Private: "#EF4444",
};

// ─── CHANCE BADGE ────────────────────────────────────────────────────────────
function ChanceBadge({ chance }) {
  const config = {
    Safe: { bg: "#dcfce7", color: "#166534", icon: "✅", label: "Safe Admit" },
    Moderate: { bg: "#fef9c3", color: "#854d0e", icon: "⚠️", label: "Moderate" },
    Reach: { bg: "#fee2e2", color: "#991b1b", icon: "🎯", label: "Reach" },
  }[chance] || {};
  return (
    <span style={{
      background: config.bg, color: config.color,
      padding: "3px 10px", borderRadius: 20, fontSize: 12,
      fontWeight: 700, letterSpacing: 0.5, whiteSpace: "nowrap",
    }}>
      {config.icon} {config.label}
    </span>
  );
}

// ─── COLLEGE CARD ────────────────────────────────────────────────────────────
function CollegeCard({ college, rank }) {
  const branchIcon = BRANCH_ICONS[college.branch] || "🎓";
  const typeColor = TYPE_COLORS[college.college_type] || "#888";
  const gapText = college.gap >= 0
    ? `+${college.gap.toFixed(2)} above cutoff`
    : `${Math.abs(college.gap).toFixed(2)} below cutoff`;

  return (
    <div style={{
      background: "#fff",
      borderRadius: 16,
      padding: "20px 22px",
      marginBottom: 14,
      boxShadow: "0 2px 16px rgba(30,41,100,0.08)",
      border: "1px solid #e8eaf6",
      display: "flex", gap: 16, alignItems: "flex-start",
      transition: "transform 0.18s, box-shadow 0.18s",
      cursor: "default",
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 8px 28px rgba(30,41,100,0.14)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 16px rgba(30,41,100,0.08)";
      }}
    >
      {/* Rank bubble */}
      <div style={{
        minWidth: 38, height: 38, borderRadius: "50%",
        background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
        color: "#fff", fontWeight: 800, fontSize: 16,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 2px 8px rgba(79,70,229,0.3)",
      }}>
        {rank}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 6 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#1e2564", lineHeight: 1.3 }}>
              {college.college_name}
            </div>
            <div style={{ fontSize: 14, color: "#64748b", marginTop: 3 }}>
              {branchIcon} {college.branch}
            </div>
          </div>
          <ChanceBadge chance={college.chance} />
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
          <Pill label="Cutoff" value={`${college.cutoff_percentile}%ile`} color="#4f46e5" />
          <Pill label="Fees/yr" value={`₹${(college.fees / 1000).toFixed(0)}K`} color="#0891b2" />
          <Pill label="📍" value={college.district} color="#64748b" />
          <Pill label="" value={college.college_type} color={typeColor} />
          <Pill label="Gap" value={gapText} color={college.gap >= 0 ? "#166534" : "#991b1b"} />
        </div>
      </div>
    </div>
  );
}

function Pill({ label, value, color }) {
  return (
    <span style={{
      background: "#f1f5f9", borderRadius: 8, padding: "3px 10px",
      fontSize: 12, color: "#334155", fontWeight: 500,
    }}>
      {label && <span style={{ color: "#94a3b8", marginRight: 4 }}>{label}</span>}
      <span style={{ color, fontWeight: 700 }}>{value}</span>
    </span>
  );
}

// ─── RESULTS SECTION ─────────────────────────────────────────────────────────
function ResultSection({ title, emoji, colleges, accentColor }) {
  if (!colleges || colleges.length === 0) return null;
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        marginBottom: 16,
        borderLeft: `4px solid ${accentColor}`,
        paddingLeft: 12,
      }}>
        <span style={{ fontSize: 22 }}>{emoji}</span>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#1e2564" }}>{title}</div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>{colleges.length} college{colleges.length > 1 ? "s" : ""} found</div>
        </div>
      </div>
      {colleges.map((c, i) => <CollegeCard key={i} college={c} rank={i + 1} />)}
    </div>
  );
}

// ─── MULTI-SELECT PILLS ───────────────────────────────────────────────────────
function MultiSelect({ label, options, selected, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = val => {
    if (selected.includes(val)) onChange(selected.filter(s => s !== val));
    else onChange([...selected, val]);
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <label style={styles.label}>{label}</label>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          ...styles.input, cursor: "pointer", minHeight: 46,
          display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center",
          padding: "8px 14px",
        }}
      >
        {selected.length === 0
          ? <span style={{ color: "#94a3b8", fontSize: 14 }}>{placeholder}</span>
          : selected.map(s => (
            <span key={s} style={{
              background: "#ede9fe", color: "#4f46e5", borderRadius: 12,
              padding: "2px 10px", fontSize: 13, fontWeight: 600,
              display: "flex", alignItems: "center", gap: 4,
            }}>
              {s}
              <span
                onClick={e => { e.stopPropagation(); toggle(s); }}
                style={{ cursor: "pointer", opacity: 0.6, fontWeight: 900 }}
              >×</span>
            </span>
          ))
        }
        <span style={{ marginLeft: "auto", color: "#94a3b8" }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div style={{
          position: "absolute", zIndex: 100, top: "100%", left: 0, right: 0,
          background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)", padding: 8, marginTop: 4,
          maxHeight: 220, overflowY: "auto",
        }}>
          {options.map(opt => (
            <div
              key={opt}
              onClick={() => toggle(opt)}
              style={{
                padding: "9px 14px", borderRadius: 8, cursor: "pointer",
                fontSize: 14, fontWeight: selected.includes(opt) ? 700 : 400,
                background: selected.includes(opt) ? "#ede9fe" : "transparent",
                color: selected.includes(opt) ? "#4f46e5" : "#334155",
                display: "flex", justifyContent: "space-between",
              }}
            >
              {opt}
              {selected.includes(opt) && <span>✓</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [percentile, setPercentile] = useState("");
  const [category, setCategory] = useState("");
  const [branches, setBranches] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [collegeType, setCollegeType] = useState("");

  const [allBranches, setAllBranches] = useState([]);
  const [allDistricts, setAllDistricts] = useState([]);
  const [allTypes, setAllTypes] = useState([]);

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const resultsRef = useRef();

  // Load filter options on mount
  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/branches`).then(r => r.json()),
      fetch(`${API_BASE}/districts`).then(r => r.json()),
      fetch(`${API_BASE}/college-types`).then(r => r.json()),
    ]).then(([b, d, t]) => {
      setAllBranches(b.branches || []);
      setAllDistricts(d.districts || []);
      setAllTypes(t.college_types || []);
    }).catch(() => {
      // fallback static options if API is not running
      setAllBranches(["Computer Engineering", "Information Technology", "Electronics Engineering", "Mechanical Engineering", "Civil Engineering", "Chemical Engineering"]);
      setAllDistricts(["Mumbai", "Pune", "Nagpur", "Aurangabad", "Sangli", "Satara", "Amravati", "Ratnagiri", "Navi Mumbai"]);
      setAllTypes(["Government", "Autonomous", "Private-Aided", "Private"]);
    });
  }, []);

  const handlePredict = async () => {
    setError("");
    if (!percentile || isNaN(parseFloat(percentile))) {
      setError("Please enter a valid percentile.");
      return;
    }
    if (!category) {
      setError("Please select your category.");
      return;
    }
    setLoading(true);
    setResults(null);
    try {
      const res = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          percentile: parseFloat(percentile),
          category,
          branches,
          districts,
          college_type: collegeType,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Something went wrong.");
      setResults(data);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const totalResults = results
    ? (results.safe?.length || 0) + (results.moderate?.length || 0) + (results.reach?.length || 0)
    : 0;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0f4ff 0%, #fafaff 60%, #f5f0ff 100%)", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* ── HERO HEADER ── */}
      <div style={{
        background: "linear-gradient(135deg, #1e2564 0%, #4f46e5 50%, #7c3aed 100%)",
        padding: "48px 24px 64px",
        textAlign: "center",
        position: "relative", overflow: "hidden",
      }}>
        {/* Decorative circles */}
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
            width: [200, 150, 300, 180, 250][i],
            height: [200, 150, 300, 180, 250][i],
            top: [-80, 20, -60, 80, -30][i],
            left: [`${[5, 60, 80, 10, 40][i]}%`],
          }} />
        ))}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", fontWeight: 600, letterSpacing: 3, marginBottom: 10, textTransform: "uppercase" }}>
            Maharashtra HSC / PCM
          </div>
          <h1 style={{ color: "#fff", fontSize: "clamp(26px, 5vw, 46px)", fontWeight: 900, margin: "0 0 12px", lineHeight: 1.1 }}>
            🎓 MHT-CET College Predictor
          </h1>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 16, maxWidth: 520, margin: "0 auto" }}>
            Enter your percentile & category to discover the best engineering colleges you can aim for — Safe, Moderate & Reach picks!
          </p>
        </div>
      </div>

      {/* ── FORM CARD ── */}
      <div style={{ maxWidth: 760, margin: "-32px auto 0", padding: "0 20px 48px", position: "relative", zIndex: 2 }}>
        <div style={{
          background: "#fff", borderRadius: 24,
          padding: "36px 32px",
          boxShadow: "0 20px 60px rgba(30,37,100,0.12)",
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1e2564", margin: "0 0 24px" }}>
            Enter Your Details
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18, marginBottom: 18 }}>
            {/* Percentile */}
            <div>
              <label style={styles.label}>Your Percentile *</label>
              <input
                type="number" min="0" max="100" step="0.01"
                placeholder="e.g. 97.50"
                value={percentile}
                onChange={e => setPercentile(e.target.value)}
                style={styles.input}
              />
            </div>

            {/* Category */}
            <div>
              <label style={styles.label}>Your Category *</label>
              <select value={category} onChange={e => setCategory(e.target.value)} style={styles.input}>
                <option value="">Select category</option>
                {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* College Type */}
            <div>
              <label style={styles.label}>College Type (Optional)</label>
              <select value={collegeType} onChange={e => setCollegeType(e.target.value)} style={styles.input}>
                <option value="">All Types</option>
                {allTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Branch multi-select */}
          <div style={{ marginBottom: 18 }}>
            <MultiSelect
              label="Preferred Branches (Optional — leave empty for all)"
              options={allBranches}
              selected={branches}
              onChange={setBranches}
              placeholder="All branches"
            />
          </div>

          {/* District multi-select */}
          <div style={{ marginBottom: 28 }}>
            <MultiSelect
              label="Preferred Districts (Optional — leave empty for all)"
              options={allDistricts}
              selected={districts}
              onChange={setDistricts}
              placeholder="All districts"
            />
          </div>

          {error && (
            <div style={{ background: "#fee2e2", color: "#991b1b", borderRadius: 10, padding: "12px 16px", marginBottom: 18, fontSize: 14, fontWeight: 600 }}>
              ⚠️ {error}
            </div>
          )}

          <button
            onClick={handlePredict}
            disabled={loading}
            style={{
              width: "100%", padding: "16px 0", borderRadius: 14, border: "none",
              background: loading ? "#a5b4fc" : "linear-gradient(135deg, #4f46e5, #7c3aed)",
              color: "#fff", fontSize: 17, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer",
              letterSpacing: 0.5, transition: "opacity 0.2s",
              boxShadow: "0 4px 20px rgba(79,70,229,0.35)",
            }}
          >
            {loading ? "🔍 Finding colleges..." : "🚀 Predict My Colleges"}
          </button>
        </div>

        {/* ── RESULTS ── */}
        {results && (
          <div ref={resultsRef} style={{ marginTop: 36 }}>
            {/* Summary banner */}
            <div style={{
              background: "linear-gradient(135deg, #1e2564, #4f46e5)",
              borderRadius: 16, padding: "20px 28px", marginBottom: 28,
              color: "#fff", display: "flex", justifyContent: "space-between",
              alignItems: "center", flexWrap: "wrap", gap: 12,
            }}>
              <div>
                <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 4 }}>Results for</div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>
                  {results.percentile}%ile — {results.category}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 4 }}>Total colleges matched</div>
                <div style={{ fontSize: 28, fontWeight: 900 }}>{results.total_eligible}</div>
              </div>
            </div>

            {totalResults === 0 && (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
                <div style={{ fontSize: 48 }}>😔</div>
                <div style={{ fontSize: 18, fontWeight: 700, marginTop: 12 }}>No colleges found</div>
                <div style={{ fontSize: 14, marginTop: 6 }}>Try adjusting your filters or check your percentile.</div>
              </div>
            )}

            <ResultSection title="Safe Admissions" emoji="✅" colleges={results.safe} accentColor="#22c55e" />
            <ResultSection title="Moderate Chances" emoji="⚠️" colleges={results.moderate} accentColor="#f59e0b" />
            <ResultSection title="Reach Colleges" emoji="🎯" colleges={results.reach} accentColor="#ef4444" />

            <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "#94a3b8" }}>
              * Based on previous year cutoffs. Actual cutoffs may vary. Always verify with official sources.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SHARED STYLES ────────────────────────────────────────────────────────────
const styles = {
  label: {
    display: "block", fontSize: 13, fontWeight: 700, color: "#475569",
    marginBottom: 7, letterSpacing: 0.3,
  },
  input: {
    width: "100%", padding: "11px 14px", borderRadius: 10,
    border: "1.5px solid #e2e8f0", fontSize: 15, color: "#1e293b",
    background: "#f8fafc", outline: "none", boxSizing: "border-box",
    transition: "border-color 0.2s",
    appearance: "auto",
  },
};
