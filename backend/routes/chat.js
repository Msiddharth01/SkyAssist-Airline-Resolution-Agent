const express = require('express');
const router = express.Router();

const {
  getCustomerById,
  getBookingsByCustomerId,
  getPrimaryBooking,
  getAllCustomers,
} = require('../services/customerService');
const { evaluateEntitlements } = require('../services/policyEngine');
const { generateResponse } = require('../services/llmService');
const { createSession, logMessage, getAuditLog } = require('../services/auditService');

// In-memory session store: sessionId → conversationHistory[]
const activeSessions = new Map();

// ── POST /api/chat/message ─────────────────────────────────────────────────
router.post('/message', async (req, res) => {
  try {
    const { customerId, message, sessionId } = req.body;

    if (!customerId || !message) {
      return res.status(400).json({ error: 'customerId and message are required.' });
    }

    const customer = getCustomerById(customerId);
    if (!customer) return res.status(404).json({ error: 'Customer not found.' });

    const bookings = getBookingsByCustomerId(customerId);
    const primaryBooking = getPrimaryBooking(customerId);
    if (!primaryBooking) return res.status(404).json({ error: 'No booking found for customer.' });

    // ── Policy engine (deterministic) ──────────────────────────────────────
    const policyContext = evaluateEntitlements(customer, primaryBooking);

    // ── Session management ─────────────────────────────────────────────────
    let currentSessionId = sessionId;
    if (!currentSessionId || !activeSessions.has(currentSessionId)) {
      currentSessionId = createSession(
        customer.id,
        customer.name,
        customer.loyaltyTier,
        `Scenario: ${customer.name} — ${primaryBooking.status} (${primaryBooking.flight})`
      );
      activeSessions.set(currentSessionId, []);
    }

    const history = activeSessions.get(currentSessionId);

    // Log user message
    history.push({ role: 'user', content: message });
    logMessage(currentSessionId, 'user', message);

    // ── LLM call ───────────────────────────────────────────────────────────
    const llmResult = await generateResponse(customer, bookings, policyContext, history);

    // Detect actions mentioned in the response
    const detectedActions = detectActionsFromResponse(llmResult.response);

    // Log agent response
    history.push({ role: 'agent', content: llmResult.response });
    logMessage(currentSessionId, 'agent', llmResult.response, {
      escalation: llmResult.escalation,
      actions: detectedActions,
    });

    activeSessions.set(currentSessionId, history);

    res.json({
      sessionId: currentSessionId,
      response: llmResult.response,
      escalation: llmResult.escalation,
      policyContext,
      detectedActions,
      customer: {
        name: customer.name,
        tier: customer.loyaltyTier,
        bookingRef: customer.bookingRef,
      },
      primaryBooking,
    });
  } catch (err) {
    console.error('❌ Chat error:', err.message);
    res.status(500).json({ error: err.message || 'Internal server error.' });
  }
});

// ── GET /api/chat/customers ────────────────────────────────────────────────
router.get('/customers', (req, res) => {
  const customers = getAllCustomers();
  const result = customers.map((c) => ({
    ...c,
    bookings: getBookingsByCustomerId(c.id),
    primaryBooking: getPrimaryBooking(c.id),
  }));
  res.json(result);
});

// ── GET /api/chat/audit ────────────────────────────────────────────────────
router.get('/audit', (req, res) => {
  res.json(getAuditLog());
});

// ── POST /api/chat/reset ───────────────────────────────────────────────────
router.post('/reset', (req, res) => {
  const { sessionId } = req.body;
  if (sessionId && activeSessions.has(sessionId)) {
    activeSessions.delete(sessionId);
  }
  res.json({ success: true, message: 'Session reset.' });
});

// ── Utility: detect actions mentioned in LLM response ─────────────────────
function detectActionsFromResponse(text) {
  const lower = text.toLowerCase();
  const actions = [];
  if (lower.includes('meal voucher')) actions.push('meal_voucher_issued');
  if (lower.includes('lounge access')) actions.push('lounge_access_granted');
  if (lower.includes('hotel')) actions.push('hotel_accommodation_noted');
  if (lower.includes('rebook') || lower.includes('re-book')) actions.push('rebooking_initiated');
  if (lower.includes('refund')) actions.push('refund_initiated');
  if (lower.includes('escalat')) actions.push('escalated_to_human_agent');
  if (lower.includes('supervisor')) actions.push('supervisor_approval_required');
  return [...new Set(actions)];
}

module.exports = router;
