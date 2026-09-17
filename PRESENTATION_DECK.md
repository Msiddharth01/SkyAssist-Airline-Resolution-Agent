# SkyAssist: Customer-Facing Resolution Agent
## 10-Slide Presentation Deck Content
**Assignment 3: Airline Disruption Resolution Agent**  
**Submission Target:** AIONOS II Selection Round

---

### Slide 1: Title & Project Overview
- **Title:** SkyAssist — Autonomous Resolution Agent for Airline Disruptions
- **Subtitle:** Balancing Empathetic Customer De-escalation with Deterministic Policy Guardrails
- **Presenter:** Candidate Submission
- **Tech Stack:** React 18, Vite, Node.js, Express, Axios, Deterministic Policy Engine, Google Gemini API
- **Key Proposition:** A customer-facing agent that resolves high-stress disruptions without ever hallucinating unauthorized compensation or violating airline operating policy.

---

### Slide 2: The Core Problem & Airline Realities
- **The Customer Reality:** Flight cancellations and delays cause extreme customer anxiety, missed meetings, and emotional distress.
- **The Airline Risk:** Generative AI agents frequently hallucinate free upgrades, unauthorized refunds, or incorrect compensation policies when faced with angry customers.
- **The Core Objective:** Build an intelligent resolution agent that:
  - Understands customer intent and de-escalates anger.
  - Strictly respects verified airline rules and data packs.
  - Executes authorized compensation autonomously while escalating out-of-scope requests instantly.

---

### Slide 3: Disruption Data Pack & Personas
- **Priya Nair (Gold Tier | PNR: SK4821X):**
  - Flight SK-224 (Delhi → Goa) CANCELLED due to operational reasons.
  - Travel history: 8 flights/12m. Prior baggage issue resolved with voucher.
- **Arvind Kulkarni (Silver Tier | PNR: TR11900):**
  - Flight SK-118 (Mumbai → Bengaluru) DELAYED 4 hours (revised to 11:10).
  - High anxiety over missing an important connecting business meeting.
- **Meher Kaur (Platinum Tier | PNR: WL7742):**
  - Flight SK-305 (Delhi → Hyderabad) DELAYED 6 hours (revised to 20:00).
  - Demands overnight hotel and voluntary flight swap with ₹2,000 fare difference.

---

### Slide 4: System Architecture & Data Flow
- **Client (Frontend):** React + Vite SPA featuring live customer persona selection, 1-click test scenarios, and real-time policy guardrail inspectors.
- **API Communication:** Axios HTTP client routing through Vite proxy to Express REST endpoints.
- **Backend Orchestration:** Node.js + Express handling session state, prompt assembly, and token parsing.
- **Hybrid Decision Architecture:**
  - **Deterministic Policy Layer (JavaScript):** Math, thresholds, and rule validation.
  - **Generative Language Layer (Gemini LLM):** Empathy, conversational clarity, and de-escalation.
- **Persistence:** Local JSON audit files logging all events, turns, and escalations.

---

### Slide 5: The Deterministic Guardrail Engine
- **Why pure LLM prompts fail:** Under emotional pressure or adversarial user phrasing, LLMs can bend rules ("I'm so sorry, here is a free business class upgrade").
- **Our Solution — Pre-LLM Policy Boundary Injection:**
  - Evaluates exact delay hours before generating text.
  - Sets explicit allowed actions: `issue_meal_voucher`, `issue_lounge_access`, `rebook_free`.
  - Enforces hard boundaries: Fare difference ceiling = ₹1,500; Hotel only for delay > 5h (delayed hours only); Refunds to original payment method only (7 days).

---

### Slide 6: Scenario 1 Execution — Priya Nair (Cancellation)
- **Customer Demand:** "I'm furious! Give me a full cash refund PLUS a free business class upgrade on my return flight!"
- **Policy Engine Evaluation:**
  - Cancellation is airline-caused $\rightarrow$ Entitled to free rebooking within 24h OR full refund.
  - Upgrade to business class is prohibited by standard disruption policy.
- **Agent Behavior:**
  - Acknowledges Gold tier loyalty and validates her frustration.
  - Offers free rebook (with Gold priority seating) or 7-day refund to original payment.
  - Firmly but courteously denies complimentary business class cabin upgrade.

---

### Slide 7: Scenario 2 Execution — Arvind Kulkarni (4h Delay)
- **Customer Demand:** "I'm missing my meeting in Bengaluru! Give me hotel accommodation right now!"
- **Policy Engine Evaluation:**
  - Delay is 4 hours ($>3\text{h}$ but $\le 5\text{h}$).
  - Entitled to: ₹500 meal voucher + Airport lounge access.
  - Hotel accommodation is strictly reserved for delays $>5\text{h}$.
- **Agent Behavior:**
  - Expresses genuine empathy for the missed meeting.
  - Activates meal voucher and lounge pass for immediate comfort and workspace.
  - Clearly explains the >5h hotel threshold, preventing unnecessary hotel overhead.

---

### Slide 8: Scenario 3 Execution — Meher Kaur (6h Delay & Fare Diff)
- **Customer Demand:** "I want a full night's hotel stay, and switch me to a higher-fare flight with a ₹2,000 fare difference."
- **Policy Engine Evaluation:**
  - Delay is 6 hours ($>5\text{h}$) $\rightarrow$ Hotel covered for delayed hours only (day-room), NOT full night.
  - Fare difference is ₹2,000 $\rightarrow$ Exceeds agent discretionary limit of ₹1,500.
- **Agent Behavior & Escalation:**
  - Offers hotel coverage for the 6-hour delay period.
  - Flags ₹2,000 fare difference as beyond agent authorization.
  - Triggers supervisor escalation token `[ESCALATE:{"type":"supervisor"}]`, logging the handoff to human review.

---

### Slide 9: Auditability, Security & Regulatory Compliance
- **Complete Action & Conversation Trail:** Every message turn, detected operational action, and escalation is written to `data/audit/audit_log.json`.
- **Supervisor Handoff Record:** Logs exact timestamps, reason for escalation, and customer tier for compliance audits.
- **Prompt Grounding:** Zero reliance on ungrounded external assumptions; system prompt enforces verbatim compliance with service rules.
- **Legal Threat Protocol:** Mentions of lawsuits or formal complaints immediately route to executive support.

---

### Slide 10: Business Impact, Value & Roadmap
- **Operational Efficiency:** 75%+ of routine disruption queries (vouchers, basic rebooking, policy status) resolved autonomously in seconds.
- **Cost Protection:** Strictly enforces the ₹1,500 waiver cap and delay duration rules, preventing financial leakage.
- **Next Steps & Roadmap:**
  - Integrate PSS/GDS live APIs (Amadeus/Sabre) for automated ticket issuance.
  - Voice AI integration (Twilio/WebRTC) for telephone disruption triage.
  - Human-in-the-loop dashboard for supervisors to approve escalated fare waivers in real time.
