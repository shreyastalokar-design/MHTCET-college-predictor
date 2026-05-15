import React, { useState, useEffect, useRef } from "react";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

// ── Category full forms for display ──────────────────────────────────────────
const CASTE_OPTIONS = [
  { value: "OPEN", label: "Open (General)" },
  { value: "OBC",  label: "OBC – Other Backward Class" },
  { value: "SC",   label: "SC – Scheduled Caste" },
  { value: "ST",   label: "ST – Scheduled Tribe" },
  { value: "SEBC", label: "SEBC – Socially & Educationally Backward Class" },
  { value: "VJ",   label: "VJ – Vimukta Jati (Denotified Tribes)" },
  { value: "NT1",  label: "NT1 – Nomadic Tribe 1 (Banjara)" },
  { value: "NT2",  label: "NT2 – Nomadic Tribe 2 (Dhangar)" },
  { value: "NT3",  label: "NT3 – Nomadic Tribe 3 (Vanjari)" },
];

const QUOTA_OPTIONS = [
  { value: "NONE",   label: "No Special Quota" },
  { value: "PWD",    label: "PWD – Person with Disability" },
  { value: "DEF",    label: "Defence – Children of Defence Personnel" },
  { value: "EWS",    label: "EWS – Economically Weaker Section" },
  { value: "TFWS",   label: "TFWS – Tuition Fee Waiver Scheme" },
  { value: "MI",     label: "MI – Minority Quota" },
  { value: "ORPHAN", label: "Orphan Category" },
  { value: "AI",     label: "AI – All India Quota" },
];

const UNI_TYPE_OPTIONS = [
  { value: "State Level",      label: "State Level (Most Common)" },
  { value: "Home University",  label: "Home University" },
  { value: "Other University", label: "Other University" },
];

const CAP_ROUNDS = [
  { value: "CAP Round 1", label: "CAP Round 1" },
  { value: "CAP Round 2", label: "CAP Round 2" },
  { value: "CAP Round 3", label: "CAP Round 3" },
  { value: "CAP Round 4", label: "CAP Round 4" },
];

