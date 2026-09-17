const policies = require('../data/policies.json');

/**
 * DETERMINISTIC POLICY ENGINE
 * Evaluates exactly what a customer is entitled to based on their
 * booking status, delay duration, loyalty tier, and airline rules.
 * This is the source of truth — the LLM cannot override this.
 */
function evaluateEntitlements(customer, booking) {
  const result = {
    customerId: customer.id,
    customerName: customer.name,
    loyaltyTier: customer.loyaltyTier,
    bookingStatus: booking.status,
    isAirlineCaused: booking.airlineCaused,
    entitlements: [],
    allowedActions: ['provide_flight_and_booking_status_info'],
    restrictions: [],
    priorityRebooking: false,
    escalationRequired: false,
    escalationReasons: [],
  };

  // ── Loyalty tier benefits ──────────────────────────────────────────────────
  const tierBenefits = policies.loyaltyTierBenefits[customer.loyaltyTier];
  if (tierBenefits?.priorityRebooking) {
    result.priorityRebooking = true;
    result.entitlements.push(`${customer.loyaltyTier} tier: Priority access to next-available seats`);
  }

  // ── Cancellation (airline-caused) ─────────────────────────────────────────
  if (booking.status === 'Cancelled') {
    if (booking.airlineCaused) {
      result.entitlements.push('FREE rebooking on next available flight within 24 hours');
      result.entitlements.push('OR: Full refund to original payment method (7 business days) — customer\'s choice');
      result.allowedActions.push('rebook_free_on_next_available_flight');
      result.allowedActions.push('initiate_full_refund_to_original_payment');
    } else {
      result.restrictions.push('Flight cancelled — not airline-caused. Standard policy does not apply.');
    }
  }

  // ── Delay compensation ────────────────────────────────────────────────────
  if (booking.status === 'Delayed' && booking.airlineCaused) {
    const delay = booking.delayHours;

    if (delay < 3) {
      result.entitlements.push('₹500 meal voucher (delay under 3 hours)');
      result.allowedActions.push('issue_meal_voucher_inr_500');
    } else if (delay >= 3 && delay <= 5) {
      result.entitlements.push('Meal voucher (delay over 3 hours)');
      result.entitlements.push('Lounge access (delay over 3 hours)');
      result.allowedActions.push('issue_meal_voucher');
      result.allowedActions.push('issue_lounge_access');
    } else if (delay > 5) {
      result.entitlements.push('Meal voucher (delay over 5 hours)');
      result.entitlements.push('Lounge access (delay over 5 hours)');
      result.entitlements.push(
        `Hotel accommodation for DELAYED HOURS ONLY (${delay}h coverage) — NOT a full night stay`
      );
      result.allowedActions.push('issue_meal_voucher');
      result.allowedActions.push('issue_lounge_access');
      result.allowedActions.push('arrange_hotel_for_delayed_hours_only');
    }
  }

  // ── Universal restrictions ────────────────────────────────────────────────
  result.restrictions.push('Cannot waive fare differences above ₹1,500 without supervisor approval');
  result.restrictions.push('Refunds issued to original payment method ONLY — no exceptions');
  result.restrictions.push('Hotel (if applicable) covers delayed hours only — NOT a full night stay');
  result.restrictions.push('No upgrades (business class, etc.) as compensation — not in policy');
  result.restrictions.push('No additional compensation beyond stated policy amounts');

  return result;
}

/**
 * Checks a specific customer request against policy.
 * Returns whether it is allowed, denied, or requires escalation.
 */
function checkSpecificRequest(requestType, booking) {
  switch (requestType) {
    case 'full_night_hotel':
      if (booking.delayHours > 5) {
        return {
          allowed: false,
          requiresEscalation: false,
          message: `Policy covers hotel only for the delayed hours (${booking.delayHours}h), not a full night's stay.`,
        };
      }
      return {
        allowed: false,
        requiresEscalation: false,
        message: `Hotel accommodation requires a delay of more than 5 hours. Current delay is ${booking.delayHours} hours — only meal voucher and lounge access apply.`,
      };

    case 'business_class_upgrade':
      return {
        allowed: false,
        requiresEscalation: true,
        escalationType: 'supervisor',
        message: 'Business class upgrades are not covered under standard compensation policy.',
      };

    case 'fare_waiver_above_1500':
      return {
        allowed: false,
        requiresEscalation: true,
        escalationType: 'supervisor',
        message: 'Fare difference waiver above ₹1,500 requires supervisor approval.',
      };

    case 'legal_action_threat':
      return {
        allowed: false,
        requiresEscalation: true,
        escalationType: 'legal',
        message: 'Legal threats must be escalated to our specialist support team immediately.',
      };

    case 'formal_complaint':
      return {
        allowed: false,
        requiresEscalation: true,
        escalationType: 'complaint',
        message: 'Formal complaints must be escalated to our specialist support team.',
      };

    case 'refund_to_different_payment':
      return {
        allowed: false,
        requiresEscalation: false,
        message: 'Refunds can only be processed to the original payment method used for the booking.',
      };

    default:
      return { allowed: true, requiresEscalation: false };
  }
}

module.exports = { evaluateEntitlements, checkSpecificRequest };
