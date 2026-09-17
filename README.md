# SkyAssist: AI-Powered Airline Disruption Resolution Agent

SkyAssist is a full-stack, autonomous customer resolution agent designed for airline disruption operations. It resolves complex flight cancellation and delay scenarios by combining an **isolated deterministic policy engine** with a generative LLM (`gemini-2.0-flash`).

By decoupling policy rules from natural language generation, the system provides **zero-hallucination guarantees** on compensation, meal vouchers, hotel accommodations, and fee waivers while delivering empathetic, de-escalating customer communication.

---

---

## Key Features

1. **Deterministic Policy Guardrails:**
   - Evaluates disruption rules in code before calling the LLM.
   - Enforces exact delay duration compensation ladders (e.g. ₹500 voucher for $<3\text{h}$, lounge access for $>3\text{h}$, hotel day-room for $>5\text{h}$).
   - Restricts agent-authorized fare difference waivers to ₹1,500 maximum.

2. **Automated Escalation Protocol:**
   - Automatically detects unauthorized requests (e.g., fare differences exceeding ₹1,500, legal threats, formal complaints) and routes them to human supervisors.

3. **Tamper-Evident Audit Trail:**
   - Logs every conversation turn, resolved compensation action, and escalation event to a persistent JSON audit file.

4. **Interactive Dashboard:**
   - Built with React 18 and a custom airline theme.
   - Includes real-time policy guardrail inspectors, loyalty tier indicators (Gold, Silver, Platinum), and live action logs.

---

##  Tech Stack

- **Frontend:** React 18, Vite, Lucide Icons, Custom CSS Design System
- **Backend:** Node.js, Express, CORS, dotenv
- **AI / LLM:** Google Gemini API (`@google/generative-ai`) with resilient fallback simulator
- **Data Layer:** JSON persistence (`customers.json`, `bookings.json`, `policies.json`, `audit_log.json`)
- **API Client:** Axios

---

## ⚡ Getting Started

### Prerequisites
- Node.js 18+ and npm installed

### 1. Backend Setup
```bash
cd backend
npm install
npm start
```
*Backend runs on `http://localhost:3001`.*  
*(Optional: set `GEMINI_API_KEY` in `backend/.env`. If not set, the built-in deterministic simulator handles all policy rules automatically).*

### 2. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*Open `http://localhost:5173` in your browser.*

---

##  Disruption Scenarios Handled

- **Scenario 1 — Flight Cancellation (Priya Nair, Gold Tier):**
  - Flight cancelled due to operational reasons.
  - Resolves full refund or 24-hour priority rebooking while strictly denying unauthorized cabin upgrades.
- **Scenario 2 — 4-Hour Delay (Arvind Kulkarni, Silver Tier):**
  - Flight delayed by 4 hours.
  - Automatically issues meal voucher and lounge access while adhering to the rule that hotel stays require delays exceeding 5 hours.
- **Scenario 3 — 6-Hour Delay & Fee Waiver (Meher Kaur, Platinum Tier):**
  - Flight delayed by 6 hours with a request for a ₹2,000 fare difference waiver.
  - Provides hotel accommodation for delayed hours only and escalates the ₹2,000 waiver request to a duty supervisor because it exceeds the ₹1,500 authorization ceiling.

---

##  License
MIT License. Built by Siddharth Malik.
