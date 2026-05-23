import React, { useState, useEffect, useRef } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ── PLACEHOLDERS (update these when ready) ───────────────────────────────────
const GOOGLE_FORM_URL    = "https://docs.google.com/forms/d/e/1FAIpQLSeQm_ZVATB-GyaQrDR4qe1AMPi0aC1Lcrimx5v4U4-vfooKtg/viewform?usp=publish-editor";
const PREMIUM_FORM_URL   = "https://docs.google.com/forms/d/e/1FAIpQLSfFa4T3I_lx74G93fVjL0mB6DgUwtux3VyDSFLvB1Jto4MTew/viewform?usp=publish-editor";
const WHATSAPP_NUMBER = "918983798203";
const WHATSAPP_MSG    = "Hi Concept Delta, I need help choosing the right college.";

// ── Brand ────────────────────────────────────────────────────────────────────
// ── Responsive Hook ──────────────────────────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

// ── Animation Hook ───────────────────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function FadeIn({ children, delay = 0, direction = "up", style = {} }) {
  const [ref, visible] = useInView();
  const transforms = {
    up:"translateY(28px)", down:"translateY(-28px)",
    left:"translateX(-28px)", right:"translateX(28px)", none:"scale(0.97)"
  };
  return (
    <div ref={ref} style={{
      transition: `opacity 0.65s cubic-bezier(0.4,0,0.2,1) ${delay}s, transform 0.65s cubic-bezier(0.4,0,0.2,1) ${delay}s`,
      opacity: visible ? 1 : 0,
      transform: visible ? "none" : (transforms[direction] || transforms.up),
      ...style
    }}>
      {children}
    </div>
  );
}

const BRAND = {
  name:       "Concept Delta",
  tagline:    "SMART GUIDANCE · BETTER FUTURES",
  initiative: "An initiative by COEP alumni",
  contact:    "+91 89837 98203",
  social: {
    youtube:   "https://youtube.com/@conceptdelta2026",
    telegram:  "https://t.me/Conceptdelta",
    instagram: "https://www.instagram.com/conceptdelta2031",
  },
};

// ── Colours ───────────────────────────────────────────────────────────────────
const C = {
  navyDeep:    "#031343",
  navy:        "#0A2060",
  gold:        "#D4AF37",
  goldBg:      "#FEF3C7",
  goldDark:    "#92400E",
  pageBg:      "#F1F5F9",
  card:        "#FFFFFF",
  subtle:      "#F8FAFC",
  border:      "#E2E8F0",
  textDark:    "#031343",
  textBody:    "#475569",
  textMuted:   "#64748B",
  textLight:   "#94A3B8",
  safe:        "#16A34A",
  safeBg:      "#DCFCE7",
  safeText:    "#166534",
  modBg:       "#FEF9C3",
  modText:     "#854D0E",
  reachBg:     "#FEE2E2",
  reachText:   "#991B1B",
};

// ── Form options ──────────────────────────────────────────────────────────────
const CASTE_OPTS = [
  { value: "OPEN", label: "Open (General)" },
  { value: "OBC",  label: "OBC - Other Backward Class" },
  { value: "SC",   label: "SC - Scheduled Caste" },
  { value: "ST",   label: "ST - Scheduled Tribe" },
  { value: "SEBC", label: "SEBC" },
  { value: "VJ",   label: "VJ - Vimukta Jati" },
  { value: "NT1",  label: "NT1 - Nomadic Tribe 1 (Banjara)" },
  { value: "NT2",  label: "NT2 - Nomadic Tribe 2 (Dhangar)" },
  { value: "NT3",  label: "NT3 - Nomadic Tribe 3 (Vanjari)" },
];
const QUOTA_OPTS = [
  { value: "NONE",   label: "None" },
  { value: "PWD",    label: "PWD – Person with Disability" },
  { value: "DEF",    label: "Defence Personnel Children" },
  { value: "EWS",    label: "EWS – Economically Weaker Section" },
  { value: "TFWS",   label: "TFWS – Tuition Fee Waiver" },
  { value: "MI",     label: "Minority Quota" },
  { value: "ORPHAN", label: "Orphan Category" },
  { value: "AI",     label: "All India Quota" },
];
const UNI_OPTS = [
  { value: "State Level",      label: "State Level (Most Common)" },
  { value: "Home University",  label: "Home University" },
  { value: "Other University", label: "Other University" },
];
const CAP_ROUNDS = ["CAP Round 1","CAP Round 2","CAP Round 3","CAP Round 4"];
const DOC_CATS   = ["Open","OBC","SC","ST","EWS","MINORITY","PWD","DEFENCE","ORPHAN","TFWS"];
const DOC_LABELS = {
  Open:     "Open (General)",
  OBC:      "OBC / SBC / VJ / NT",
  SC:       "SC – Scheduled Caste",
  ST:       "ST – Scheduled Tribe",
  EWS:      "EWS – Eco. Weaker Section",
  MINORITY: "Minority",
  PWD:      "PWD – Person with Disability",
  DEFENCE:  "Defence Personnel",
  ORPHAN:   "Orphan Category",
  TFWS:     "TFWS – Tuition Fee Waiver",
};

const SIDEBAR_SERVICES = [
  // FREE
  { id:"predictor",  label:"Detailed College Predictor",           icon:"🎯", free:true,  panel:"predictor" },
  { id:"call",       label:"Call Support",                        icon:"📞", free:true,  panel:"contact" },
  { id:"documents",  label:"Document Support",                    icon:"📄", free:true,  panel:"documents" },
  // PAID — all open the same poster page "buy-premium"
  { id:"option-form",   label:"Personalized Option Form",                  icon:"✏️", free:false, panel:"buy-premium" },
  { id:"branch",        label:"Branch & College Guidance",                 icon:"🎓", free:false, panel:"buy-premium" },
  { id:"filling",       label:"Option Form Filling Guidance",              icon:"📝", free:false, panel:"buy-premium" },
  { id:"counselling",   label:"Complete Counselling",                      icon:"🤝", free:false, panel:"buy-premium" },
  { id:"mentorship",    label:"Live Mentorship",                           icon:"⭐", free:false, panel:"buy-premium" },
  { id:"chat24",        label:"24×7 Chat Support",                         icon:"💬", free:false, panel:"buy-premium" },
  { id:"mentor",        label:"Personal Mentor",                           icon:"👨‍🏫",free:false, panel:"buy-premium" },
  { id:"admission",     label:"Admission Assistance",                      icon:"🏛️", free:false, panel:"buy-premium" },
  { id:"cap-round",     label:"CAP Round Support",                         icon:"🔄", free:false, panel:"buy-premium" },
  { id:"ils",           label:"ILS / Spot Round Guidance",                 icon:"🔦", free:false, panel:"buy-premium" },
  { id:"lecture",       label:"Special Guest Lecture on Each Branch",      icon:"🎤", free:false, panel:"buy-premium" },
  { id:"material",      label:"Personalized Counselling Material",         icon:"📚", free:false, panel:"buy-premium" },
  { id:"recordings",    label:"Live Session Recordings",                   icon:"🎥", free:false, panel:"buy-premium" },
  { id:"whatsapp-grp",  label:"WhatsApp Group Access & Guidance Material", icon:"💼", free:false, panel:"buy-premium" },
];

