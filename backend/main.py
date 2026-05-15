from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import os
from typing import Optional

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load CSV ──────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.environ.get("CSV_PATH", os.path.join(BASE_DIR, "../data/mhtcet_complete.csv"))

df = pd.read_csv(CSV_PATH)
df['Category'] = df['Category'].str.strip()
df['Percentile'] = pd.to_numeric(df['Percentile'], errors='coerce')
df['Cutoff Rank'] = pd.to_numeric(df['Cutoff Rank'], errors='coerce')
df['Total Fee'] = pd.to_numeric(df['Total Fee'], errors='coerce')
df['CAP Round'] = df['CAP Round'].fillna('Unknown')

print(f"✅ Loaded {len(df)} rows from CSV")

# ── Category Mapping ──────────────────────────────────────────────────────────
# Logic: prefix (G=Male, L=Female) + caste + suffix (H=Home, O=Other, S=State)
# Special quotas: PWD, DEF, EWS, TFWS, MI, ORPHAN, AI have their own codes

CASTE_MAP = {
    "OPEN": "OPEN",
    "OBC":  "OBC",
    "SC":   "SC",
    "ST":   "ST",
    "SEBC": "SEBC",
    "VJ":   "VJ",
    "NT1":  "NT1",
    "NT2":  "NT2",
    "NT3":  "NT3",
}

SUFFIX_MAP = {
    "Home University":  "H",
    "Other University": "O",
    "State Level":      "S",
}

def build_category_code(gender: str, caste: str, quota: str, uni_type: str) -> list:
    """
    Returns a list of possible category codes for the given combination.
    quota: NONE | PWD | DEF | EWS | TFWS | MI | ORPHAN | AI
    """
    # Special standalone quotas
    if quota == "AI":
        return ["AI"]
    if quota == "MI":
        return ["MI"]
    if quota == "ORPHAN":
        return ["ORPHAN"]
    if quota == "EWS":
        return ["EWS"]
    if quota == "TFWS":
        return ["TFWS"]

    suffix = SUFFIX_MAP.get(uni_type, "S")
    prefix = "G" if gender == "Male" else "L"

    if quota == "PWD":
        # PWD uses its own prefix
        if caste == "OPEN":
            return [f"PWDOPEN{suffix}"]
        else:
            return [f"PWD{caste}{suffix}", f"PWDR{caste}{suffix}"]

    if quota == "DEF":
        # Defence uses DEF prefix
        if caste == "OPEN":
            return [f"DEFOPEN{suffix}"]
        else:
            return [f"DEF{caste}{suffix}", f"DEFR{caste}{suffix}"]

    # Normal category
    if caste == "OPEN":
        return [f"{prefix}OPEN{suffix}"]
    elif caste == "VJ":
        return [f"{prefix}VJ{suffix}"]
    elif caste in ["NT1", "NT2", "NT3"]:
        return [f"{prefix}{caste}{suffix}"]
    else:
        return [f"{prefix}{caste}{suffix}"]


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "MHT-CET Predictor API is running"}


@app.get("/branches")
def get_branches():
    branches = sorted(df['Branch'].dropna().unique().tolist())
    return {"branches": branches}


@app.get("/districts")
def get_districts():
    districts = sorted(df['District'].dropna().unique().tolist())
    return {"districts": districts}


@app.get("/college-types")
def get_college_types():
    types = sorted(df['Status'].dropna().unique().tolist())
    return {"college_types": types}


@app.get("/predict")
def predict(
    percentile: float = Query(...),
    gender: str = Query(...),           # Male | Female
    caste: str = Query(...),            # OPEN | OBC | SC | ST | SEBC | VJ | NT1 | NT2 | NT3
    quota: str = Query("NONE"),         # NONE | PWD | DEF | EWS | TFWS | MI | ORPHAN | AI
    uni_type: str = Query("State Level"),  # Home University | Other University | State Level
    cap_round: str = Query("CAP Round 1"),
    branches: Optional[str] = Query(None),
    districts: Optional[str] = Query(None),
    college_type: Optional[str] = Query(None),
):
    # Build category codes
    category_codes = build_category_code(gender, caste, quota, uni_type)

    # Filter by CAP Round (AI has no fixed round in some cases)
    if quota == "AI":
        filtered = df[df['Category'] == 'AI'].copy()
    else:
        filtered = df[
            (df['Category'].isin(category_codes)) &
            (df['CAP Round'] == cap_round)
        ].copy()

    # Filter by percentile — show colleges where cutoff percentile <= user percentile
    filtered = filtered[filtered['Percentile'] <= percentile]

    # Optional filters
    if branches:
        branch_list = [b.strip() for b in branches.split(",")]
        filtered = filtered[filtered['Branch'].isin(branch_list)]

    if districts:
        district_list = [d.strip() for d in districts.split(",")]
        filtered = filtered[filtered['District'].isin(district_list)]

    if college_type:
        filtered = filtered[filtered['Status'].str.contains(college_type, na=False)]

    # Sort by percentile descending (highest cutoff first = most competitive)
    filtered = filtered.sort_values('Percentile', ascending=False)

    # Drop duplicates keeping best cutoff per college+branch
    filtered = filtered.drop_duplicates(subset=['College Name', 'Branch'])

    # Classify into Safe / Moderate / Reach
    def classify(row):
        diff = percentile - row['Percentile']
        if diff >= 5:
            return 'Safe'
        elif diff >= 2:
            return 'Moderate'
        else:
            return 'Reach'

    filtered['Admission Chance'] = filtered.apply(classify, axis=1)

    # Prepare response
    results = filtered[[
        'Institution Code', 'College Name', 'University', 'Status',
        'District', 'Region', 'Branch', 'CAP Round', 'Category',
        'Cutoff Rank', 'Percentile', 'Total Fee', 'Admission Chance'
    ]].fillna('N/A')

    # Convert to list of dicts
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

    return {
        "percentile": percentile,
        "gender": gender,
        "caste": caste,
        "quota": quota,
        "uni_type": uni_type,
        "cap_round": cap_round,
        "category_codes": category_codes,
        "total_results": len(colleges),
        "colleges": colleges
    }
