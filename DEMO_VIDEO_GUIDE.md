# SkyAssist: Demo Video Script & Walkthrough Guide
**Mandatory Deliverable 2: Demo Video uploaded to Google Drive with Open/Public Access**

Follow this step-by-step 3-to-4 minute recording script using QuickTime, Loom, or OBS to record your demo.

---

## 🎬 Video Recording Structure

### 0:00 – 0:45 | Introduction & Architecture
1. **Show the Web Interface:** Open `http://localhost:5173`.
2. **State Your Name & Purpose:**
   > *"Hello! This is my submission for Assignment 3: Customer-Facing Resolution Agent for Airline Disruption. I built SkyAssist using React, Vite, Node.js, Express, an isolated deterministic JavaScript policy engine, and the Gemini API, backed by JSON audit logging."*
3. **Show the Architecture Tab:** Click on the **Architecture** button in the top navigation bar to briefly highlight the separation of concerns between deterministic policy logic and conversational generation.

---

### 0:45 – 1:45 | Scenario 1 Walkthrough — Priya Nair (Flight Cancellation)
1. In the left panel, select **Priya Nair** (Gold Tier, PNR: SK4821X).
2. Click the **"⚡ Load test scenario"** button or type:
   > *"I'm furious! My flight SK-224 to Goa was cancelled and no one told me anything! I want a full cash refund PLUS a free upgrade to business class on my return flight for the trouble."*
3. Click **Send**.
4. **Narrate What Happened:**
   - Notice the agent addresses Priya empathetically and acknowledges her Gold loyalty.
   - It offers her a full refund (7 business days to original payment method) OR free rebooking within 24h with priority seating.
   - It **firmly and politely denies** the free business class upgrade, adhering strictly to airline policy.
   - Point out the real-time **Policy Engine Guardrails** on the right side of the screen.

---

### 1:45 – 2:30 | Scenario 2 Walkthrough — Arvind Kulkarni (4h Delay)
1. Click **Arvind Kulkarni** (Silver Tier, PNR: TR11900) in the left panel.
2. Click **"⚡ Load test scenario"** or type:
   > *"My flight SK-118 is delayed by 4 hours and I'm going to miss my connecting meeting in Bengaluru. Since it's such a long delay, I want you to arrange hotel accommodation for me right now."*
3. Click **Send**.
4. **Narrate What Happened:**
   - The agent acknowledges Arvind's stress over the business meeting.
   - It grants the **₹500 meal voucher** and **airport lounge access** because the delay exceeds 3 hours.
   - It **denies hotel accommodation**, explaining that hotel stays require a delay of more than 5 hours per airline policy.

---

### 2:30 – 3:30 | Scenario 3 Walkthrough — Meher Kaur (6h Delay & Escalation)
1. Click **Meher Kaur** (Platinum Tier, PNR: WL7742).
2. Click **"⚡ Load test scenario"** or type:
   > *"My flight SK-305 is delayed 6 hours. I want a full night's hotel stay rather than just a few hours. Also, move me to an earlier higher-fare flight instead of waiting — the fare difference is ₹2,000."*
3. Click **Send**.
4. **Narrate What Happened:**
   - The agent clarifies that the hotel covers the 6 delayed hours only, not a full night stay.
   - Because the ₹2,000 fare difference exceeds the agent waiver authorization limit of ₹1,500, the agent automatically flags this and **escalates to a duty supervisor**.
   - Show the red **Escalation Alert Banner** that appears in the chat and on the right panel action log.

---

### 3:30 – 4:00 | Audit Trail & 10-Slide Presentation Deck
1. Click the **Audit Trail** button in the header.
2. Show that every message turn, parsed operational action, and escalation is permanently recorded to disk in `audit_log.json`.
3. Open `slides/index.html` in your browser and click through 2 or 3 slides to show the complete 10-slide presentation deck.
4. Conclude:
   > *"Thank you! The code is fully documented in GitHub with a one-command setup, and all four submission requirements are complete."*

---

## ⚠️ Important Reminder for Google Drive Upload
When you upload your demo video file (MP4/WebM) to Google Drive:
1. Right click the video in Google Drive $\rightarrow$ **Share**.
2. Change General Access from *"Restricted"* to **"Anyone with the link can view"** (mandatory requirement).
3. Copy this shareable link into your final submission form!