// ─────────────────────────────────────────────────────────────────────────────
// SVG SOCIAL ICONS
// ─────────────────────────────────────────────────────────────────────────────
// color="white" for icons on colored bg, color="brand" for standalone use
function YTIcon({ size = 24, color = "#FF0000" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}
function TGIcon({ size = 24, color = "#0088CC" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  );
}
function IGIcon({ size = 24, color = null }) {
  // color=null → gradient; color="white" → flat white
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      {!color && (
        <defs>
          <linearGradient id="igGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f09433"/>
            <stop offset="25%" stopColor="#e6683c"/>
            <stop offset="50%" stopColor="#dc2743"/>
            <stop offset="75%" stopColor="#cc2366"/>
            <stop offset="100%" stopColor="#bc1888"/>
          </linearGradient>
        </defs>
      )}
      <path fill={color || "url(#igGrad)"} d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
    </svg>
  );
}
function WAIcon({ size = 24, color = "#fff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#25D366"/>
      <path d="M16 7C11.03 7 7 11.03 7 16c0 1.61.42 3.12 1.15 4.43L7 25l4.69-1.12A9 9 0 0 0 16 25c4.97 0 9-4.03 9-9s-4.03-9-9-9z" fill="white"/>
      <path d="M20.87 18.59c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.17.25-.64.81-.78.97-.15.17-.29.19-.54.06-.25-.12-1.05-.39-2-.12-.75-.66-1.24-1.47-1.38-1.72-.15-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43-.15 0-.31-.01-.48-.01-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07s.89 2.4 1.01 2.57c.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.11-.23-.17-.48-.29z" fill="#25D366"/>
    </svg>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ANIMATED COUNTER
// ═════════════════════════════════════════════════════════════════════════════
function AnimatedCounter({ target, suffix = "", duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const tick = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
            else setCount(target);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// ═════════════════════════════════════════════════════════════════════════════
// ROOT APP
// ═════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [panel,         setPanel]        = useState("predictor");
  const [sidebarOpen,   setSidebarOpen]  = useState(false);
  const [showAllPremium,setShowAllPremium]= useState(false);
  const isMobile = useIsMobile();
  const [infoMsg,       setInfoMsg]      = useState("");

  const navigate = (svc) => {
    if (svc.panel === "info") {
      setInfoMsg(svc.info);
      setPanel("info");
    } else {
      setPanel(svc.panel);
      setInfoMsg("");
    }
    setSidebarOpen(false);
  };

  return (
    <div style={s.app}>
      {/* ── Mobile CSS ── */}
      <style>{`
        @media (max-width: 768px) {
          .mob-row2      { grid-template-columns: 1fr !important; }
          .mob-col1      { grid-template-columns: 1fr !important; }
          .mob-hide      { display: none !important; }
          .mob-small     { font-size: 13px !important; }
          .mob-wrap      { flex-wrap: wrap !important; }
          .mob-center    { text-align: center !important; }
          .mob-pad       { padding: 16px 12px !important; }
          .mob-full      { width: 100% !important; }
        }
      `}</style>
      {/* ── Tagline bar ── */}
      <div style={s.taglineBar}>{BRAND.tagline}</div>

      {/* ── Navbar ── */}
      <nav style={s.nav}>
        <div style={s.navLeft}>
          {/* Hamburger */}
          <button style={s.hamburger} onClick={() => setSidebarOpen(!sidebarOpen)}
                  aria-label="Toggle menu">
            <span style={s.hLine}/><span style={s.hLine}/><span style={s.hLine}/>
          </button>
          {/* Logo + brand */}
          <div style={s.brandWrap}>
            <div style={s.logoCircle}>
              <img src="/logo.jpeg" alt="CD" style={s.logoImg}
                   onError={e => { e.target.style.display="none"; }}/>
            </div>
            <div>
              <div style={s.brandName}>{BRAND.name}</div>
              <div style={s.brandInit}>{BRAND.initiative}</div>
            </div>
          </div>
        </div>
        {/* Desktop only — hidden on mobile */}
        {!isMobile && (
          <div style={s.navRight}>
            <a href={BRAND.social.youtube} target="_blank" rel="noopener noreferrer" style={{...s.socialA, background:"#FF0000"}} title="YouTube">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
            <a href={BRAND.social.telegram} target="_blank" rel="noopener noreferrer" style={{...s.socialA, background:"#0088CC"}} title="Telegram">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
            </a>
            <a href={BRAND.social.instagram} target="_blank" rel="noopener noreferrer" style={{...s.socialA, background:"linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)"}} title="Instagram">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
            </a>
            {panel === "predictor" && <BookSessionBtn />}
          </div>
        )}
      </nav>

      {/* ── Overlay when sidebar open ── */}
      {sidebarOpen && (
        <div style={s.overlay} onClick={() => setSidebarOpen(false)}/>
      )}

      {/* ── Sidebar drawer ── */}
      <aside style={{ ...s.sidebar, transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)" }}>
        <div style={s.sidebarHeader}>
          <span style={s.sidebarTitle}>Services</span>
          <button style={s.closeBtn} onClick={() => setSidebarOpen(false)}>✕</button>
        </div>

        {/* FREE section */}
        <div style={s.sectionLbl}>
          <span style={s.tagFree}>FREE</span> SERVICES
        </div>
        {SIDEBAR_SERVICES.filter(s => s.free).map((svc, i) => (
          <FadeIn key={svc.id} delay={i*0.06} direction="left"><SidebarItem svc={svc} active={panel === svc.panel}
                       onClick={() => navigate(svc)} /></FadeIn>
        ))}

        {/* PAID section — non-clickable list + buy button */}
        <div style={{ ...s.sectionLbl, marginTop: 16 }}>
          <span style={s.tagPaid}>PREMIUM</span> SERVICES
        </div>
        {SIDEBAR_SERVICES.filter(sv => !sv.free)
          .slice(0, showAllPremium ? undefined : 6)
          .map((svc, i) => (
            <FadeIn key={svc.id} delay={i*0.03} direction="left">
              <div style={{ display:"flex", alignItems:"center", gap:10, padding:"7px 12px",
                            color:"#1E293B", fontSize:13, cursor:"default" }}>
                <span style={{ fontSize:15, flexShrink:0 }}>{svc.icon}</span>
                <span style={{ lineHeight:1.4, fontWeight:400 }}>{svc.label}</span>
              </div>
            </FadeIn>
          ))}
        <div onClick={() => setShowAllPremium(!showAllPremium)}
             style={{ padding:"4px 12px 6px", color:C.navy, fontSize:12,
                      fontWeight:600, cursor:"pointer", textDecoration:"underline" }}>
          {showAllPremium
            ? "▲ Show less"
            : `▼ +${SIDEBAR_SERVICES.filter(sv => !sv.free).length - 6} more services included`}
        </div>
        {/* Buy button */}
        <FadeIn delay={0.1} direction="left">
          <div onClick={() => { setPanel("buy-premium"); setSidebarOpen(false); window.scrollTo({top:0,behavior:"smooth"}); }}
               style={{ background:C.gold, borderRadius:8, padding:"10px 8px", margin:"10px 8px 0",
                        textAlign:"center", cursor:"pointer" }}>
            <div style={{ fontSize:11, color:C.navyDeep, textDecoration:"line-through", opacity:0.6 }}>₹3,000</div>
            <div style={{ color:C.navyDeep, fontWeight:700, fontSize:14, display:"flex",
                          alignItems:"center", justifyContent:"center", gap:6 }}>
              <span style={{ fontSize:16, filter:"grayscale(1) brightness(2.5)" }}>🛒</span> Buy at ₹1,500
            </div>
            <div style={{ background:"#DC2626", color:"#fff", fontSize:9, fontWeight:700,
                          padding:"2px 8px", borderRadius:10, display:"inline-block", marginTop:4 }}>
              50% OFF
            </div>
          </div>
        </FadeIn>
      </aside>

      {/* ── Hero — only on landing/predictor page ── */}
      {panel === "predictor" && (
      <div style={s.hero}>
        <FadeIn delay={0.1} direction="none"><div style={s.heroBadge}>MHT-CET 2026 · MAHARASHTRA</div></FadeIn>
        <FadeIn delay={0.2}><h1 style={s.heroTitle}>Find your perfect engineering college</h1></FadeIn>
        <FadeIn delay={0.35}><p style={s.heroSub}>Personalized predictions · Safe, Moderate & Reach picks · Download as PDF</p></FadeIn>
        <FadeIn delay={0.5}><div style={s.statsRow}>
          <div style={s.statItem}>
            <div style={s.statNum}><AnimatedCounter target={275} suffix="+" duration={2000}/></div>
            <div style={s.statLbl}>COLLEGES</div>
          </div>
          <div style={s.statDivider}/>
          <div style={s.statItem}>
            <div style={s.statNum}><AnimatedCounter target={95} duration={1800}/></div>
            <div style={s.statLbl}>BRANCHES</div>
          </div>
          <div style={s.statDivider}/>
          <div style={s.statItem}>
            <div style={s.statNum}><AnimatedCounter target={4} duration={1000}/></div>
            <div style={s.statLbl}>CAP ROUNDS</div>
          </div>
        </div></FadeIn>

        {/* Mobile only — Book a Free Counselling Session below stats */}
        {isMobile && (
          <FadeIn delay={0.65}>
            <a href={GOOGLE_FORM_URL} target="_blank" rel="noopener noreferrer"
               style={{ display:"inline-block", marginTop:16, background:C.gold,
                        color:C.navyDeep, padding:"11px 24px", borderRadius:10,
                        fontWeight:700, fontSize:13, textDecoration:"none",
                        letterSpacing:"0.3px" }}>
              📅 Book a Free Counselling Session
            </a>
          </FadeIn>
        )}
      </div>
      )} {/* end hero */}

      {/* ── Main panel ── */}
      <div style={s.mainWrap}>
        {panel === "predictor"   && <PredictorPanel />}
        {panel === "documents"   && <DocumentsPanel />}
        {panel === "buy-premium" && <PremiumPosterPanel />}
        {panel === "paid"        && <PremiumPosterPanel />}
        {panel === "contact"     && <ContactPanel />}
        {panel === "info"        && <InfoPanel msg={infoMsg} />}
      </div>

      <SiteFooter setPanel={setPanel} isMobile={window.innerWidth <= 768} />

      {/* Floating WhatsApp — bottom-right, 100px from bottom */}
      {!isMobile && (
        <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MSG)}`}
           target="_blank" rel="noopener noreferrer" style={s.whatsappFloat}
           title="Chat on WhatsApp">
          <WAIcon size={22} color="#fff"/>
          <span>Chat with us</span>
        </a>
      )}
    </div>
  );
}

// ── Sidebar Item ──────────────────────────────────────────────────────────────
function SidebarItem({ svc, active, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <div onClick={onClick}
         onMouseEnter={() => setHover(true)}
         onMouseLeave={() => setHover(false)}
         style={{
           display:"flex", alignItems:"center", gap:10,
           padding:"10px 14px", borderRadius:8, marginBottom:3,
           cursor:"pointer",
           background: active ? "#EFF6FF" : hover ? C.subtle : "transparent",
           borderLeft: active ? `3px solid ${C.navy}` : "3px solid transparent",
           transition:"all 0.15s",
         }}>
      <span style={{ fontSize:18 }}>{svc.icon}</span>
      <div style={{ fontSize:14, color: active ? C.navy : C.textDark, fontWeight: active ? 700 : 400 }}>
        {svc.label}
      </div>
    </div>
  );
}

// ── Book Session Button ───────────────────────────────────────────────────────
function BookSessionBtn() {
  const isMob = window.innerWidth <= 768;
  return (
    <a href={GOOGLE_FORM_URL} target="_blank" rel="noopener noreferrer"
       style={{ ...s.bookBtn,
         fontSize: isMob ? 10 : 13,
         padding: isMob ? "7px 10px" : "9px 16px",
         whiteSpace: "nowrap"
       }}>
      📅 {isMob ? "Free Counselling" : "Book a Free Counselling Session"}
    </a>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// COLLEGE PREDICTOR PANEL
// ═════════════════════════════════════════════════════════════════════════════
function PredictorPanel() {
  const [percentile, setPercentile] = useState("");
  const [gender,     setGender]     = useState("Male");
  const [caste,      setCaste]      = useState("OPEN");
  const [quota,      setQuota]      = useState("NONE");
  const [uniType,    setUniType]    = useState("State Level");
  const [capRound,   setCapRound]   = useState("CAP Round 1");
  const [selBranches,  setSelBranches]  = useState([]);
  const [selDistricts, setSelDistricts] = useState([]);
  const [showFilters, setShowFilters]   = useState(false);
  const [allBranches,  setAllBranches]  = useState([]);
  const [allDistricts, setAllDistricts] = useState([]);

  const [results,   setResults]   = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const resultsRef = useRef(null);

  useEffect(() => {
    fetch(`${API_BASE}/branches`).then(r=>r.json()).then(d=>setAllBranches(d.branches||[])).catch(()=>{});
    fetch(`${API_BASE}/districts`).then(r=>r.json()).then(d=>setAllDistricts(d.districts||[])).catch(()=>{});
  }, []);

  const isStandalone = ["EWS","TFWS","MI","ORPHAN","AI"].includes(quota);

  // Live category code preview
  const catPreview = (() => {
    if (quota==="EWS")    return { code:"EWS",    desc:"Economically Weaker Section" };
    if (quota==="TFWS")   return { code:"TFWS",   desc:"Tuition Fee Waiver Scheme" };
    if (quota==="MI")     return { code:"MI",     desc:"Minority Quota" };
    if (quota==="ORPHAN") return { code:"ORPHAN", desc:"Orphan Category" };
    if (quota==="AI")     return { code:"AI",     desc:"All India Quota" };
    const sfx = uniType==="Home University"?"H": uniType==="Other University"?"O":"S";
    const pfx = gender==="Male"?"G":"L";
    let code;
    if (quota==="PWD") code = `PWD${caste==="OPEN"?"OPEN":caste}${sfx}`;
    else if (quota==="DEF") code = `DEF${caste==="OPEN"?"OPEN":caste}${sfx}`;
    else code = `${pfx}${caste}${sfx}`;
    const gl   = gender==="Male"?"General":"Ladies";
    const ql   = quota==="PWD"?"PWD ": quota==="DEF"?"Defence ":"";
    return { code, desc:`${ql}${gl} ${caste} · ${uniType}` };
  })();

  const buildParams = () => {
    const p = new URLSearchParams({
      percentile,
      gender,
      caste:    isStandalone ? "OPEN" : caste,
      quota,
      uni_type: isStandalone ? "State Level" : uniType,
      cap_round: capRound,
    });
    if (selBranches.length)  p.append("branches",  selBranches.join(","));
    if (selDistricts.length) p.append("districts", selDistricts.join(","));
    return p;
  };

  const handlePredict = async () => {
    if (!percentile || isNaN(percentile) || +percentile < 0 || +percentile > 100) {
      setError("Please enter a valid percentile between 0 and 100.");
      return;
    }
    setError(""); setLoading(true); setResults(null);
    try {
      const res  = await fetch(`${API_BASE}/predict?${buildParams()}`);
      const data = await res.json();
      setResults(data);
      setActiveTab("All");
      setSearchQuery("");
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior:"smooth" }), 100);
    } catch {
      setError("Server is waking up – please wait 30 seconds and try again.");
    } finally { setLoading(false); }
  };

  const downloadPDF = () => window.open(`${API_BASE}/predict-pdf?${buildParams()}`, "_blank");

  const filtered = results?.colleges?.filter(c => {
    const matchTab = activeTab==="All" || c.admission_chance===activeTab;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q ||
      c.college_name?.toLowerCase().includes(q) ||
      c.branch?.toLowerCase().includes(q) ||
      c.district?.toLowerCase().includes(q) ||
      String(c.institution_code).includes(q);
    return matchTab && matchSearch;
  }) || [];

  return (
    <div>
      {/* ── Breadcrumb ── */}
      <div style={s.breadcrumb}>Free Services › <strong>College Prediction</strong></div>
      <div style={s.panelHeaderRow}>
        <div>
          <h2 style={s.panelTitle}>MHT-CET College Predictor <span style={s.yr26}>2026</span></h2>
          <p style={s.panelSub}>Find Safe · Moderate · Reach colleges based on your profile</p>
        </div>
        <span style={s.freePill}>🎁 100% Free</span>
      </div>

      {/* ── Form ── */}
      <FadeIn delay={0.1} direction="up"><div style={s.card}>
        <SectionHeading title="Enter your details" />

        <div style={s.row2}>
          <Field label="Your Percentile *">
            <input type="number" step="0.01" min="0" max="100"
                   placeholder="e.g. 92.50" value={percentile}
                   onChange={e=>setPercentile(e.target.value)} style={s.input}/>
          </Field>
          <Field label="CAP Round *">
            <select value={capRound} onChange={e=>setCapRound(e.target.value)} style={s.select}>
              {CAP_ROUNDS.map(r=><option key={r} value={r}>{r.replace("CAP ","")}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Gender *">
          <div style={s.genderRow}>
            {["Male","Female"].map(g=>(
              <button key={g} onClick={()=>setGender(g)}
                      style={gender===g ? s.gBtnActive : s.gBtn}>{g}</button>
            ))}
          </div>
        </Field>

        {!isStandalone && (
          <div style={s.row2}>
            <Field label="Caste Category *">
              <select value={caste} onChange={e=>setCaste(e.target.value)} style={s.select}>
                {CASTE_OPTS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
            <Field label="University Type *">
              <select value={uniType} onChange={e=>setUniType(e.target.value)} style={s.select}>
                {UNI_OPTS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
          </div>
        )}

        <Field label="Special Quota (Optional)">
          <select value={quota} onChange={e=>setQuota(e.target.value)} style={s.select}>
            {QUOTA_OPTS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>

        {/* Optional filters */}
        <div style={s.filterBox}>
          <div onClick={()=>setShowFilters(!showFilters)} style={s.filterToggle}>
            <span>🔍 Preferred branches & districts (optional)</span>
            <span>{showFilters?"▲":"▼"}</span>
          </div>
          {showFilters && (
            <div style={{ marginTop:14 }}>
              <Field label="Preferred Branches">
                <MultiSelect options={allBranches} selected={selBranches}
                             onChange={setSelBranches} placeholder="All branches"/>
              </Field>
              <Field label="Preferred Districts">
                <MultiSelect options={allDistricts} selected={selDistricts}
                             onChange={setSelDistricts} placeholder="All districts"/>
              </Field>
            </div>
          )}
        </div>

        {/* Category preview */}
        <div style={s.catPreview}>
          <span style={{ color:"#1E40AF", fontWeight:600 }}>🔖 Your category: </span>
          <span style={{ color:C.textDark, fontWeight:700 }}>{catPreview.code}</span>
          <span style={{ color:C.textMuted, fontSize:12 }}> — {catPreview.desc}</span>
          <span style={{ float:"right", color:"#16A34A" }}>✅</span>
        </div>

        {/* AI Quota Warning */}
        {quota === "AI" && (
          <div style={s.aiWarning}>
            ⚠️ <strong>Important:</strong> The cutoff percentiles shown for AI (All India) Quota are based on <strong>JEE Main percentile</strong>, not MHT-CET. Please use your JEE percentile to interpret these results.
          </div>
        )}

        {error && <div style={s.errorBox}>⚠ {error}</div>}

        <button onClick={handlePredict} disabled={loading} style={s.predictBtn}>
          {loading ? "⏳ Finding your colleges…" : "🔍 FIND MY COLLEGES"}
        </button>
      </div></FadeIn>

      {/* ── Results ── */}
      {results && (
        <div ref={resultsRef} style={{ marginTop:24 }}>
          <div style={s.resultsHeader}>
            <div>
              <h3 style={s.resultsTitle}>
                <span style={{ color:C.navy }}>{results.total_results}</span> colleges found
              </h3>
              <div style={s.resultsMeta}>
                Category: <strong>{results.category_codes?.join(", ")}</strong>
                {" · "}<strong>{results.cap_round}</strong>
                {" · "}Percentile <strong>{results.percentile}</strong>
              </div>
              {results.category_codes?.includes("AI") && (
                <div style={s.aiWarning}>
                  ⚠️ <strong>AI Quota Note:</strong> Cutoff percentiles shown are <strong>JEE Main percentiles</strong>, not MHT-CET. Use your JEE score to evaluate these results.
                </div>
              )}
            </div>
            <button onClick={downloadPDF} style={s.dlBtn}>📥 Download PDF</button>
          </div>

          {/* Tab pills */}
          <div style={s.tabs}>
            {[
              { key:"All",      label:"All",         n:results.total_results },
              { key:"Safe",     label:"🟢 Safe",     n:results.safe_count },
              { key:"Moderate", label:"🟡 Moderate", n:results.moderate_count },
              { key:"Reach",    label:"🔴 Reach",    n:results.reach_count },
            ].map(t=>(
              <button key={t.key} onClick={()=>setActiveTab(t.key)}
                      style={activeTab===t.key ? s.tabActive : s.tab}>
                {t.label} <span style={s.tabBadge}>{t.n}</span>
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div style={s.searchWrap}>
            <div style={s.searchIcon}>🔍</div>
            <input
              type="text"
              placeholder="Search by college name, branch, district or code..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={s.searchInput}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} style={s.searchClear}>✕</button>
            )}
          </div>
          {searchQuery && (
            <div style={s.searchCount}>
              Showing <strong>{filtered.length}</strong> of {results.total_results} colleges
              {activeTab !== "All" ? ` (${activeTab})` : ""}
              {" "}matching "<strong>{searchQuery}</strong>"
            </div>
          )}

          {/* College cards */}
          {filtered.length===0
            ? <div style={s.noResults}>
                {searchQuery
                  ? `No colleges found for "${searchQuery}". Try a different search.`
                  : "No colleges for this filter. Try another tab."
                }
              </div>
            : filtered.map((c,i)=><CollegeCard key={i} c={c}/>)
          }
        </div>
      )}
    </div>
  );
}

// ── College Card ──────────────────────────────────────────────────────────────
function CollegeCard({ c }) {
  const borderColor = c.admission_chance==="Safe" ? C.safe
                    : c.admission_chance==="Moderate" ? "#CA8A04" : "#DC2626";
  const bg   = c.admission_chance==="Safe" ? C.safeBg
             : c.admission_chance==="Moderate" ? C.modBg : C.reachBg;
  const txt  = c.admission_chance==="Safe" ? C.safeText
             : c.admission_chance==="Moderate" ? C.modText : C.reachText;

  const [hovered, setHovered] = useState(false);
  const pct = typeof c.cutoff_percentile==="number"
              ? c.cutoff_percentile.toFixed(2)+"ile"
              : c.cutoff_percentile;
  const rank = c.cutoff_rank!=="N/A" ? (+c.cutoff_rank).toLocaleString() : "N/A";

  return (
    <div style={{ ...s.collegeCard, borderLeft:`4px solid ${borderColor}`,
                transform: hovered ? "translateY(-3px)" : "none",
                boxShadow: hovered ? "0 8px 24px rgba(44,82,130,0.12)" : "0 1px 4px rgba(0,0,0,0.06)" }}
         onMouseEnter={()=>setHovered(true)}
         onMouseLeave={()=>setHovered(false)}>
      <div style={s.ccTop}>
        <div>
          <div style={s.ccCode}>Code: {c.institution_code}</div>
          <div style={s.ccName}>{c.college_name}</div>
          <div style={s.ccSub}>📍 {c.district} · {c.college_type}</div>
        </div>
        <span style={{ ...s.chancePill, background:bg, color:txt }}>
          {c.admission_chance==="Safe"?"🟢":c.admission_chance==="Moderate"?"🟡":"🔴"} {c.admission_chance.toUpperCase()}
        </span>
      </div>
      <div style={s.ccMeta}>
        <div>
          <div style={s.ccMetaLbl}>BRANCH</div>
          <div style={s.ccMetaVal}>{c.branch}</div>
        </div>
        <div>
          <div style={s.ccMetaLbl}>CUTOFF %ILE</div>
          <div style={s.ccMetaVal}>{pct}</div>
        </div>
        <div>
          <div style={s.ccMetaLbl}>CUTOFF RANK</div>
          <div style={s.ccMetaVal}>{rank}</div>
        </div>
        <div>
          <div style={s.ccMetaLbl}>CATEGORY</div>
          <div style={s.ccMetaVal}>{c.category}</div>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// DOCUMENTS PANEL
// ═════════════════════════════════════════════════════════════════════════════
function DocumentsPanel() {
  const [cat,  setCat]  = useState("Open");
  const [docs, setDocs] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/documents?category=${cat}`)
      .then(r=>r.json()).then(setDocs).catch(()=>{});
  }, [cat]);

  const downloadDocPDF = () =>
    window.open(`${API_BASE}/documents-pdf?category=${cat}`, "_blank");

  return (
    <div>
      <div style={s.breadcrumb}>Free Services › <strong>Document Support</strong></div>
      <div style={s.panelHeaderRow}>
        <div>
          <h2 style={s.panelTitle}>Documents Required</h2>
          <p style={s.panelSub}>For BE / B.Tech / B.Pharma admission process</p>
        </div>
        <span style={s.freePill}>🎁 Free</span>
      </div>

      <div style={s.card}>
        <SectionHeading title="Select your category" />
        <Field label="Category">
          <select value={cat} onChange={e => setCat(e.target.value)} style={s.select}>
            {DOC_CATS.map(dc => (
              <option key={dc} value={dc}>{DOC_LABELS[dc]}</option>
            ))}
          </select>
        </Field>
      </div>

      {docs && (
        <div style={{ ...s.card, marginTop:16 }}>
          <div style={s.resultsHeader}>
            <h3 style={{ ...s.resultsTitle, fontSize:16 }}>
              Required for {DOC_LABELS[cat]} — <span style={{ color:C.navy }}>{docs.total}</span> documents
            </h3>
            <button onClick={downloadDocPDF} style={s.dlBtn}>📥 Download PDF</button>
          </div>

          <div style={{ marginTop:14 }}>
            {docs.documents.map((d,i)=>(
              <div key={i} style={s.docItem}>
                <span style={s.docNum}>{i+1}</span>
                <span style={s.docText}>{d}</span>
              </div>
            ))}
          </div>

          {docs.notes && (
            <div style={s.noteBox}>
              <div style={s.noteTitle}>📌 Important Notes</div>
              {docs.notes.map((n,i)=>(
                <div key={i} style={s.noteItem}>• {n}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// PREMIUM SERVICE DETAILS
// ═════════════════════════════════════════════════════════════════════════════
const PREMIUM_DETAILS = {
  "option-form": {
    icon:"✏️", price:"₹199", badge:"Most Popular",
    title:"Personalized Option Form",
    desc:"Get a customized option form built by our experts based on your percentile, category, district preference and branch interest. Stop guessing — let us fill it right.",
    features:["Personalized college priority list","Category-wise cutoff analysis","District & region preference","Round-wise filling strategy","Delivered within 24 hours"],
  },
  "branch": {
    icon:"🎓", price:"₹299", badge:"High Demand",
    title:"Branch & College Guidance",
    desc:"Confused between CS, IT, ENTC, Mechanical? Our mentors help you pick the right branch based on your interests, market trends and career goals.",
    features:["1-on-1 mentor session (45 min)","Branch scope & salary comparison","Career path roadmap","College culture insights","2026 market trend analysis"],
  },
  "filling": {
    icon:"📝", price:"₹399", badge:null,
    title:"Option Form Filling",
    desc:"We sit with you and fill the actual CAP Round option form live — making sure every choice is in the right order to maximize your admission chances.",
    features:["Live screen-share session","Step-by-step form filling","Real-time cutoff reference","Priority order optimization","Post-submission guidance"],
  },
  "counselling": {
    icon:"🤝", price:"₹599", badge:"Best Value",
    title:"Complete Counselling Package",
    desc:"End-to-end support from option form to final admission. Our most comprehensive package covering everything you need for a stress-free admission.",
    features:["Option form + filling included","Branch & college guidance","Document checklist review","All CAP rounds covered","WhatsApp support throughout"],
  },
  "mentorship": {
    icon:"⭐", price:"₹249", badge:null,
    title:"Live Mentorship Session",
    desc:"A focused 1-on-1 session with a COEP alumni mentor. Ask anything about college life, placements, branch selection, hostel, future scope — nothing off limits.",
    features:["45-minute live session","COEP alumni mentor","College life insights","Placement & internship tips","Recording shared after session"],
  },
  "chat24": {
    icon:"💬", price:"₹149", badge:null,
    title:"24×7 Chat Support",
    desc:"Get instant answers to all your admission doubts on WhatsApp — anytime, day or night. Perfect for students who need quick answers during the stressful CAP process.",
    features:["WhatsApp chat support","Response within 30 minutes","Valid for entire CAP season","Unlimited questions","Document guidance included"],
  },
  "mentor": {
    icon:"👨‍🏫", price:"₹499", badge:null,
    title:"Personal Mentor",
    desc:"Get assigned a dedicated personal mentor (COEP alumni) who guides you throughout the entire admission process — from form filling to final seat confirmation.",
    features:["Dedicated personal mentor","Available on call + WhatsApp","Full CAP season coverage","College & branch strategy","Spot round guidance too"],
  },
  "admission": {
    icon:"🏛️", price:"₹299", badge:null,
    title:"Admission Assistance",
    desc:"On-ground help during the actual admission day — document verification, fee payment, college reporting. We make sure nothing goes wrong on the most important day.",
    features:["Document checklist review","Admission day support","Fee payment guidance","Reporting formalities help","Online + offline support"],
  },
  "cap-round": {
    icon:"🔄", price:"₹349", badge:null,
    title:"CAP Round Support",
    desc:"Expert guidance for every CAP round — when to freeze, when to float, how to upgrade. Maximize your seat with smart round-by-round strategy.",
    features:["All 4 CAP rounds covered","Freeze vs float strategy","Seat upgrade planning","Cutoff trend analysis","Real-time round support"],
  },
  "ils": {
    icon:"🔦", price:"₹199", badge:null,
    title:"ILS / Spot Round Guidance",
    desc:"Didn't get a seat in CAP rounds? Institute Level Seats and Spot rounds are your last chance — we help you navigate them perfectly.",
    features:["ILS eligibility check","Spot round college list","Application guidance","Document preparation","Same-day support available"],
  },
  "lecture": {
    icon:"🎤", price:"₹99", badge:"New",
    title:"Special Guest Lecture on Each Branch",
    desc:"Live online sessions by industry professionals and COEP seniors — one lecture per branch covering scope, placements, skills needed and real career stories.",
    features:["Live Zoom/Meet session","Industry expert speakers","Branch-specific content","Q&A session included","Recording available after"],
  },
};

// PREMIUM POSTER PANEL
// ═════════════════════════════════════════════════════════════════════════════
const ALL_PREMIUM_SERVICES = [
  { icon:"✏️", label:"Personalized Option Form" },
  { icon:"🎓", label:"Branch & College Guidance" },
  { icon:"📝", label:"Option Form Filling Guidance" },
  { icon:"🤝", label:"Complete Counselling" },
  { icon:"⭐", label:"Live Mentorship" },
  { icon:"💬", label:"24×7 Chat Support" },
  { icon:"👨‍🏫", label:"Personal Mentor" },
  { icon:"🏛️", label:"Admission Assistance" },
  { icon:"🔄", label:"CAP Round Support" },
  { icon:"🔦", label:"ILS / Spot Round Guidance" },
  { icon:"🎤", label:"Special Guest Lecture on Each Branch" },
  { icon:"📚", label:"Personalized Counselling Material" },
  { icon:"🎥", label:"Live Session Recordings" },
  { icon:"💼", label:"WhatsApp Group Access & Guidance Material" },
];

function PremiumPosterPanel() {
  const half = Math.ceil(ALL_PREMIUM_SERVICES.length / 2);
  const col1 = ALL_PREMIUM_SERVICES.slice(0, half);
  const col2 = ALL_PREMIUM_SERVICES.slice(half);

  return (
    <div>
      <div style={s.breadcrumb}>Premium Services</div>

      {/* Main poster card */}
      <div style={{ background:`linear-gradient(160deg, #031343 0%, #0A2060 55%, #031343 100%)`,
                    borderRadius:16, padding:"28px 24px", position:"relative", overflow:"hidden" }}>

        {/* Decorative circles */}
        <div style={{ position:"absolute", top:-40, right:-40, width:160, height:160,
                      background:"rgba(212,175,55,0.07)", borderRadius:"50%", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", bottom:-30, left:-30, width:100, height:100,
                      background:"rgba(212,175,55,0.05)", borderRadius:"50%", pointerEvents:"none" }}/>

        {/* Badge + price */}
        <div style={{ textAlign:"center", marginBottom:20 }}>
          <span style={{ background:"#DC2626", color:"#fff", fontSize:12, fontWeight:700,
                         padding:"5px 16px", borderRadius:20, letterSpacing:"0.05em" }}>
            LIMITED TIME — 50% OFF
          </span>
          <div style={{ color:"#94A3B8", fontSize:13, marginTop:12,
                        textDecoration:"line-through" }}>Regular price ₹3,000</div>
          <div style={{ color:C.gold, fontSize:44, fontWeight:700, lineHeight:1.1,
                        margin:"4px 0" }}>₹1,500</div>
          <div style={{ color:"#CBD5E1", fontSize:12 }}>
            One-time payment · Entire CAP 2026 season covered
          </div>
        </div>

        {/* Trust badges */}
        <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap", marginBottom:20 }}>
          {[
            { bg:"rgba(74,222,128,0.12)", border:"rgba(74,222,128,0.3)", color:"#4ADE80", txt:"✓ Instant Access" },
            { bg:"rgba(212,175,55,0.12)", border:"rgba(212,175,55,0.3)", color:C.gold, txt:"✓ COEP Alumni Mentors" },
            { bg:"rgba(147,197,253,0.12)", border:"rgba(147,197,253,0.3)", color:"#93C5FD", txt:"✓ Full Season Support" },
          ].map(b => (
            <div key={b.txt} style={{ background:b.bg, border:`0.5px solid ${b.border}`,
                                      color:b.color, fontSize:11, padding:"5px 12px", borderRadius:20 }}>
              {b.txt}
            </div>
          ))}
        </div>

        {/* Services grid */}
        <div style={{ background:"rgba(255,255,255,0.06)", border:"0.5px solid rgba(212,175,55,0.25)",
                      borderRadius:10, padding:"14px 16px", marginBottom:20 }}>
          <div style={{ color:C.gold, fontSize:12, fontWeight:700, marginBottom:12,
                        letterSpacing:"0.05em" }}>EVERYTHING INCLUDED IN ₹1,500</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4px 12px" }}>
            {[...col1.map((s,i) => ({ ...s, pair: col2[i] }))].map((item, i) => (
              <React.Fragment key={i}>
                <div style={{ display:"flex", alignItems:"center", gap:8, padding:"4px 0" }}>
                  <span style={{ color:"#4ADE80", fontSize:13, flexShrink:0 }}>✓</span>
                  <span style={{ color:"#E2E8F0", fontSize:12 }}>{item.label}</span>
                </div>
                {item.pair && (
                  <div style={{ display:"flex", alignItems:"center", gap:8, padding:"4px 0" }}>
                    <span style={{ color:"#4ADE80", fontSize:13, flexShrink:0 }}>✓</span>
                    <span style={{ color:"#E2E8F0", fontSize:12 }}>{item.pair.label}</span>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Purchase button */}
        <a href={PREMIUM_FORM_URL} target="_blank" rel="noopener noreferrer"
           style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10,
                    background:`linear-gradient(135deg, ${C.gold}, #B8972E)`,
                    color:C.navyDeep, fontWeight:700, fontSize:15, padding:"15px 24px",
                    borderRadius:10, textDecoration:"none", marginBottom:10 }}>
          🛒 Purchase Premium Package — ₹1,500
        </a>

        <div style={{ color:"#94A3B8", fontSize:11, textAlign:"center" }}>
          After purchase you will receive a confirmation email on your registered email ID.
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// CONTACT PANEL
// ═════════════════════════════════════════════════════════════════════════════
function ContactPanel() {
  return (
    <div>
      <div style={s.breadcrumb}>Free Services › <strong>Call Support</strong></div>
      <h2 style={s.panelTitle}>Contact Us</h2>
      <div style={s.card}>
        <div style={{ textAlign:"center", padding:"20px 0" }}>
          <div style={{ fontSize:48 }}>📞</div>
          <a href={`tel:${BRAND.contact.replace(/ /g,"")}`} style={{ fontSize:24, fontWeight:700, color:C.navyDeep, margin:"12px 0 4px", display:"block", textDecoration:"none" }}>{BRAND.contact}</a>
          <div style={{ color:C.textMuted, marginBottom:24 }}>Call or WhatsApp for free guidance</div>
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <a href={`tel:${BRAND.contact}`} style={s.contactBtn}>📞 Call Now</a>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MSG)}`}
               target="_blank" rel="noopener noreferrer"
               style={{ ...s.contactBtn, background:"#25D366" }}>💬 WhatsApp</a>
          </div>
        </div>
        <div style={s.divider}/>
        <div style={{ textAlign:"center" }}>
          <div style={{ color:C.textMuted, marginBottom:14 }}>Also find us on</div>
          <div style={{ display:"flex", gap:16, justifyContent:"center" }}>
            <a href={BRAND.social.youtube} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:6,color:"#FF0000",fontWeight:700,fontSize:14,textDecoration:"none"}}>
              <YTIcon size={22}/> YouTube
            </a>
            <a href={BRAND.social.telegram} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:6,color:"#0088CC",fontWeight:700,fontSize:14,textDecoration:"none"}}>
              <TGIcon size={22}/> Telegram
            </a>
            <a href={BRAND.social.instagram} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:6,color:"#E1306C",fontWeight:700,fontSize:14,textDecoration:"none"}}>
              <IGIcon size={22}/> Instagram
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoPanel({ msg }) {
  return (
    <div style={s.card}>
      <div style={{ fontSize:32, textAlign:"center", marginBottom:12 }}>ℹ️</div>
      <p style={{ color:C.textDark, textAlign:"center", fontSize:15, lineHeight:1.7 }}>{msg}</p>
      <div style={{ textAlign:"center", marginTop:16 }}>
        <a href={BRAND.social.youtube} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:8,justifyContent:"center",color:"#FF0000",fontWeight:700,fontSize:14,textDecoration:"none"}}><YTIcon size={22}/> Watch on YouTube</a>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MULTI-SELECT DROPDOWN
// ═════════════════════════════════════════════════════════════════════════════
function MultiSelect({ options, selected, onChange, placeholder }) {
  const [open,   setOpen]   = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setSearch(""); } };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const toggle = v => onChange(selected.includes(v) ? selected.filter(x=>x!==v) : [...selected, v]);
  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

  return (
    <div ref={ref} style={{ position:"relative" }}>
      {/* Search input always visible */}
      <div style={{ position:"relative" }}>
        <input
          type="text"
          placeholder={selected.length ? `${selected.length} selected — type to search` : `Search ${placeholder}...`}
          value={search}
          onChange={e => { setSearch(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          style={{ ...s.input, paddingRight:36 }}
        />
        <span onClick={() => setOpen(!open)}
              style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", cursor:"pointer", color:C.navy, fontSize:12 }}>
          {open ? "▲" : "▼"}
        </span>
      </div>

      {/* Dropdown */}
      {open && (
        <div style={s.msDropdown}>
          {filtered.length === 0
            ? <div style={{ padding:"10px 14px", color:C.textLight, fontSize:13 }}>No results</div>
            : filtered.map(o => (
              <label key={o} style={{ ...s.msItem, background: selected.includes(o) ? "#EFF6FF" : "transparent" }}>
                <input type="checkbox" checked={selected.includes(o)} onChange={() => toggle(o)}
                       style={{ marginRight:8, accentColor:C.navy }}/>
                {o}
              </label>
            ))
          }
        </div>
      )}

      {/* Selected tags */}
      {selected.length > 0 && (
        <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:8 }}>
          {selected.map(t => (
            <span key={t} style={s.msTag}>
              {t} <span onClick={() => toggle(t)} style={{ cursor:"pointer", marginLeft:4, fontWeight:700 }}>×</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// FOOTER
// ═════════════════════════════════════════════════════════════════════════════
function SiteFooter({ setPanel, isMobile }) {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title:"Concept Delta", text:"Check out this MHT-CET College Predictor!", url:"https://www.conceptdelta.in" });
    } else {
      navigator.clipboard.writeText("https://www.conceptdelta.in");
      alert("Link copied! Share it with your friends.");
    }
  };

  return (
    <footer style={{...s.footer, padding:"clamp(20px,4vw,28px) clamp(14px,3vw,24px) 0"}}>
      <div style={s.footerGrid}>
        <div>
          <div style={s.footerBrand}>{BRAND.name}</div>
          <div style={s.footerTagline}>{BRAND.tagline}</div>
          <div style={s.footerInit}>{BRAND.initiative}</div>
          <div style={s.footerDesc}>
            Your trusted partner for engineering admissions in Maharashtra.
          </div>
        </div>
        <div>
          <div style={s.footerHead}>QUICK LINKS</div>
          {[
            { label:"College Predictor",  action:() => { setPanel("predictor"); window.scrollTo({top:0,behavior:"smooth"}); } },
            { label:"Documents Guidance", action:() => { setPanel("documents"); window.scrollTo({top:0,behavior:"smooth"}); } },
            { label:"Call Support",       action:() => { setPanel("contact");   window.scrollTo({top:0,behavior:"smooth"}); } },
            { label:"Book a Free Counselling Session", action:() => window.open(GOOGLE_FORM_URL,"_blank") },
            { label:"Buy Our Premium Counselling Services", action:() => { setPanel("buy-premium"); window.scrollTo({top:0,behavior:"smooth"}); } },
          ].map(({label,action})=>(
            <div key={label} onClick={action}
                 style={{ ...s.footerLink, textDecoration:"underline", textDecorationColor:"rgba(255,255,255,0.2)" }}>
              {label}
            </div>
          ))}
        </div>
        <div>
          <div style={s.footerHead}>CONNECT</div>
          <a href={`tel:${BRAND.contact.replace(/ /g,"")}`} style={{ ...s.footerContact, textDecoration:"none", display:"block" }}>📞 {BRAND.contact}</a>
          <a href="mailto:teamconceptdelta@gmail.com"
             style={{ ...s.footerContact, textDecoration:"none", display:"block", fontSize:12, marginTop:4, color:"#94A3B8" }}>
            ✉️ teamconceptdelta@gmail.com
          </a>
          <div style={{ display:"flex", gap:12, marginTop:14, flexWrap:"wrap" }}>
            <a href={BRAND.social.youtube} target="_blank" rel="noopener noreferrer" style={{ ...s.footerIcon, background:"#FF0000" }} title="YouTube">
              <YTIcon size={24} color="white"/>
            </a>
            <a href={BRAND.social.telegram} target="_blank" rel="noopener noreferrer" style={{ ...s.footerIcon, background:"#0088CC" }} title="Telegram">
              <TGIcon size={24} color="white"/>
            </a>
            <a href={BRAND.social.instagram} target="_blank" rel="noopener noreferrer" style={{ ...s.footerIcon, background:"linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)" }} title="Instagram">
              <IGIcon size={24} color="white"/>
            </a>
            {isMobile && (
              <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MSG)}`}
                 target="_blank" rel="noopener noreferrer"
                 style={{ ...s.footerIcon, background:"#25D366" }} title="WhatsApp">
                <WAIcon size={24} color="white"/>
              </a>
            )}
          </div>
          {/* Share button */}
          <button onClick={handleShare}
                  style={{ marginTop:14, background:"rgba(212,175,55,0.15)", border:"0.5px solid #D4AF37",
                           color:"#D4AF37", fontSize:12, padding:"7px 14px", borderRadius:20,
                           cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
            🔗 Share with Friends
          </button>
        </div>
      </div>
      <div style={s.footerBottom}>
        © 2026 Concept Delta · MHT-CET College Guidance · {BRAND.initiative}
      </div>
    </footer>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═════════════════════════════════════════════════════════════════════════════
function Field({ label, children }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={s.label}>{label}</label>
      {children}
    </div>
  );
}

function SectionHeading({ title }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:18, paddingBottom:12, borderBottom:`0.5px solid ${C.border}` }}>
      <div style={{ width:4, height:18, background:C.gold, borderRadius:2 }}/>
      <h3 style={{ margin:0, color:C.textDark, fontSize:15, fontWeight:600 }}>{title}</h3>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// STYLES
// ═════════════════════════════════════════════════════════════════════════════
const s = {
  app:         { fontFamily:"'Segoe UI',sans-serif", background:C.pageBg, minHeight:"100vh", position:"relative" },
  taglineBar:  { background:C.navyDeep, color:C.gold, textAlign:"center", padding:"7px 0", fontSize:11, letterSpacing:"3px" },

  nav:        { background:C.navy, padding:"13px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" },
  navLeft:    { display:"flex", alignItems:"center", gap:14 },
  navRight:   { display:"flex", alignItems:"center", gap:8, flexShrink:0 },

  hamburger:  { background:"transparent", border:"none", cursor:"pointer", padding:6, display:"flex", flexDirection:"column", gap:5 },
  hLine:      { display:"block", width:24, height:2, background:"#fff", borderRadius:2 },

  brandWrap:  { display:"flex", alignItems:"center", gap:12 },
  logoCircle: { width:62, height:62, background:"#fff", borderRadius:"50%", overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center", border:"2px solid rgba(212,175,55,0.5)", flexShrink:0 },
  logoImg:    { width:"100%", height:"100%", objectFit:"cover" },
  brandName:  { color:"#fff", fontSize:22, fontWeight:700, letterSpacing:"0.3px" },
  brandInit:  { color:C.gold, fontSize:12, fontStyle:"italic", letterSpacing:"0.5px", marginTop:2 },

  socialA:    { color:"#fff", fontSize:18, textDecoration:"none", width:38, height:38, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },

  bookBtn:    { background:C.gold, color:C.navyDeep, border:"none", padding:"9px 16px", borderRadius:8, fontWeight:700, fontSize:13, cursor:"pointer", textDecoration:"none" },

  overlay:    { position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:99 },

  sidebar:    { position:"fixed", top:0, left:0, height:"100vh", width:"min(280px, 85vw)", background:"#fff", zIndex:100, overflowY:"auto", boxShadow:"4px 0 20px rgba(0,0,0,0.15)", transition:"transform 0.3s ease", paddingBottom:40 },
  sidebarHeader:{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 16px 10px", borderBottom:`0.5px solid ${C.border}`, marginBottom:8 },
  sidebarTitle: { fontWeight:700, fontSize:15, color:C.textDark },
  closeBtn:   { background:"transparent", border:"none", fontSize:18, cursor:"pointer", color:C.textMuted, padding:"2px 6px" },

  sectionLbl: { fontSize:12, color:C.textBody, letterSpacing:"1.5px", padding:"10px 14px 6px", display:"flex", alignItems:"center", gap:8, fontWeight:700 },
  tagFree:    { background:"#DCFCE7", color:"#166534", padding:"3px 10px", borderRadius:10, fontSize:11, fontWeight:700 },
  tagPaid:    { background:C.goldBg, color:C.goldDark, padding:"3px 10px", borderRadius:10, fontSize:11, fontWeight:700 },

  hero:       { background:`linear-gradient(135deg, ${C.navyDeep} 0%, ${C.navy} 100%)`, padding:"28px 16px", textAlign:"center" },
  heroBadge:  { display:"inline-block", background:"rgba(212,175,55,0.2)", color:C.gold, padding:"5px 16px", borderRadius:20, fontSize:11, letterSpacing:"1.5px", marginBottom:14, border:`1px solid ${C.gold}` },
  heroTitle:  { color:"#fff", fontSize:"clamp(20px,5vw,28px)", fontWeight:700, margin:"0 0 10px", letterSpacing:"-0.5px" },
  heroSub:    { color:"#CBD5E1", fontSize:14, margin:"0 0 22px", lineHeight:1.6 },
  statsRow:   { display:"inline-flex", gap:"clamp(12px,4vw,28px)", background:"rgba(255,255,255,0.07)", padding:"10px clamp(14px,4vw,28px)", borderRadius:50, border:"1px solid rgba(212,175,55,0.25)", flexWrap:"wrap", justifyContent:"center" },
  statItem:   { textAlign:"center" },
  statDivider: { width:"1px", background:"rgba(212,175,55,0.3)", alignSelf:"stretch" },
  statNum:    { fontSize:20, fontWeight:700, color:C.gold },
  statLbl:    { fontSize:10, color:"#94A3B8", letterSpacing:"1px", marginTop:2 },

  mainWrap:   { maxWidth:900, margin:"0 auto", padding:"20px 12px 80px" },

  breadcrumb: { fontSize:12, color:C.textMuted, marginBottom:6 },
  panelHeaderRow: { display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, flexWrap:"wrap", gap:10 },
  panelTitle: { fontSize:"clamp(17px,4vw,22px)", fontWeight:700, color:C.textDark, margin:"0 0 4px" },
  panelSub:   { fontSize:13, color:C.textMuted, margin:0 },
  yr26:       { background:C.goldBg, color:C.goldDark, padding:"2px 10px", borderRadius:20, fontSize:11, verticalAlign:"middle", marginLeft:8 },
  freePill:   { background:"#DCFCE7", color:"#166534", padding:"5px 14px", borderRadius:20, fontSize:12, fontWeight:600, whiteSpace:"nowrap" },

  card:       { background:"#fff", borderRadius:12, padding:"clamp(14px,4vw,24px)", border:`0.5px solid ${C.border}`, boxShadow:"0 2px 8px rgba(0,0,0,0.04)" },

  row2:       { display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(240px, 1fr))", gap:16 },
  label:      { display:"block", fontSize:12, color:C.textBody, fontWeight:600, marginBottom:6, letterSpacing:"0.3px" },
  req:        { color:"#DC2626" },
  input:      { width:"100%", padding:"10px 14px", borderRadius:8, border:`1.5px solid ${C.border}`, fontSize:14, outline:"none", boxSizing:"border-box" },
  select:     { width:"100%", padding:"10px 14px", borderRadius:8, border:`1.5px solid ${C.border}`, fontSize:13, outline:"none", background:"#fff", boxSizing:"border-box" },

  genderRow:  { display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 },
  gBtnActive: { background:C.navyDeep, color:C.gold, border:`1px solid ${C.gold}`, padding:"10px 20px", borderRadius:8, fontWeight:600, fontSize:13, cursor:"pointer" },
  gBtn:       { background:"#fff", color:C.textBody, border:`1.5px solid ${C.border}`, padding:"10px 20px", borderRadius:8, fontSize:13, cursor:"pointer" },

  filterBox:  { background:C.subtle, borderRadius:8, padding:"12px 14px", marginBottom:14 },
  filterToggle:{ display:"flex", justifyContent:"space-between", cursor:"pointer", fontSize:13, color:C.navy, fontWeight:500 },

  catPreview: { background:"#EFF6FF", borderLeft:`3px solid ${C.navy}`, padding:"10px 14px", borderRadius:8, marginBottom:16, fontSize:13 },
  errorBox:   { background:"#FEE2E2", color:"#991B1B", padding:"10px 14px", borderRadius:8, marginBottom:14, fontSize:13 },
  predictBtn: { width:"100%", background:C.navyDeep, color:C.gold, border:`1px solid ${C.gold}`, padding:14, fontSize:14, fontWeight:700, borderRadius:8, cursor:"pointer", letterSpacing:"0.5px", transition:"transform 0.15s, box-shadow 0.15s" },

  resultsHeader:{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14, flexWrap:"wrap", gap:10 },
  resultsTitle: { fontSize:18, fontWeight:700, color:C.textDark, margin:"0 0 4px" },
  resultsMeta:  { fontSize:12, color:C.textMuted },
  dlBtn:       { background:"#16A34A", color:"#fff", border:"none", padding:"8px 16px", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer" },

  tabs:       { display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" },
  tab:        { padding:"7px 16px", borderRadius:20, border:`1.5px solid ${C.border}`, background:"#fff", color:C.textMuted, fontSize:13, cursor:"pointer" },
  tabActive:  { background:C.navyDeep, color:C.gold, border:`1.5px solid ${C.gold}`, fontSize:13, cursor:"pointer", padding:"7px 16px", borderRadius:20 },
  tabBadge:   { background:"rgba(255,255,255,0.2)", borderRadius:10, padding:"1px 7px", marginLeft:4, fontSize:11 },
  noResults:  { textAlign:"center", padding:40, color:C.textMuted, fontSize:15 },
  aiWarning:  { background:"#FEF9C3", border:"1px solid #FCD34D", borderLeft:"4px solid #F59E0B", borderRadius:8, padding:"10px 14px", fontSize:13, color:"#78350F", marginBottom:14, lineHeight:1.6 },
  searchWrap: { display:"flex", alignItems:"center", background:"#fff", border:`2px solid ${C.navy}`, borderRadius:10, padding:"0 14px", marginBottom:10, gap:8 },
  searchIcon: { fontSize:16, color:C.textMuted, flexShrink:0 },
  searchInput:{ flex:1, border:"none", outline:"none", padding:"12px 0", fontSize:15, color:C.textDark, background:"transparent" },
  searchClear:{ background:"none", border:"none", cursor:"pointer", color:C.textMuted, fontSize:16, padding:"4px 6px", borderRadius:6, fontWeight:700 },
  searchCount:{ fontSize:13, color:C.textMuted, marginBottom:12, padding:"6px 2px" },

  collegeCard:{ background:"#fff", border:`0.5px solid ${C.border}`, borderRadius:10, padding:"14px 16px", marginBottom:12, boxShadow:"0 1px 4px rgba(0,0,0,0.06)", transition:"transform 0.2s ease, box-shadow 0.2s ease", cursor:"default" },
  ccTop:      { display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 },
  ccCode:     { fontSize:11, color:C.textLight, marginBottom:2, fontWeight:500 },
  ccName:     { fontSize:14, fontWeight:600, color:C.textDark },
  ccSub:      { fontSize:11, color:C.textMuted, marginTop:3 },
  chancePill: { padding:"3px 12px", borderRadius:20, fontSize:11, fontWeight:700, whiteSpace:"nowrap" },
  ccMeta:     { display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(100px,1fr))", gap:8, paddingTop:10, borderTop:`0.5px dashed ${C.border}` },
  ccMetaLbl:  { fontSize:10, color:C.textLight, letterSpacing:"0.5px" },
  ccMetaVal:  { fontSize:13, color:C.textDark, fontWeight:600, marginTop:2 },

  docCatRow:  { display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(100px,1fr))", gap:8 },
  docItem:    { display:"flex", alignItems:"center", gap:12, padding:"10px 14px", background:C.subtle, borderRadius:8, marginBottom:6, borderLeft:`3px solid ${C.gold}` },
  docNum:     { background:C.navyDeep, color:C.gold, width:24, height:24, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, flexShrink:0 },
  docText:    { fontSize:13, color:C.textDark },

  noteBox:    { background:C.goldBg, borderLeft:`3px solid ${C.gold}`, padding:"14px 16px", borderRadius:8, marginTop:16 },
  noteTitle:  { fontWeight:700, color:C.goldDark, marginBottom:8, fontSize:14 },
  noteItem:   { fontSize:13, color:C.goldDark, lineHeight:1.8 },

  paidCard:   { background:"#fff", border:`0.5px solid ${C.border}`, borderRadius:10, padding:"20px 16px", textAlign:"center", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" },

  contactBtn: { background:C.navyDeep, color:"#fff", border:"none", padding:"11px 22px", borderRadius:8, fontSize:14, fontWeight:600, cursor:"pointer", textDecoration:"none" },
  divider:    { height:"0.5px", background:C.border, margin:"20px 0" },
  socialLinkBig:{ color:C.navy, fontWeight:600, fontSize:13, textDecoration:"none" },

  msBox:      { padding:"10px 14px", borderRadius:8, border:`1.5px solid ${C.border}`, cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", background:"#fff" },
  msDropdown: { position:"absolute", top:"100%", left:0, right:0, background:"#fff", border:`1.5px solid ${C.border}`, borderRadius:8, maxHeight:200, overflowY:"auto", zIndex:50, boxShadow:"0 8px 20px rgba(0,0,0,0.12)" },
  msItem:     { display:"flex", alignItems:"center", padding:"8px 14px", cursor:"pointer", fontSize:13, color:C.textDark },
  msTag:      { background:"#EDE9FE", color:C.navy, padding:"3px 10px", borderRadius:20, fontSize:12, fontWeight:500 },

  footer:     { background:C.navyDeep, padding:"28px 24px 0", marginTop:"auto" },
  footerGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px,1fr))", gap:24, maxWidth:900, margin:"0 auto", paddingBottom:24 },
  footerBrand:{ color:"#fff", fontSize:"clamp(18px,4vw,22px)", fontWeight:700, marginBottom:6 },
  footerTagline:{ color:C.gold, fontSize:13, letterSpacing:"2px", marginBottom:6, fontWeight:600 },
  footerInit: { color:"#BFDBFE", fontSize:13, fontStyle:"italic", marginBottom:12 },
  footerDesc: { color:"#94A3B8", fontSize:13, lineHeight:1.8 },
  footerHead: { color:C.gold, fontSize:13, letterSpacing:"1.5px", marginBottom:12, fontWeight:700 },
  footerLink: { color:"#CBD5E1", fontSize:"clamp(13px,3vw,14px)", lineHeight:2.2, cursor:"pointer" },
  footerContact:{ color:"#CBD5E1", fontSize:"clamp(14px,3.5vw,15px)", fontWeight:600, marginBottom:8, display:"block" },
  footerIcon: { width:44, height:44, background:"rgba(255,255,255,0.1)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", textDecoration:"none", fontSize:22, flexShrink:0 },
  footerBottom:{ borderTop:`1px solid rgba(255,255,255,0.08)`, padding:"16px 8px", textAlign:"center", color:"#94A3B8", fontSize:"clamp(11px,2.5vw,13px)", maxWidth:900, margin:"0 auto" },

  whatsappFloat:{ position:"fixed", right:16, bottom:80, background:"linear-gradient(135deg,#25D366,#128C7E)", color:"#fff", padding:"12px 20px", borderRadius:30, fontWeight:700, fontSize:14, textDecoration:"none", boxShadow:"0 6px 24px rgba(37,211,102,0.45)", zIndex:200, display:"flex", alignItems:"center", gap:10, letterSpacing:"0.3px" },
};
