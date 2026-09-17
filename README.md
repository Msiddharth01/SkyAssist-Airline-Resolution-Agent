# SkyAssist: Customer-Facing Resolution Agent (Airline Disruption)

> **Assignment 3 — Customer-Facing Resolution Agent**  
> **Selection Round:** AIONOS II Batch 2027  
> **Evaluation Date:** Wednesday, 23 September 2026 Simulation

---

## 📌 Submission Checklist & Deliverables

| Requirement | Deliverable Link / Location |
|---|---|
| **1. GitHub Link** | Repository containing full source code (push this directory to your GitHub) |
| **2. Demo Video** | Video recording walkthrough demonstrating Scenarios 1, 2, and 3 (upload to Google Drive with public access) |
| **3. Architecture** | Detailed in [ARCHITECTURE.md](file:///Users/siddharth/Desktop/project%20company/ARCHITECTURE.md) and inside the in-app Architecture tab |
| **4. 10-Slide PPT** | [PRESENTATION_DECK.md](file:///Users/siddharth/Desktop/project%20company/PRESENTATION_DECK.md) & Interactive Slide Deck in [slides/index.html](file:///Users/siddharth/Desktop/project%20company/slides/index.html) |

---

## 🚀 Tech Stack

- **Frontend:** React 18 + Vite SPA with custom dark-themed airline design system.
- **Backend:** Node.js + Express REST API.
- **Data Store:** Grounded JSON data pack (`customers.json`, `bookings.json`, `policies.json`).
- **Policy Engine:** Deterministic JavaScript rule evaluator enforcing hard compensation boundaries.
- **AI / LLM:** Google Gemini API (`gemini-2.0-flash`) with intelligent fallback simulator for offline / zero-setup testing.
- **Audit System:** Tamper-evident JSON event logger (`backend/data/audit/audit_log.json`).
- **Client-Server Communication:** Axios HTTP client with Vite reverse proxy.

---

## ⚡ Quick Start (Run in 2 Steps)

### 1. Start the Backend Server
```bash
cd backend
npm install
npm start
```
*Backend runs on `http://localhost:3001`.*  
*(Optional: add your Gemini API Key in `backend/.env` as `GEMINI_API_KEY=your_key`. If omitted, the built-in deterministic simulator handles all scenarios automatically).*

### 2. Start the Frontend Client
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
*Open [http://localhost:5173](http://localhost:5173) in your browser.*

---

## 🎯 How the 3 Scenarios are Handled

### 1. Scenario 1 — Priya Nair (Gold Tier | PNR: SK4821X)
- **Flight Status:** Flight SK-224 (Delhi → Goa) is **CANCELLED** due to operational reasons. Return flight SK-031 is unaffected.
- **Customer Demand:** Furious. Wants a full cash refund **PLUS** a free upgrade to business class on her return flight.
- **Agent Action:**
  - Validates Gold loyalty and acknowledges disruption empathy.
  - Offers free rebooking within 24h (with Gold priority seating) OR full refund to original payment within 7 business days.
  - **Firmly denies** free business class cabin upgrade per airline service rules.

### 2. Scenario 2 — Arvind Kulkarni (Silver Tier | PNR: TR11900)
- **Flight Status:** Flight SK-118 (Mumbai → Bengaluru) is **DELAYED 4 HOURS** (revised departure: 11:10).
- **Customer Demand:** Anxious about missing a connecting meeting; demands hotel accommodation.
- **Agent Action:**
  - Expresses sincere empathy for the meeting conflict.
  - Proactively activates **₹500 meal voucher** and **airport lounge access** (applicable for delays > 3h).
  - **Politely denies hotel accommodation**, explaining that hotel stays require delays > 5h.

### 3. Scenario 3 — Meher Kaur (Platinum Tier | PNR: WL7742)
- **Flight Status:** Flight SK-305 (Delhi → Hyderabad) is **DELAYED 6 HOURS** (revised departure: 20:00).
- **Customer Demand:** Demands an overnight hotel stay (full night) and switch to a higher-fare flight where the fare difference is ₹2,000.
- **Agent Action & Escalation:**
  - Explains that delays > 5h cover day-room accommodation for the 6 delayed hours only, not a full night.
  - Explains that the agent discretionary fare waiver limit is strictly **₹1,500**.
  - **Triggers supervisor escalation** (`[ESCALATE]`), routing the ₹2,000 waiver request to human review.

---

## 🖥️ Interactive Slide Presentation
To view or present the required **10-slide PPT**, simply open `slides/index.html` in any web browser, or navigate with arrow keys / Spacebar.
