# 🎓 MHT-CET PCM College Predictor

A full-stack web app to predict the best engineering colleges in Maharashtra based on MHT-CET percentile and category.

---

## 📁 Project Structure

```
mhtcet-predictor/
├── data/
│   └── mhtcet_cutoffs.csv       ← Your CSV data goes here
├── backend/
│   ├── main.py                  ← FastAPI backend
│   ├── requirements.txt
│   └── render.yaml              ← Render deployment config
└── frontend/
    ├── src/
    │   ├── App.js               ← Main React component
    │   └── index.js
    ├── public/
    │   └── index.html
    ├── package.json
    └── vercel.json              ← Vercel deployment config
```

---

## 📊 CSV Format

Your CSV file (`data/mhtcet_cutoffs.csv`) must have these columns:

| Column | Description | Example |
|--------|-------------|---------|
| `college_name` | Full college name | "VJTI Mumbai" |
| `branch` | Engineering branch | "Computer Engineering" |
| `category` | Reservation category | "OPEN", "OBC", "SC", "ST", "EWS", "TFWS", "PWD", "Defence" |
| `cutoff_percentile` | Last year closing percentile | 99.54 |
| `college_type` | Type of college | "Government", "Autonomous", "Private-Aided", "Private" |
| `district` | District of college | "Pune", "Mumbai" |
| `fees` | Annual fees in rupees | 89000 |
| `college_code` | Unique college code (optional) | 3001 |

### ⚠️ Important CSV Rules:
- One row per **college + branch + category** combination
- Percentile should be a decimal (e.g. 97.54, not 97)
- Category names must exactly match: OPEN, OBC, SC, ST, EWS, TFWS, PWD, Defence
- Fees in rupees (just the number, no ₹ symbol)

---

## 🖥️ Running Locally

### Step 1 — Backend (Python + FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Test it: open http://localhost:8000 in browser
API docs: open http://localhost:8000/docs

### Step 2 — Frontend (React)

```bash
cd frontend
npm install
npm start
```

Opens at http://localhost:3000

---

## 🌐 Deployment

### Backend → Render.com (Free)

1. Push your project to GitHub
2. Go to https://render.com → New → Web Service
3. Connect your GitHub repo
4. Set these settings:
   - **Root directory:** `backend`
   - **Build command:** `pip install -r requirements.txt`
   - **Start command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variable:
   - `CSV_PATH` = `../data/mhtcet_cutoffs.csv`
6. Click **Deploy**
7. Copy your Render URL (e.g. `https://mhtcet-api.onrender.com`)

### Frontend → Vercel (Free)

1. Go to https://vercel.com → New Project
2. Import your GitHub repo
3. Set **Root Directory** to `frontend`
4. Add environment variable:
   - `REACT_APP_API_URL` = your Render URL from above
5. Click **Deploy**
6. Your site is live! 🎉

---

## 🔄 Updating CSV Data

When you get new cutoff data:

1. Replace `data/mhtcet_cutoffs.csv` with your new file
2. Push to GitHub → Render auto-redeploys
3. Or call the hot-reload endpoint: `GET /reload-csv`

---

## 🧠 How Prediction Works

```
User Percentile vs Cutoff Percentile → Gap Calculation

Gap ≥ +1.0   → ✅ SAFE    (comfortably above cutoff)
Gap between -1.0 and +1.0 → ⚠️ MODERATE (very close to cutoff)
Gap between -5.0 and -1.0 → 🎯 REACH    (slightly below cutoff)
Gap < -5.0   → ❌ Not shown (out of range)
```

Up to **5 colleges per tier** are shown, sorted by cutoff (highest first = best colleges first).

---

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/branches` | List all branches |
| GET | `/districts` | List all districts |
| GET | `/categories` | List all categories |
| GET | `/college-types` | List college types |
| POST | `/predict` | Get college predictions |
| GET | `/reload-csv` | Hot-reload CSV data |

### POST /predict — Request Body

```json
{
  "percentile": 97.5,
  "category": "OPEN",
  "branches": ["Computer Engineering"],   // optional, [] = all
  "districts": ["Pune", "Mumbai"],         // optional, [] = all
  "college_type": "Government"             // optional, "" = all
}
```

---

## 📱 Features

- ✅ Filter by category, branch, district, college type
- ✅ 3 tiers: Safe / Moderate / Reach
- ✅ Shows cutoff gap, fees, college type
- ✅ Mobile responsive
- ✅ Hot-reload CSV without server restart
- ✅ FastAPI auto-generated API docs at `/docs`

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 |
| Backend | Python + FastAPI |
| Data | CSV + Pandas |
| Frontend Hosting | Vercel (free) |
| Backend Hosting | Render.com (free) |
