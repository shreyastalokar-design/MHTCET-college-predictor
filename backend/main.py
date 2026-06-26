"""
Concept Delta - MHT-CET College Predictor Backend
An initiative by COEP alumni
"""
from fastapi import FastAPI, Query
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import os
import io
import gc
import requests
from typing import Optional
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, HRFlowable
from reportlab.lib.units import inch, cm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from datetime import datetime

app = FastAPI(title="Concept Delta API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Memory cleanup after every request ───────────────────────────────────────
@app.middleware("http")
async def cleanup_middleware(request, call_next):
    response = await call_next(request)
    gc.collect()
    return response

# ── Max results returned to frontend ─────────────────────────────────────────
MAX_PREDICT_RESULTS = 20

@app.get("/ping")
def ping():
    return {"status": "ok"}

# ── Email config (Resend) ────────────────────────────────────────────────────
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
RESEND_API_URL = "https://api.resend.com/emails"
FROM_EMAIL     = "Concept Delta <hello@conceptdelta.in>"
TEAM_EMAIL     = "teamconceptdelta@gmail.com"

def send_confirmation_email(to_email: str, student_name: str, mobile: str,
                             exam: str, category: str, district: str):
    """Send branded confirmation email via Resend."""
    if not RESEND_API_KEY or not to_email:
        return

    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;
                border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
      <div style="background:#031343;padding:24px;text-align:center;">
        <h1 style="color:#D4AF37;margin:0;font-size:24px;">Concept Delta</h1>
        <p style="color:#CBD5E1;margin:6px 0 0;font-size:13px;">An initiative by COEP alumni</p>
      </div>
      <div style="background:#D4AF37;height:4px;"></div>
      <div style="padding:28px 24px;background:#ffffff;">
        <h2 style="color:#031343;margin:0 0 8px;">Welcome aboard, {student_name}!</h2>
        <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 20px;">
          Thank you for purchasing the <strong>Concept Delta Premium Package</strong>.
          We have received your details and our team is verifying your payment.
        </p>
        <div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:8px;
                    padding:16px;margin-bottom:20px;">
          <h3 style="color:#031343;margin:0 0 10px;font-size:15px;">Your Details</h3>
          <table style="width:100%;font-size:14px;color:#475569;">
            <tr><td style="padding:4px 0;"><strong>Name:</strong></td><td>{student_name}</td></tr>
            <tr><td style="padding:4px 0;"><strong>WhatsApp:</strong></td><td>{mobile}</td></tr>
            <tr><td style="padding:4px 0;"><strong>Exam:</strong></td><td>{exam}</td></tr>
            <tr><td style="padding:4px 0;"><strong>Category:</strong></td><td>{category}</td></tr>
            <tr><td style="padding:4px 0;"><strong>District:</strong></td><td>{district}</td></tr>
            <tr><td style="padding:4px 0;"><strong>Package:</strong></td>
                <td><strong style="color:#D4AF37;">Premium - Rs.1,799</strong></td></tr>
          </table>
        </div>
        <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;
                    padding:16px;margin-bottom:20px;">
          <h3 style="color:#166534;margin:0 0 10px;font-size:15px;">What you get</h3>
          <ul style="color:#166534;font-size:13px;margin:0;padding-left:18px;line-height:2;">
            <li>Full College Predictor List</li>
            <li>Personalized Option Form</li>
            <li>Branch &amp; College Guidance</li>
            <li>Option Form Filling Guidance</li>
            <li>Complete Counselling</li>
            <li>Live Mentorship</li>
            <li>24x7 Chat Support</li>
            <li>Personal Mentor</li>
            <li>Admission Assistance</li>
            <li>Personalised Branch Specific List</li>
            <li>CAP Round Support</li>
            <li>ILS / Spot Round Guidance</li>
            <li>Special Guest Lecture on Each Branch</li>
            <li>Personalized Counselling Material</li>
            <li>Live Session Recordings</li>
            <li>WhatsApp Group Access &amp; Guidance Material</li>
          </ul>
        </div>
        <div style="background:#FEF3C7;border:1px solid #FCD34D;border-radius:8px;
                    padding:16px;margin-bottom:24px;">
          <h3 style="color:#92400E;margin:0 0 8px;font-size:15px;">Next Steps</h3>
          <p style="color:#92400E;font-size:13px;margin:0;line-height:1.8;">
            1. Our team will verify your payment<br/>
            2. You will be added to the <strong>Concept Delta WhatsApp Group</strong><br/>
            3. Your personal mentor will contact you on WhatsApp shortly<br/>
            4. Counselling sessions will be scheduled as per your convenience
          </p>
        </div>
        <div style="text-align:center;margin-bottom:20px;">
          <a href="https://wa.me/918983798203"
             style="background:#25D366;color:#ffffff;padding:12px 28px;border-radius:8px;
                    text-decoration:none;font-weight:700;font-size:14px;display:inline-block;">
            WhatsApp Us
          </a>
        </div>
        <p style="color:#94A3B8;font-size:12px;text-align:center;margin:0;">
          Didn't receive WhatsApp message? Contact us at
          <a href="https://wa.me/918983798203" style="color:#031343;font-weight:700;">
            +91 89837 98203</a>
        </p>
      </div>
      <div style="background:#031343;padding:20px 16px;text-align:center;">
        <p style="color:#D4AF37;margin:0 0 4px;font-size:14px;font-weight:700;">Concept Delta</p>
        <p style="color:#94A3B8;margin:0 0 12px;font-size:11px;">SMART GUIDANCE - BETTER FUTURES</p>

        <div style="margin-bottom:12px;">
          <a href="https://youtube.com/@conceptdelta2026"
             style="color:#FF0000;font-size:12px;font-weight:700;text-decoration:none;margin:0 10px;">
            YouTube
          </a>
          <span style="color:#64748B;">|</span>
          <a href="https://www.instagram.com/conceptdelta2031"
             style="color:#E1306C;font-size:12px;font-weight:700;text-decoration:none;margin:0 10px;">
            Instagram
          </a>
          <span style="color:#64748B;">|</span>
          <a href="https://t.me/Conceptdelta"
             style="color:#0088CC;font-size:12px;font-weight:700;text-decoration:none;margin:0 10px;">
            Telegram
          </a>
        </div>

        <a href="https://www.conceptdelta.in"
           style="color:#D4AF37;font-size:12px;text-decoration:none;display:block;margin-bottom:8px;">
          www.conceptdelta.in
        </a>
        <p style="color:#64748B;margin:0;font-size:11px;">
          teamconceptdelta@gmail.com | +91 89837 98203
        </p>
      </div>
    </div>
    """

    try:
        requests.post(
            RESEND_API_URL,
            headers={
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "from": FROM_EMAIL,
                "to": [to_email],
                "subject": "Concept Delta - Premium Package Confirmed!",
                "html": html,
            },
            timeout=10,
        )
    except Exception as e:
        print(f"Resend email failed: {e}")


def send_team_notification(student_name: str, mobile: str, student_email: str,
                            exam: str, category: str, district: str):
    """Send plain-text notification to team — matches original Apps Script format."""
    if not RESEND_API_KEY:
        return
    text = (
        f"Name: {student_name}\n"
        f"WhatsApp: {mobile}\n"
        f"Gmail: {student_email}\n"
        f"Exam: {exam}\n"
        f"Category: {category}\n"
        f"District: {district}\n\n"
        f"Verify payment and add to WhatsApp group!"
    )
    try:
        requests.post(
            RESEND_API_URL,
            headers={
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "from": FROM_EMAIL,
                "to": [TEAM_EMAIL],
                "subject": f"New Premium Purchase - {student_name}",
                "text": text,
            },
            timeout=10,
        )
    except Exception as e:
        print(f"Resend team notification failed: {e}")


@app.post("/notify-premium-purchase")
async def notify_premium_purchase(
    name:     str = Query(...),
    email:    str = Query(...),
    mobile:   str = Query(""),
    exam:     str = Query(""),
    category: str = Query(""),
    district: str = Query(""),
):
    """Called by Google Apps Script trigger when premium form is submitted.
    Sends confirmation email to student + plain-text notification to team."""
    send_confirmation_email(email, name, mobile, exam, category, district)
    send_team_notification(name, mobile, email, exam, category, district)
    return {"status": "ok"}

# ── Brand constants ───────────────────────────────────────────────────────────
BRAND_NAME = "Concept Delta"
BRAND_TAGLINE = "SMART GUIDANCE · BETTER FUTURES"
BRAND_INITIATIVE = "An initiative by COEP alumni"
CONTACT_PHONE = "+91 89837 98203"
SOCIAL_LINKS = {
    "youtube":  "https://youtube.com/@conceptdelta2026",
    "telegram": "https://t.me/Conceptdelta",
    "instagram": "https://www.instagram.com/conceptdelta2031",
}
WEBSITE_URL          = "https://www.conceptdelta.in"
GOOGLE_FORM_URL      = "https://docs.google.com/forms/d/e/1FAIpQLSeQm_ZVATB-GyaQrDR4qe1AMPi0aC1Lcrimx5v4U4-vfooKtg/viewform"
PREMIUM_FORM_URL     = "https://docs.google.com/forms/d/e/1FAIpQLSfFa4T3I_lx74G93fVjL0mB6DgUwtux3VyDSFLvB1Jto4MTew/viewform"
WHATSAPP_URL         = "https://wa.me/918983798203"
WHATSAPP_CHANNEL_URL = "https://whatsapp.com/channel/0029VbCTYvc7IUYZvqyVbI3L"
NAVY = colors.HexColor("#1E3A5F")
BLUE = colors.HexColor("#2C5282")
GOLD = colors.HexColor("#D4AF37")

# ── Load CSVs ─────────────────────────────────────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
ICONS_DIR  = os.path.join(BASE_DIR, "../data/icons")
CSV_PATH = os.environ.get("CSV_PATH", os.path.join(BASE_DIR, "../data/mhtcet_complete.csv"))
CAT_FORMS_PATH = os.environ.get("CAT_FORMS_PATH", os.path.join(BASE_DIR, "../data/category_full_forms.csv"))

df = pd.read_csv(CSV_PATH, dtype={'Institution Code': str})
df['Institution Code'] = df['Institution Code'].astype(str).str.strip().str.split('.').str[0]
df['Category'] = df['Category'].astype(str).str.strip()
df['Percentile'] = pd.to_numeric(df['Percentile'], errors='coerce')
df['Cutoff Rank'] = pd.to_numeric(df['Cutoff Rank'], errors='coerce')
df['Total Fee'] = pd.to_numeric(df['Total Fee'], errors='coerce')
df['CAP Round'] = df['CAP Round'].fillna('Unknown')
print(f"✅ Loaded {len(df)} college rows")

cat_forms_df = pd.read_csv(CAT_FORMS_PATH)
CATEGORY_FULL_FORMS = dict(zip(cat_forms_df['Code'].astype(str).str.strip(),
                                cat_forms_df['Full Form'].astype(str).str.strip()))
print(f"✅ Loaded {len(CATEGORY_FULL_FORMS)} category mappings")

# ── Documents data ────────────────────────────────────────────────────────────
_COMMON = [
    "MHT CET Application Form",
    "MHT CET Admit Card",
    "MHT CET Scorecard",
    "Class 10 Mark Sheet",
    "Class 12 Mark Sheet",
    "12th College Leaving Certificate",
    "Certificate of Indian Nationality OR Nationality mentioned on 12th Leaving Certificate OR Birth Certificate issued in India",
    "Domicile Certificate of Maharashtra (Student / Father / Mother)",
    "Passport-sized photographs",
    "Photo Identity Proof - Aadhaar Card",
    "JEE Score Card (if appeared)",
]
DOCUMENTS_DATA = {
    "Open":     _COMMON + [],
    "OBC":      _COMMON + [
                    "Caste Certificate (OBC / SBC / VJ / NT) issued by Maharashtra",
                    "Caste Validity Certificate issued by Maharashtra",
                    "Valid Non-Creamy Layer (NCL) Certificate",
                    "Income Certificate",
                ],
    "SC":       _COMMON + [
                    "Caste Certificate (SC) issued by competent authority in Maharashtra",
                    "Caste Validity Certificate issued by competent authority in Maharashtra",
                ],
    "ST":       _COMMON + [
                    "Caste Certificate (ST) issued by competent authority in Maharashtra",
                    "Caste Validity Certificate issued by competent authority in Maharashtra",
                ],
    "EWS":      _COMMON + [
                    "Valid EWS Certificate issued by competent authority in Maharashtra",
                    "Income Certificate showing family income below Rs.8 lakhs",
                ],
    "MINORITY": _COMMON + [
                    "Self Declaration (Proforma O) / Samaj Letter",
                    "Linguistic Minority Certificate",
                    "Domicile Certificate of any one amongst Student / Father / Mother",
                ],
    "PWD":      _COMMON + [
                    "Physically Handicapped Certificate / PWD Certificate from relevant authority",
                ],
    "DEFENCE":  _COMMON + [
                    "Defence Service Certificate (Proforma C) from Zilla Sainik Board",
                    "For DEF-1 and DEF-2: Domicile Certificate of father/mother who is/was in Defence Service",
                ],
    "ORPHAN":   _COMMON + [
                    "Orphan Certificate from Regional Deputy Commissioner, Women and Child Development",
                ],
    "TFWS":     _COMMON + [
                    "Family Income Certificate for Tuition Fee Waiver Scheme (annual income below Rs.8 lakhs)",
                ],
}
DOCUMENT_NOTES = [
    "Gap certificate is mandatory for Repeaters.",
    "Keep 5 xerox sets in your file and make PDF of all your original documents.",
    "All certificates must be valid and issued by competent authorities in Maharashtra.",
]

# ── Category Mapping Logic ────────────────────────────────────────────────────
SUFFIX_MAP = {
    "Home University":  "H",
    "Other University": "O",
    "State Level":      "S",
}

def build_category_code(gender: str, caste: str, quota: str, uni_type: str) -> list:
    """Returns list of possible category codes for the given combination."""
    if quota == "AI":     return ["AI"]
    if quota == "MI":     return ["MI"]
    if quota == "ORPHAN": return ["ORPHAN"]
    if quota == "EWS":    return ["EWS"]
    if quota == "TFWS":   return ["TFWS"]

    suffix = SUFFIX_MAP.get(uni_type, "S")
    prefix = "G" if gender == "Male" else "L"

    if quota == "PWD":
        if caste == "OPEN":
            return [f"PWDOPEN{suffix}"]
        return [f"PWD{caste}{suffix}", f"PWDR{caste}{suffix}"]

    if quota == "DEF":
        if caste == "OPEN":
            return [f"DEFOPEN{suffix}"]
        return [f"DEF{caste}{suffix}", f"DEFR{caste}{suffix}"]

    return [f"{prefix}{caste}{suffix}"]


def get_category_full_form(codes: list) -> str:
    """Get the human-readable full form for category codes."""
    for code in codes:
        if code in CATEGORY_FULL_FORMS:
            return CATEGORY_FULL_FORMS[code]
    return codes[0] if codes else ""


def filter_colleges(percentile, gender, caste, quota, uni_type, cap_round,
                    branches=None, districts=None):
    """Core filtering logic shared by /predict and /predict-pdf"""
    category_codes = build_category_code(gender, caste, quota, uni_type)

    # Always filter by BOTH category AND CAP round — no exceptions
    # Works for all quotas: AI, EWS, TFWS, MI, ORPHAN, PWD, DEF, and regular categories
    filtered = df[
        (df['Category'].isin(category_codes)) &
        (df['CAP Round'] == cap_round)
    ].copy()

    filtered = filtered[filtered['Percentile'] <= percentile + 0.20]  # include Reach window

    if branches:
        branch_list = [b.strip() for b in branches.split(",")]
        filtered = filtered[filtered['Branch'].isin(branch_list)]

    if districts:
        district_list = [d.strip() for d in districts.split(",")]
        filtered = filtered[filtered['District'].isin(district_list)]

    filtered = filtered.sort_values('Percentile', ascending=False)
    filtered = filtered.drop_duplicates(subset=['College Name', 'Branch'])

    def classify(row):
        diff = percentile - row['Percentile']
        if diff >= 0.20:   return 'Safe'      # cutoff <= user - 0.20
        elif diff >= 0:    return 'Moderate'  # user - 0.20 < cutoff <= user
        else:              return 'Reach'     # cutoff > user (up to user + 0.20)

    filtered['Admission Chance'] = filtered.apply(classify, axis=1)
    return filtered, category_codes


# ════════════════════════════════════════════════════════════════════════════
# API ENDPOINTS
# ════════════════════════════════════════════════════════════════════════════

@app.get("/")
def root():
    return {
        "status": "online",
        "brand": BRAND_NAME,
        "initiative": BRAND_INITIATIVE,
        "endpoints": ["/predict", "/predict-pdf", "/documents", "/documents-pdf",
                      "/branches", "/districts", "/college-types"]
    }


@app.get("/branches")
def get_branches():
    return {"branches": sorted(df['Branch'].dropna().unique().tolist())}


@app.get("/districts")
def get_districts():
    return {"districts": sorted(df['District'].dropna().unique().tolist())}


@app.get("/college-types")
def get_college_types():
    return {"college_types": sorted(df['Status'].dropna().unique().tolist())}


@app.get("/documents")
def get_documents(category: str = Query("Open")):
    """Get documents required for a specific category."""
    docs = DOCUMENTS_DATA.get(category, DOCUMENTS_DATA["Open"])
    return {
        "category": category,
        "documents": docs,
        "notes": DOCUMENT_NOTES,
        "total": len(docs),
    }


@app.get("/predict")
def predict(
    percentile: float = Query(...),
    gender: str = Query(...),
    caste: str = Query(...),
    quota: str = Query("NONE"),
    uni_type: str = Query("State Level"),
    cap_round: str = Query("CAP Round 1"),
    branches: Optional[str] = Query(None),
    districts: Optional[str] = Query(None),
):
    filtered, category_codes = filter_colleges(
        percentile, gender, caste, quota, uni_type, cap_round, branches, districts
    )
    full_form = get_category_full_form(category_codes)

    total_found = len(filtered)

    results = filtered[[
        'Institution Code', 'College Name', 'University', 'Status',
        'District', 'Region', 'Branch', 'CAP Round', 'Category',
        'Cutoff Rank', 'Percentile', 'Total Fee', 'Admission Chance'
    ]].head(MAX_PREDICT_RESULTS).fillna('N/A')

    # Keep institution code as string
    results = results.copy()
    results['Institution Code'] = results['Institution Code'].astype(str)

    colleges = results.rename(columns={
        'Institution Code': 'institution_code',
        'College Name': 'college_name',
        'University': 'university',
        'Status': 'college_type',
        'District': 'district',
        'Region': 'region',
        'Branch': 'branch',
        'CAP Round': 'cap_round',
        'Category': 'category',
        'Cutoff Rank': 'cutoff_rank',
        'Percentile': 'cutoff_percentile',
        'Total Fee': 'total_fee',
        'Admission Chance': 'admission_chance',
    }).to_dict(orient='records')

    response_data = {
        "percentile": percentile,
        "category_codes": category_codes,
        "category_full_form": full_form,
        "cap_round": cap_round,
        "total_results": total_found,
        "showing": len(colleges),
        "safe_count":     sum(1 for c in colleges if c['admission_chance'] == 'Safe'),
        "moderate_count": sum(1 for c in colleges if c['admission_chance'] == 'Moderate'),
        "reach_count":    sum(1 for c in colleges if c['admission_chance'] == 'Reach'),
        "colleges": colleges,
        "is_locked_round": cap_round in ("CAP Round 3", "CAP Round 4"),
        "free_tier_note": (
            f"Showing top {MAX_PREDICT_RESULTS} of {total_found} colleges. "
            f"Upgrade to Premium to unlock all {total_found} results."
        ) if total_found > MAX_PREDICT_RESULTS else None,
    }
    del filtered, results, colleges
    gc.collect()
    return response_data


_FREE_SVCS = [
    "Detailed Category-wise College Predictor",
    "Call Support",
    "Document Checklist & Guidance",
]
_PREM_SVCS = [
    "Personalized Option Form",
    "Branch & College Guidance",
    "Option Form Filling",
    "Complete Counselling",
    "Live Mentorship",
    "24x7 Chat Support",
    "Personal Mentor",
    "Admission Assistance",
    "CAP Round Support",
    "ILS / Spot Round Guidance",
    "Special Guest Lecture on Each Branch",
]

def add_services_page(usable_width=25.7*cm):
    """Returns list of flowables for the services last page.
    Pass usable_width = page_width - left_margin - right_margin.
    Caller adds PageBreak() separately before extending story.
    """
    free_w = usable_width * 0.40
    prem_w = usable_width * 0.60

    # Tighter leading so everything fits on one page
    cell_s = ParagraphStyle('svc_cell', fontName='Helvetica', fontSize=9.5,
                             textColor=colors.HexColor("#166534"), leading=14)
    cell_p = ParagraphStyle('svc_prem', fontName='Helvetica', fontSize=9.5,
                             textColor=NAVY, leading=14)

    free_cell = [
        Paragraph("<b>FREE SERVICES</b>",
                  ParagraphStyle('fh', fontName='Helvetica-Bold', fontSize=11,
                                 textColor=colors.white, alignment=TA_CENTER,
                                 backColor=colors.HexColor("#16A34A"),
                                 borderPadding=(6, 0, 6, 0))),
        Spacer(1, 0.2*cm),
    ] + [Paragraph(f"   >  {s}", cell_s) for s in _FREE_SVCS]

    prem_cell = [
        Paragraph("<b>PREMIUM SERVICES</b>",
                  ParagraphStyle('ph', fontName='Helvetica-Bold', fontSize=11,
                                 textColor=GOLD, alignment=TA_CENTER,
                                 backColor=NAVY,
                                 borderPadding=(6, 0, 6, 0))),
        Spacer(1, 0.2*cm),
    ] + [Paragraph(f"   >  {s}", cell_p) for s in _PREM_SVCS]

    svc_table = Table([[free_cell, prem_cell]], colWidths=[free_w, prem_w])
    svc_table.setStyle(TableStyle([
        ('VALIGN',        (0,0), (-1,-1), 'TOP'),
        ('BACKGROUND',    (0,0), (0,0),   colors.HexColor("#F0FDF4")),
        ('BACKGROUND',    (1,0), (1,0),   colors.HexColor("#EFF6FF")),
        ('BOX',           (0,0), (0,0),   0.8, colors.HexColor("#16A34A")),
        ('BOX',           (1,0), (1,0),   0.8, NAVY),
        ('LEFTPADDING',   (0,0), (-1,-1), 12),
        ('RIGHTPADDING',  (0,0), (-1,-1), 12),
        ('TOPPADDING',    (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
    ]))

    cta_style = ParagraphStyle('cta', fontName='Helvetica-Bold', fontSize=12,
                                textColor=GOLD, alignment=TA_CENTER, leading=20)
    sub_style = ParagraphStyle('sub', fontName='Helvetica', fontSize=10.5,
                                textColor=colors.white, alignment=TA_CENTER, leading=18)
    web_style = ParagraphStyle('web', fontName='Helvetica-Bold', fontSize=13,
                                textColor=NAVY, alignment=TA_CENTER)

    cta_table = Table(
        [[Paragraph(
            f'<a href="{GOOGLE_FORM_URL}" color="#D4AF37">'
            f'<b>Book a FREE Counselling Session</b></a>', cta_style)],
         [Paragraph(
            f'Call / WhatsApp: '
            f'<a href="{WHATSAPP_URL}" color="#25D366"><b>{CONTACT_PHONE}</b></a>'
            f'   |   '
            f'<a href="{WHATSAPP_URL}" color="#25D366">WhatsApp us anytime!</a>',
            sub_style)],
         [Paragraph(
            f'<a href="{PREMIUM_FORM_URL}" color="#4ADE80">'
            f'<b>Click here to Buy our Premium Services -- Rs.1,799 only (Limited Offer)</b></a>',
            ParagraphStyle('buy', fontName='Helvetica-Bold', fontSize=11,
                           textColor=colors.white, alignment=TA_CENTER, leading=18))],
         [Paragraph(
            f'To know more visit  >>  '
            f'<a href="{WEBSITE_URL}" color="#D4AF37"><u>{WEBSITE_URL}</u></a>',
            ParagraphStyle('wl', fontName='Helvetica-Bold', fontSize=12,
                           textColor=colors.white, alignment=TA_CENTER, leading=18))]],
        colWidths=[usable_width]
    )
    cta_table.setStyle(TableStyle([
        ('BACKGROUND',    (0,0), (-1,-1), NAVY),
        ('LEFTPADDING',   (0,0), (-1,-1), 20),
        ('RIGHTPADDING',  (0,0), (-1,-1), 20),
        ('TOPPADDING',    (0,0), (0,0),   12),
        ('BOTTOMPADDING', (0,0), (0,0),   4),
        ('TOPPADDING',    (0,1), (0,1),   4),
        ('BOTTOMPADDING', (0,1), (0,1),   4),
        ('BACKGROUND',    (0,2), (0,2),   colors.HexColor("#166534")),
        ('TOPPADDING',    (0,2), (0,2),   10),
        ('BOTTOMPADDING', (0,2), (0,2),   10),
        ('TOPPADDING',    (0,3), (0,3),   4),
        ('BOTTOMPADDING', (0,3), (0,3),   12),
    ]))

    return [
        Spacer(1, 0.2*cm),
        Paragraph("Our Services",
                  ParagraphStyle('sh', fontName='Helvetica-Bold', fontSize=18,
                                 textColor=NAVY, alignment=TA_CENTER, spaceAfter=0)),
        Spacer(1, 0.35*cm),   # <-- increased gap between heading and subtitle
        Paragraph("Everything you need for a successful MHT-CET admission",
                  ParagraphStyle('ss', fontName='Helvetica', fontSize=10,
                                 textColor=colors.grey, alignment=TA_CENTER)),
        Spacer(1, 0.2*cm),
        HRFlowable(width="100%", thickness=1.5, color=GOLD, spaceAfter=10),
        svc_table,
        Spacer(1, 0.3*cm),
        cta_table,
    ]


# ════════════════════════════════════════════════════════════════════════════
# PDF GENERATION
# ════════════════════════════════════════════════════════════════════════════

def add_pdf_header_footer(canvas, doc):
    """Shared header/footer for all Concept Delta PDFs."""
    canvas.saveState()
    width, height = doc.pagesize

    # ── HEADER ────────────────────────────────────────────────────────────────
    HEADER_H = 2.6 * cm
    canvas.setFillColor(NAVY)
    canvas.rect(0, height - HEADER_H, width, HEADER_H, fill=1, stroke=0)

    # Gold accent bar at bottom of header
    canvas.setFillColor(GOLD)
    canvas.rect(0, height - HEADER_H - 0.06*cm, width, 0.1*cm, fill=1, stroke=0)

    # Logo
    logo_path = os.path.join(BASE_DIR, "../frontend/public/logo.jpeg")
    logo_size = 1.9 * cm
    text_x    = 1.4 * cm
    if os.path.exists(logo_path):
        try:
            from reportlab.lib.utils import ImageReader
            img = ImageReader(logo_path)
            logo_y = height - HEADER_H + (HEADER_H - logo_size) / 2
            canvas.drawImage(img, 1.1*cm, logo_y,
                             width=logo_size, height=logo_size,
                             mask="auto", preserveAspectRatio=True)
            text_x = 1.1*cm + logo_size + 0.5*cm
        except Exception:
            pass

    # Brand name
    canvas.setFillColor(colors.white)
    canvas.setFont("Helvetica-Bold", 22)
    canvas.drawString(text_x, height - 1.15*cm, BRAND_NAME)

    # Initiative tagline
    canvas.setFillColor(GOLD)
    canvas.setFont("Helvetica-Oblique", 11)
    canvas.drawString(text_x, height - 1.85*cm, BRAND_INITIATIVE)

    # Right — guidance label + date
    canvas.setFillColor(GOLD)
    canvas.setFont("Helvetica-Bold", 11)
    canvas.drawRightString(width - 1.4*cm, height - 1.15*cm, "MHT-CET COLLEGE GUIDANCE 2026")
    canvas.setFillColor(colors.lightgrey)
    canvas.setFont("Helvetica", 10)
    canvas.drawRightString(width - 1.4*cm, height - 1.85*cm,
                           f"Generated: {datetime.now().strftime('%d-%b-%Y')}")

    # ── FOOTER ────────────────────────────────────────────────────────────────
    FOOTER_H = 3.2 * cm
    canvas.setFillColor(NAVY)
    canvas.rect(0, 0, width, FOOTER_H, fill=1, stroke=0)
    # Gold accent line on top
    canvas.setFillColor(GOLD)
    canvas.rect(0, FOOTER_H, width, 0.12*cm, fill=1, stroke=0)

    # Three zones (portrait A4 = 21cm, landscape = 29.7cm)
    L = 1.3 * cm          # left margin
    R = width - 1.3*cm    # right edge
    CX = width * 0.52     # center of middle social zone

    # ── ZONE 1: Contact (left) ────────────────────────────────────────────────
    y_top  = FOOTER_H - 0.50*cm
    y_mid  = FOOTER_H - 1.10*cm
    y_bot  = FOOTER_H - 1.72*cm

    canvas.setFillColor(colors.white)
    canvas.setFont("Helvetica", 8.5)
    canvas.drawString(L, y_top, "For more details, contact or WhatsApp:")

    # Phone — gold, 12pt, clickable
    canvas.setFillColor(GOLD)
    canvas.setFont("Helvetica-Bold", 12)
    canvas.drawString(L, y_mid, CONTACT_PHONE)
    pw = canvas.stringWidth(CONTACT_PHONE, "Helvetica-Bold", 12)
    canvas.linkURL(f"tel:{CONTACT_PHONE.replace(' ','')}",
                   (L, y_mid-0.1*cm, L+pw, y_mid+0.4*cm), relative=0)

    # WhatsApp icon + label
    wa_path  = os.path.join(ICONS_DIR, "whatsapp.png")
    ico_size = 0.42 * cm
    if os.path.exists(wa_path):
        try:
            from reportlab.lib.utils import ImageReader
            canvas.drawImage(ImageReader(wa_path), L, y_bot - 0.04*cm,
                             width=ico_size, height=ico_size, mask="auto")
        except Exception:
            pass
    canvas.setFillColor(colors.HexColor("#25D366"))
    canvas.setFont("Helvetica", 8)
    canvas.drawString(L + ico_size + 0.15*cm, y_bot + 0.08*cm, "WhatsApp us anytime")
    canvas.linkURL(f"https://wa.me/{CONTACT_PHONE.replace('+','').replace(' ','')}",
                   (L, y_bot - 0.1*cm, L + 4.5*cm, y_bot + ico_size), relative=0)

    # ── ZONE 2: Social Icons (center) ─────────────────────────────────────────
    canvas.setFillColor(colors.lightgrey)
    canvas.setFont("Helvetica", 8)
    canvas.drawCentredString(CX, y_top, "Connect with us")

    socials = [
        ("youtube.png",   "@conceptdelta2026",  SOCIAL_LINKS["youtube"]),
        ("telegram.png",  "@Conceptdelta",      SOCIAL_LINKS["telegram"]),
        ("instagram.png", "@conceptdelta2031",  SOCIAL_LINKS["instagram"]),
        ("whatsapp.png",  "WA Channel",         WHATSAPP_CHANNEL_URL),
    ]

    ico_sz  = 0.65 * cm
    n       = len(socials)
    gap     = 2.5 * cm              # slightly wider spacing between icons
    sx      = CX - gap * (n-1) / 2  # auto-centre all icons around CX

    for i, (fname, handle, url) in enumerate(socials):
        cx_i    = sx + i * gap
        icon_y  = FOOTER_H - 1.35 * cm   # icon top-ish
        hand_y  = FOOTER_H - 1.82 * cm   # handle below icon

        # Draw icon — larger size for sharpness
        ipath = os.path.join(ICONS_DIR, fname)
        if os.path.exists(ipath):
            try:
                from reportlab.lib.utils import ImageReader
                canvas.drawImage(ImageReader(ipath),
                                 cx_i - ico_sz/2, icon_y - ico_sz/2 + 0.1*cm,
                                 width=ico_sz, height=ico_sz,
                                 mask="auto", preserveAspectRatio=True)
            except Exception:
                pass

        # Handle text
        canvas.setFillColor(colors.lightgrey)
        canvas.setFont("Helvetica", 7.5)
        canvas.drawCentredString(cx_i, hand_y, handle)

        # Gold underline + link covers full icon+text area
        tw = canvas.stringWidth(handle, "Helvetica", 7.5)
        canvas.setStrokeColor(GOLD)
        canvas.setLineWidth(0.4)
        canvas.line(cx_i - tw/2, hand_y - 0.06*cm,
                    cx_i + tw/2, hand_y - 0.06*cm)
        canvas.linkURL(url,
                       (cx_i - ico_sz/2, hand_y - 0.12*cm,
                        cx_i + ico_sz/2, icon_y + 0.2*cm),
                       relative=0)

    # ── ZONE 3: Page number (right only) ─────────────────────────────────────
    canvas.setFillColor(GOLD)
    canvas.setFont("Helvetica-Bold", 12)
    canvas.drawRightString(R, y_top, f"Page {doc.page}")

    # Tagline centered below the 3 social icons
    canvas.setFillColor(colors.lightgrey)
    canvas.setFont("Helvetica-Oblique", 8)
    canvas.drawCentredString(CX, FOOTER_H - 2.4*cm, BRAND_TAGLINE)

    canvas.restoreState()


@app.get("/predict-pdf")
def predict_pdf(
    percentile: float = Query(...),
    gender: str = Query(...),
    caste: str = Query(...),
    quota: str = Query("NONE"),
    uni_type: str = Query("State Level"),
    cap_round: str = Query("CAP Round 1"),
    branches: Optional[str] = Query(None),
    districts: Optional[str] = Query(None),
):
    """Generate PDF of college predictions."""
    filtered, category_codes = filter_colleges(
        percentile, gender, caste, quota, uni_type, cap_round, branches, districts
    )
    full_form = get_category_full_form(category_codes)

    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=landscape(A4),
        leftMargin=1*cm, rightMargin=1*cm,
        topMargin=3.4*cm, bottomMargin=3.2*cm,
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('Title', parent=styles['Heading1'],
                                  fontSize=16, textColor=NAVY, alignment=TA_CENTER, spaceAfter=6)
    subtitle_style = ParagraphStyle('Sub', parent=styles['Normal'],
                                     fontSize=10, textColor=colors.grey, alignment=TA_CENTER, spaceAfter=12)
    note_style = ParagraphStyle('Note', parent=styles['Normal'],
                                 fontSize=9, textColor=NAVY, leftIndent=0, spaceAfter=4)

    story = []
    story.append(Spacer(1, 0.3*cm))
    story.append(Paragraph("Your MHT-CET College Predictions", title_style))
    info_line = (f"<b>Percentile:</b> {percentile}  &nbsp;|&nbsp;  "
                 f"<b>Category:</b> {', '.join(category_codes)} ({full_form})  &nbsp;|&nbsp;  "
                 f"<b>{cap_round}</b>")
    story.append(Paragraph(info_line, subtitle_style))

    safe_n = (filtered['Admission Chance'] == 'Safe').sum()
    mod_n  = (filtered['Admission Chance'] == 'Moderate').sum()
    rch_n  = (filtered['Admission Chance'] == 'Reach').sum()
    summary = f"<b>Total:</b> {len(filtered)}  ·  <font color='#16A34A'>Safe: {safe_n}</font>  ·  <font color='#CA8A04'>Moderate: {mod_n}</font>  ·  <font color='#DC2626'>Reach: {rch_n}</font>"
    story.append(Paragraph(summary, subtitle_style))
    story.append(Spacer(1, 0.2*cm))

    # ── AI Quota Disclaimer ────────────────────────────────────────────────────
    if "AI" in category_codes:
        ai_msg = "⚠  AI Quota Note: Cutoffs shown are JEE Main percentiles, NOT MHT-CET. Use your JEE Main percentile to evaluate these results."
        ai_box = Table([[ai_msg]], colWidths=[23*cm])
        ai_box.setStyle(TableStyle([
            ('BACKGROUND',   (0,0), (-1,-1), colors.HexColor("#FEF9C3")),
            ('TEXTCOLOR',    (0,0), (-1,-1), colors.HexColor("#78350F")),
            ('FONTNAME',     (0,0), (-1,-1), 'Helvetica-Bold'),
            ('FONTSIZE',     (0,0), (-1,-1), 9.5),
            ('LEFTPADDING',  (0,0), (-1,-1), 12),
            ('RIGHTPADDING', (0,0), (-1,-1), 12),
            ('TOPPADDING',   (0,0), (-1,-1), 9),
            ('BOTTOMPADDING',(0,0), (-1,-1), 9),
            ('LINEBEFORE',   (0,0), (0,-1),  4, colors.HexColor("#F59E0B")),
        ]))
        story.append(ai_box)
        story.append(Spacer(1, 0.25*cm))

    # ── Limit to 25 rows ─────────────────────────────────────────────────────
    PDF_LIMIT   = 25
    total_found = len(filtered)
    filtered    = filtered.head(PDF_LIMIT)

    # ── Table ─────────────────────────────────────────────────────────────────
    cell_style = ParagraphStyle('cell', fontName='Helvetica', fontSize=7.5,
                                 leading=10, wordWrap='LTR', spaceAfter=0)

    def P(text, style=None):
        return Paragraph(str(text), style or cell_style)

    data = [["#", "Code", "College Name", "Branch", "District", "Type", "Cutoff %ile", "Rank", "Chance"]]
    for i, (_, r) in enumerate(filtered.iterrows(), 1):
        rank_str  = f"{int(r['Cutoff Rank']):,}" if pd.notna(r['Cutoff Rank']) else "N/A"
        pct_str   = f"{r['Percentile']:.2f}" if pd.notna(r['Percentile']) else "N/A"
        inst_code = str(r['Institution Code']) if pd.notna(r['Institution Code']) else "N/A"
        data.append([
            str(i), inst_code,
            P(r['College Name']), P(r['Branch']), P(r['District']),
            P(str(r['Status'])), pct_str, rank_str, r['Admission Chance']
        ])

    col_widths = [0.7*cm, 1.4*cm, 6.5*cm, 5.2*cm, 2.5*cm, 3.0*cm, 1.9*cm, 1.8*cm, 2.0*cm]
    table = Table(data, colWidths=col_widths, repeatRows=1, splitByRow=True)
    ts = TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('TEXTCOLOR', (0,0), (-1,0), GOLD),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 9),
        ('ALIGN', (0,0), (-1,0), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,0), 10),
        ('BOTTOMPADDING', (0,0), (-1,0), 10),
        # Body
        ('FONTSIZE', (0,1), (-1,-1), 7.5),
        ('ALIGN', (0,1), (0,-1), 'CENTER'),
        ('ALIGN', (5,1), (-1,-1), 'CENTER'),
        ('TEXTCOLOR', (0,1), (-1,-1), NAVY),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
        ('GRID', (0,0), (-1,-1), 0.3, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0,1), (-1,-1), 6),
        ('BOTTOMPADDING', (0,1), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ])

    # Color the chance column
    for i, (_, r) in enumerate(filtered.iterrows(), 1):
        chance = r['Admission Chance']
        if chance == 'Safe':
            ts.add('BACKGROUND', (8, i), (8, i), colors.HexColor("#DCFCE7"))
            ts.add('TEXTCOLOR', (8, i), (8, i), colors.HexColor("#166534"))
        elif chance == 'Moderate':
            ts.add('BACKGROUND', (8, i), (8, i), colors.HexColor("#FEF9C3"))
            ts.add('TEXTCOLOR', (8, i), (8, i), colors.HexColor("#854D0E"))
        else:
            ts.add('BACKGROUND', (8, i), (8, i), colors.HexColor("#FEE2E2"))
            ts.add('TEXTCOLOR', (8, i), (8, i), colors.HexColor("#991B1B"))

    table.setStyle(ts)
    story.append(table)
    story.append(Spacer(1, 0.4*cm))

    if total_found > PDF_LIMIT:
        story.append(Paragraph(
            f"<b>Note:</b> Only the top {PDF_LIMIT} colleges are shown in this PDF. "
            f"To see full list of your <b>{total_found} colleges</b> purchase our premium counselling service.",
            ParagraphStyle('note100', fontSize=9, textColor=colors.HexColor("#854D0E"),
                           backColor=colors.HexColor("#FEF3C7"), borderPadding=8,
                           alignment=TA_LEFT, leading=14)
        ))
        story.append(Spacer(1, 0.3*cm))

    story.append(Paragraph(
        "<b>Disclaimer:</b> Results are indicative based on previous CAP Round cutoffs. "
        "Always verify with the official DTE Maharashtra website before making final decisions.",
        ParagraphStyle('disc', fontSize=8, textColor=colors.grey, alignment=TA_LEFT)
    ))

    # Services last page — landscape A4: 29.7cm - 1cm - 1cm = 27.7cm usable
    from reportlab.platypus import PageBreak
    story.append(PageBreak())
    story.extend(add_services_page(usable_width=27.7*cm))

    doc.build(story, onFirstPage=add_pdf_header_footer, onLaterPages=add_pdf_header_footer)
    buf.seek(0)

    filename = f"ConceptDelta_Colleges_{percentile}_{cap_round.replace(' ', '')}.pdf"
    return StreamingResponse(buf, media_type="application/pdf",
                             headers={"Content-Disposition": f"attachment; filename={filename}"})


@app.get("/documents-pdf")
def documents_pdf(category: str = Query("Open")):
    docs = DOCUMENTS_DATA.get(category, DOCUMENTS_DATA["Open"])
    cat_display = category.replace("_", " / ")

    buf = io.BytesIO()
    # Use A4 portrait — same header/footer function as college predictor
    doc = SimpleDocTemplate(
        buf, pagesize=A4,
        leftMargin=1.5*cm, rightMargin=1.5*cm,
        topMargin=3.2*cm, bottomMargin=3.8*cm
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'DT', fontName='Helvetica-Bold', fontSize=22,
        textColor=NAVY, alignment=TA_CENTER, spaceAfter=15
    )
    sub_style = ParagraphStyle(
        'DS', fontName='Helvetica', fontSize=12,
        textColor=colors.grey, alignment=TA_CENTER, spaceAfter=0
    )
    cat_style = ParagraphStyle(
        'DC', fontName='Helvetica-Bold', fontSize=15,
        textColor=BLUE, alignment=TA_LEFT, spaceAfter=10
    )

    story = []
    story.append(Spacer(1, 0.4*cm))
    story.append(Paragraph("Documents Required for Admission", title_style))
    story.append(Spacer(1, 0.1*cm))
    story.append(Paragraph("For BE / B.Tech / B.Pharma Admission Process", sub_style))
    story.append(Spacer(1, 0.2*cm))
    story.append(HRFlowable(width="100%", thickness=2, color=GOLD, spaceAfter=16))
    story.append(Paragraph(
        f"<b>Category: {cat_display}</b>    ·    <b>Total: {len(docs)} documents</b>",
        cat_style
    ))
    story.append(Spacer(1, 0.2*cm))

    # Table — use Paragraph for long text cells so they wrap properly
    doc_cell = ParagraphStyle('dc', fontName='Helvetica', fontSize=11,
                               textColor=NAVY, leading=15, wordWrap='LTR')
    data = [["Sr. No", "Document Required"]]
    for i, d in enumerate(docs, 1):
        data.append([str(i), Paragraph(d, doc_cell)])

    table = Table(data, colWidths=[2*cm, 14*cm])
    table.setStyle(TableStyle([
        # Header
        ('BACKGROUND',    (0,0), (-1,0),  NAVY),
        ('TEXTCOLOR',     (0,0), (-1,0),  GOLD),
        ('FONTNAME',      (0,0), (-1,0),  'Helvetica-Bold'),
        ('FONTSIZE',      (0,0), (-1,0),  12),
        ('ALIGN',         (0,0), (0,0),   'CENTER'),
        ('ALIGN',         (1,0), (1,0),   'LEFT'),
        ('VALIGN',        (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING',    (0,0), (-1,0),  12),
        ('BOTTOMPADDING', (0,0), (-1,0),  12),
        ('LEFTPADDING',   (0,0), (-1,-1), 10),
        ('RIGHTPADDING',  (0,0), (-1,-1), 10),
        # Body numbers
        ('TEXTCOLOR',     (0,1), (0,-1),  GOLD),
        ('FONTNAME',      (0,1), (0,-1),  'Helvetica-Bold'),
        ('FONTSIZE',      (0,1), (0,-1),  12),
        ('ALIGN',         (0,1), (0,-1),  'CENTER'),
        # Alternating rows
        ('ROWBACKGROUNDS',(0,1), (-1,-1), [colors.white, colors.HexColor("#EEF2FF")]),
        ('GRID',          (0,0), (-1,-1), 0.4, colors.HexColor("#D0D8E8")),
        ('TOPPADDING',    (0,1), (-1,-1), 10),
        ('BOTTOMPADDING', (0,1), (-1,-1), 10),
    ]))
    story.append(table)
    story.append(Spacer(1, 0.8*cm))

    # Notes section
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#D0D8E8"), spaceAfter=12))
    story.append(Paragraph("<b>&#9632; Important Notes</b>",
        ParagraphStyle('NH', fontName='Helvetica-Bold', fontSize=14,
                       textColor=colors.HexColor("#92400E"), spaceAfter=10)))

    notes_table = Table(
        [[Paragraph(f"• {n}", ParagraphStyle('ni', fontName='Helvetica', fontSize=11,
                                              textColor=colors.HexColor("#78350F"),
                                              leading=16, wordWrap='LTR'))]
         for n in DOCUMENT_NOTES],
        colWidths=[15.5*cm]
    )
    notes_table.setStyle(TableStyle([
        ('BACKGROUND',    (0,0), (-1,-1), colors.HexColor("#FEF3C7")),
        ('LEFTPADDING',   (0,0), (-1,-1), 16),
        ('RIGHTPADDING',  (0,0), (-1,-1), 16),
        ('TOPPADDING',    (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LINEBEFORE',    (0,0), (0,-1),  4, GOLD),
    ]))
    story.append(notes_table)

    # Services last page — portrait A4: 21cm - 1.5cm - 1.5cm = 18cm usable
    from reportlab.platypus import PageBreak
    story.append(PageBreak())
    story.extend(add_services_page(usable_width=18*cm))

    doc.build(story, onFirstPage=add_pdf_header_footer, onLaterPages=add_pdf_header_footer)
    buf.seek(0)
    filename = f"ConceptDelta_Documents_{category}.pdf"
    return StreamingResponse(buf, media_type="application/pdf",
                             headers={"Content-Disposition": f"attachment; filename={filename}"})