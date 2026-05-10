from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import pandas as pd
import os

app = FastAPI(title="MHT-CET College Predictor API", version="1.0.0")

# ─── CORS (allows React frontend to call this API) ──────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Load CSV ────────────────────────────────────────────────────────────────
CSV_PATH = os.getenv("CSV_PATH", "../data/mhtcet_cutoffs.csv")

def load_data():
    try:
        df = pd.read_csv(CSV_PATH)
        df.columns = df.columns.str.strip()
        df["cutoff_percentile"] = pd.to_numeric(df["cutoff_percentile"], errors="coerce")
        df["fees"] = pd.to_numeric(df["fees"], errors="coerce").fillna(0)
        return df
    except Exception as e:
        raise RuntimeError(f"Failed to load CSV: {e}")

df = load_data()

# ─── Request / Response Models ───────────────────────────────────────────────
class PredictRequest(BaseModel):
    percentile: float
    category: str                        # e.g. "OPEN", "OBC", "SC", "ST", "EWS", "TFWS", "PWD"
    branches: Optional[List[str]] = []   # e.g. ["Computer Engineering", "IT"] — empty = all
    districts: Optional[List[str]] = []  # e.g. ["Pune", "Mumbai"] — empty = all
    college_type: Optional[str] = ""     # "Government", "Private", etc — empty = all

class CollegeResult(BaseModel):
    college_name: str
    branch: str
    category: str
    cutoff_percentile: float
    college_type: str
    district: str
    fees: int
    chance: str          # "Safe" | "Moderate" | "Reach"
    gap: float           # user_percentile - cutoff (positive = above cutoff)

class PredictResponse(BaseModel):
    percentile: float
    category: str
    safe: List[CollegeResult]
    moderate: List[CollegeResult]
    reach: List[CollegeResult]
    total_eligible: int

# ─── Helper ──────────────────────────────────────────────────────────────────
CATEGORY_PRIORITY = ["OPEN", "OBC", "EWS", "SC", "ST", "TFWS", "PWD", "Defence"]

def classify_chance(gap: float) -> str:
    """
    gap = user_percentile - cutoff_percentile
    Positive gap → user is above cutoff → Safe
    Near zero    → Moderate
    Negative     → Reach (but not too far off)
    """
    if gap >= 1.0:
        return "Safe"
    elif gap >= -1.0:
        return "Moderate"
    else:
        return "Reach"

# ─── Routes ──────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "MHT-CET College Predictor API is running ✅"}

@app.get("/branches")
def get_branches():
    """Return unique branches available in the dataset."""
    branches = sorted(df["branch"].dropna().unique().tolist())
    return {"branches": branches}

@app.get("/districts")
def get_districts():
    """Return unique districts available in the dataset."""
    districts = sorted(df["district"].dropna().unique().tolist())
    return {"districts": districts}

@app.get("/college-types")
def get_college_types():
    """Return unique college types."""
    types = sorted(df["college_type"].dropna().unique().tolist())
    return {"college_types": types}

@app.get("/categories")
def get_categories():
    return {
        "categories": ["OPEN", "OBC", "SC", "ST", "EWS", "TFWS", "PWD", "Defence"]
    }

@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    if req.percentile < 0 or req.percentile > 100:
        raise HTTPException(status_code=400, detail="Percentile must be between 0 and 100.")

    category = req.category.strip().upper()

    # ── Filter by category ──
    filtered = df[df["category"].str.upper() == category].copy()

    if filtered.empty:
        raise HTTPException(
            status_code=404,
            detail=f"No data found for category '{category}'. Check the category name."
        )

    # ── Optional: filter by branches ──
    if req.branches:
        filtered = filtered[filtered["branch"].isin(req.branches)]

    # ── Optional: filter by districts ──
    if req.districts:
        filtered = filtered[filtered["district"].isin(req.districts)]

    # ── Optional: filter by college type ──
    if req.college_type:
        filtered = filtered[filtered["college_type"] == req.college_type]

    if filtered.empty:
        raise HTTPException(
            status_code=404,
            detail="No colleges found for the selected filters. Try broadening your search."
        )

    # ── Compute gap and classify ──
    # Reach window: user's percentile is at most 5 points below cutoff
    REACH_WINDOW = 5.0

    filtered = filtered.copy()
    filtered["gap"] = req.percentile - filtered["cutoff_percentile"]
    filtered = filtered[filtered["gap"] >= -REACH_WINDOW]  # exclude totally out-of-range
    filtered["chance"] = filtered["gap"].apply(classify_chance)

    # ── Sort: within each chance tier, sort by cutoff descending (best first) ──
    filtered = filtered.sort_values("cutoff_percentile", ascending=False)

    def to_result(row) -> CollegeResult:
        return CollegeResult(
            college_name=row["college_name"],
            branch=row["branch"],
            category=row["category"],
            cutoff_percentile=row["cutoff_percentile"],
            college_type=row["college_type"],
            district=row["district"],
            fees=int(row["fees"]),
            chance=row["chance"],
            gap=round(row["gap"], 2),
        )

    safe_df     = filtered[filtered["chance"] == "Safe"]
    moderate_df = filtered[filtered["chance"] == "Moderate"]
    reach_df    = filtered[filtered["chance"] == "Reach"]

    return PredictResponse(
        percentile=req.percentile,
        category=req.category,
        safe=[to_result(r) for _, r in safe_df.head(5).iterrows()],
        moderate=[to_result(r) for _, r in moderate_df.head(5).iterrows()],
        reach=[to_result(r) for _, r in reach_df.head(5).iterrows()],
        total_eligible=len(filtered),
    )

@app.get("/reload-csv")
def reload_csv():
    """Hot-reload the CSV without restarting the server. Useful when CSV is updated."""
    global df
    df = load_data()
    return {"message": "CSV reloaded successfully ✅", "rows": len(df)}