// ── Multi-select dropdown ─────────────────────────────────────────────────────
function MultiSelect({ options, selected, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (val) => {
    if (selected.includes(val)) onChange(selected.filter((v) => v !== val));
    else onChange([...selected, val]);
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div onClick={() => setOpen(!open)} style={styles.multiSelectBox}>
        <span style={{ color: selected.length ? "#1e293b" : "#94a3b8", fontSize: 14 }}>
          {selected.length ? `${selected.length} selected` : placeholder}
        </span>
        <span style={{ color: "#6366f1" }}>▾</span>
      </div>
      {open && (
        <div style={styles.dropdown}>
          {options.map((opt) => (
            <label key={opt} style={styles.dropdownItem}>
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
                style={{ marginRight: 8, accentColor: "#6366f1" }}
              />
              {opt}
            </label>
          ))}
        </div>
      )}
      {selected.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
          {selected.map((s) => (
            <span key={s} style={styles.tag}>
              {s} <span onClick={() => toggle(s)} style={{ cursor: "pointer", marginLeft: 4 }}>×</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  // Form state
  const [percentile, setPercentile]   = useState("");
  const [gender, setGender]           = useState("Male");
  const [caste, setCaste]             = useState("OPEN");
  const [quota, setQuota]             = useState("NONE");
  const [uniType, setUniType]         = useState("State Level");
  const [capRound, setCapRound]       = useState("CAP Round 1");
  const [selBranches, setSelBranches] = useState([]);
  const [selDistricts, setSelDistricts] = useState([]);

  // Data state
  const [allBranches, setAllBranches]   = useState([]);
  const [allDistricts, setAllDistricts] = useState([]);
  const [results, setResults]           = useState(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [activeTab, setActiveTab]       = useState("All");

  const resultsRef = useRef(null);

  // Load branches & districts
  useEffect(() => {
    fetch(`${API_BASE}/branches`).then(r => r.json()).then(d => setAllBranches(d.branches || [])).catch(() => {});
    fetch(`${API_BASE}/districts`).then(r => r.json()).then(d => setAllDistricts(d.districts || [])).catch(() => {});
  }, []);

  // Hide caste/uniType for standalone quotas
  const isStandaloneQuota = ["EWS", "TFWS", "MI", "ORPHAN", "AI"].includes(quota);
  const isAI = quota === "AI";

  const handlePredict = async () => {
    if (!percentile || isNaN(percentile) || percentile < 0 || percentile > 100) {
      setError("Please enter a valid percentile between 0 and 100.");
      return;
    }
    setError("");
    setLoading(true);
    setResults(null);

    const params = new URLSearchParams({
      percentile,
      gender,
      caste: isStandaloneQuota ? "OPEN" : caste,
      quota,
      uni_type: isStandaloneQuota ? "State Level" : uniType,
      cap_round: capRound,
    });
    if (selBranches.length)  params.append("branches",  selBranches.join(","));
    if (selDistricts.length) params.append("districts", selDistricts.join(","));

    try {
      const res  = await fetch(`${API_BASE}/predict?${params}`);
      const data = await res.json();
      setResults(data);
      setActiveTab("All");
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch {
      setError("Could not connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter results by tab
  const filteredColleges = results?.colleges?.filter(c =>
    activeTab === "All" ? true : c.admission_chance === activeTab
  ) || [];

  const counts = {
    All:      results?.colleges?.length || 0,
    Reach:    results?.colleges?.filter(c => c.admission_chance === "Reach").length    || 0,
    Moderate: results?.colleges?.filter(c => c.admission_chance === "Moderate").length || 0,
    Safe:     results?.colleges?.filter(c => c.admission_chance === "Safe").length     || 0,
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.subtitle}>MAHARASHTRA HSC / PCM</div>
          <h1 style={styles.title}>🎓 MHT-CET College Predictor</h1>
          <p style={styles.desc}>
            Enter your percentile & details to discover the best engineering colleges —
            Safe, Moderate & Reach picks!
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Enter Your Details</h2>

        {/* Row 1: Percentile + Gender */}
        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Your Percentile *</label>
            <input
              type="number"
              min="0" max="100" step="0.01"
              placeholder="e.g. 92.50"
              value={percentile}
              onChange={e => setPercentile(e.target.value)}
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Gender *</label>
            <div style={styles.btnGroup}>
              {["Male", "Female"].map(g => (
                <button key={g} onClick={() => setGender(g)}
                  style={gender === g ? styles.btnActive : styles.btnInactive}>
                  {g === "Male" ? "👨 Male" : "👩 Female"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: CAP Round */}
        <div style={styles.field}>
          <label style={styles.label}>CAP Round *</label>
          <div style={styles.btnGroup}>
            {CAP_ROUNDS.map(r => (
              <button key={r.value} onClick={() => setCapRound(r.value)}
                style={capRound === r.value ? styles.btnActive : styles.btnInactive}>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Row 3: Special Quota */}
        <div style={styles.field}>
          <label style={styles.label}>Special Quota</label>
          <select value={quota} onChange={e => setQuota(e.target.value)} style={styles.select}>
            {QUOTA_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Row 4: Caste + University Type (hidden for standalone quotas) */}
        {!isStandaloneQuota && (
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Caste Category *</label>
              <select value={caste} onChange={e => setCaste(e.target.value)} style={styles.select}>
                {CASTE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>University Type *</label>
              <select value={uniType} onChange={e => setUniType(e.target.value)} style={styles.select}>
                {UNI_TYPE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <span style={styles.hint}>
                💡 State Level = most common choice
              </span>
            </div>
          </div>
        )}

        {/* Row 5: Preferred Branches */}
        <div style={styles.field}>
          <label style={styles.label}>Preferred Branches (Optional)</label>
          <MultiSelect
            options={allBranches}
            selected={selBranches}
            onChange={setSelBranches}
            placeholder="All branches"
          />
        </div>

        {/* Row 6: Preferred Districts */}
        <div style={styles.field}>
          <label style={styles.label}>Preferred Districts (Optional)</label>
          <MultiSelect
            options={allDistricts}
            selected={selDistricts}
            onChange={setSelDistricts}
            placeholder="All districts"
          />
        </div>

        {/* Category Preview */}
        {!isAI && (
          <div style={styles.categoryPreview}>
            <span style={{ color: "#6366f1", fontWeight: 600 }}>🔖 Your Category: </span>
            {getCategoryLabel(gender, caste, quota, uniType)}
          </div>
        )}

        {error && <div style={styles.error}>{error}</div>}

        <button onClick={handlePredict} disabled={loading} style={styles.predictBtn}>
          {loading ? "⏳ Predicting..." : "🚀 Predict My Colleges"}
        </button>
      </div>

      {/* Results */}
      {results && (
        <div ref={resultsRef} style={styles.resultsSection}>
          <h2 style={styles.resultsTitle}>
            Found <span style={{ color: "#6366f1" }}>{results.total_results}</span> colleges
            for percentile <span style={{ color: "#6366f1" }}>{results.percentile}</span>
          </h2>
          <p style={styles.resultsSubtitle}>
            Category: <strong>{results.category_codes?.join(", ")}</strong> &nbsp;|&nbsp;
            Round: <strong>{results.cap_round}</strong>
          </p>

          {/* Tabs */}
          <div style={styles.tabs}>
            {["All", "Reach", "Moderate", "Safe"].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={activeTab === tab ? { ...styles.tab, ...styles.tabActive } : styles.tab}>
                {tab === "Reach" ? "🔴" : tab === "Moderate" ? "🟡" : tab === "Safe" ? "🟢" : "📋"} {tab}
                <span style={styles.tabCount}>{counts[tab]}</span>
              </button>
            ))}
          </div>

          {/* Results Table */}
          {filteredColleges.length === 0 ? (
            <div style={styles.noResults}>
              No colleges found for this filter. Try a different tab or broaden your search.
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thead}>
                    <th style={styles.th}>College</th>
                    <th style={styles.th}>Branch</th>
                    <th style={styles.th}>District</th>
                    <th style={styles.th}>Cutoff %ile</th>
                    <th style={styles.th}>Cutoff Rank</th>
                    <th style={styles.th}>Fee (₹)</th>
                    <th style={styles.th}>Chance</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredColleges.map((c, i) => (
                    <tr key={i} style={i % 2 === 0 ? styles.trEven : styles.trOdd}>
                      <td style={styles.td}>
                        <div style={styles.collegeName}>{c.college_name}</div>
                        <div style={styles.collegeType}>{c.college_type}</div>
                      </td>
                      <td style={styles.td}>{c.branch}</td>
                      <td style={styles.td}>{c.district}</td>
                      <td style={{ ...styles.td, textAlign: "center", fontWeight: 600 }}>
                        {typeof c.cutoff_percentile === "number"
                          ? c.cutoff_percentile.toFixed(2)
                          : c.cutoff_percentile}
                      </td>
                      <td style={{ ...styles.td, textAlign: "center" }}>
                        {c.cutoff_rank !== "N/A" ? Number(c.cutoff_rank).toLocaleString() : "N/A"}
                      </td>
                      <td style={{ ...styles.td, textAlign: "center" }}>
                        {c.total_fee !== "N/A" ? `₹${Number(c.total_fee).toLocaleString()}` : "N/A"}
                      </td>
                      <td style={{ ...styles.td, textAlign: "center" }}>
                        <span style={{
                          ...styles.chanceBadge,
                          background: c.admission_chance === "Safe"
                            ? "#dcfce7" : c.admission_chance === "Moderate"
                            ? "#fef9c3" : "#fee2e2",
                          color: c.admission_chance === "Safe"
                            ? "#16a34a" : c.admission_chance === "Moderate"
                            ? "#ca8a04" : "#dc2626",
                        }}>
                          {c.admission_chance === "Safe" ? "🟢" : c.admission_chance === "Moderate" ? "🟡" : "🔴"}
                          {" "}{c.admission_chance}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={styles.footer}>
        <p>MHT-CET College Predictor • Data based on official CAP Round cutoffs</p>
        <p style={{ fontSize: 12, marginTop: 4, opacity: 0.7 }}>
          Results are indicative. Always verify with official DTE Maharashtra website.
        </p>
      </div>
    </div>
  );
}

// ── Helper: build human-readable category label ───────────────────────────────
function getCategoryLabel(gender, caste, quota, uniType) {
  if (quota === "EWS")    return "Economically Weaker Section (EWS)";
  if (quota === "TFWS")   return "Tuition Fee Waiver Scheme (TFWS)";
  if (quota === "MI")     return "Minority Quota (MI)";
  if (quota === "ORPHAN") return "Orphan Category";
  if (quota === "AI")     return "All India Quota (AI)";

  const gLabel    = gender === "Male" ? "General" : "Ladies";
  const casteMap  = { OPEN: "Open", OBC: "OBC", SC: "SC", ST: "ST", SEBC: "SEBC", VJ: "VJ (Denotified Tribes)", NT1: "NT1 (Banjara)", NT2: "NT2 (Dhangar)", NT3: "NT3 (Vanjari)" };
  const quotaLabel = quota === "PWD" ? "PWD " : quota === "DEF" ? "Defence " : "";
  const uniLabel  = uniType === "Home University" ? "Home University" : uniType === "Other University" ? "Other University" : "State Level";

  return `${quotaLabel}${gLabel} ${casteMap[caste] || caste} – ${uniLabel}`;
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  page: { minHeight: "100vh", background: "#f8fafc", fontFamily: "'Segoe UI', sans-serif" },

  header: { background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", padding: "48px 20px", textAlign: "center" },
  headerContent: { maxWidth: 700, margin: "0 auto" },
  subtitle: { color: "rgba(255,255,255,0.8)", fontSize: 13, letterSpacing: 2, marginBottom: 8 },
  title: { color: "#fff", fontSize: 36, fontWeight: 800, margin: "0 0 12px" },
  desc: { color: "rgba(255,255,255,0.85)", fontSize: 16, lineHeight: 1.6 },

  card: { maxWidth: 820, margin: "-24px auto 32px", background: "#fff", borderRadius: 16, padding: 32, boxShadow: "0 4px 24px rgba(0,0,0,0.10)" },
  cardTitle: { fontSize: 20, fontWeight: 700, color: "#1e293b", marginBottom: 24 },

  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 },
  field: { marginBottom: 20 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 8 },
  hint: { fontSize: 11, color: "#94a3b8", marginTop: 4, display: "block" },

  input: { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 15, outline: "none", boxSizing: "border-box" },
  select: { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", background: "#fff", boxSizing: "border-box" },

  btnGroup: { display: "flex", gap: 8, flexWrap: "wrap" },
  btnActive: { padding: "8px 16px", borderRadius: 8, border: "2px solid #6366f1", background: "#6366f1", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 13 },
  btnInactive: { padding: "8px 16px", borderRadius: 8, border: "2px solid #e2e8f0", background: "#fff", color: "#475569", fontWeight: 500, cursor: "pointer", fontSize: 13 },

  multiSelectBox: { padding: "10px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff" },
  dropdown: { position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 8, maxHeight: 220, overflowY: "auto", zIndex: 100, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" },
  dropdownItem: { display: "flex", alignItems: "center", padding: "8px 14px", cursor: "pointer", fontSize: 13, color: "#1e293b" },
  tag: { background: "#ede9fe", color: "#6366f1", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500 },

  categoryPreview: { background: "#f5f3ff", border: "1.5px solid #c4b5fd", borderRadius: 8, padding: "10px 16px", marginBottom: 20, fontSize: 14, color: "#1e293b" },
  error: { background: "#fee2e2", color: "#dc2626", padding: "10px 16px", borderRadius: 8, marginBottom: 16, fontSize: 14 },

  predictBtn: { width: "100%", padding: "14px", background: "linear-gradient(135deg, #6366f1, #7c3aed)", color: "#fff", border: "none", borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: "pointer" },

  resultsSection: { maxWidth: 1100, margin: "0 auto 40px", padding: "0 16px" },
  resultsTitle: { fontSize: 22, fontWeight: 700, color: "#1e293b", marginBottom: 4 },
  resultsSubtitle: { color: "#64748b", fontSize: 14, marginBottom: 20 },

  tabs: { display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" },
  tab: { padding: "8px 18px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b", cursor: "pointer", fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center", gap: 6 },
  tabActive: { border: "1.5px solid #6366f1", background: "#ede9fe", color: "#6366f1", fontWeight: 700 },
  tabCount: { background: "#e2e8f0", borderRadius: 20, padding: "1px 8px", fontSize: 12 },

  noResults: { textAlign: "center", padding: 40, color: "#94a3b8", fontSize: 16 },

  tableWrapper: { overflowX: "auto", borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" },
  table: { width: "100%", borderCollapse: "collapse", background: "#fff" },
  thead: { background: "linear-gradient(135deg, #4f46e5, #7c3aed)" },
  th: { padding: "12px 16px", color: "#fff", fontSize: 13, fontWeight: 600, textAlign: "left", whiteSpace: "nowrap" },
  trEven: { background: "#fff" },
  trOdd: { background: "#f8fafc" },
  td: { padding: "12px 16px", fontSize: 13, color: "#334155", borderBottom: "1px solid #f1f5f9", verticalAlign: "top" },
  collegeName: { fontWeight: 600, color: "#1e293b", marginBottom: 2 },
  collegeType: { fontSize: 11, color: "#94a3b8" },
  chanceBadge: { padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" },

  footer: { textAlign: "center", padding: "24px", color: "#94a3b8", fontSize: 13 },
};
