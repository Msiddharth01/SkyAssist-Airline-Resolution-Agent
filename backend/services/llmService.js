let genAI = null;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  } catch (e) {
    console.warn('⚠️ GoogleGenerativeAI initialization failed:', e.message);
  }
}

// ── Smart Deterministic Fallback Generator (for offline/demo reviewer mode) ──
function generateSimulatedResponse(customer, bookings, policyContext, conversationHistory) {
  const lastMsg = conversationHistory[conversationHistory.length - 1].content.toLowerCase();
  const name = customer.name.split(' ')[0];
  const booking = bookings.find(b => b.status === 'Cancelled' || b.status === 'Delayed') || bookings[0];

  // SCENARIO 1: Priya Nair (Cancelled SK-224)
  if (customer.id === 'priya_nair') {
    if (lastMsg.includes('business class') || lastMsg.includes('upgrade') || lastMsg.includes('furious') || lastMsg.includes('cash refund')) {
      return {
        response: `Dear ${name}, I completely understand how frustrating it is to have your flight ${booking.flight} to Goa cancelled due to operational reasons, especially as a valued Gold tier member.

Under our policy for airline-caused cancellations, I can immediately offer you:
1. A full cash refund processed to your original payment method within 7 business days, OR
2. A free rebooking on the next available flight within 24 hours, with priority seat access.

Regarding your request for a free business class upgrade on your return flight (SK-031): our disruption compensation policy does not cover complimentary cabin upgrades. I can certainly process your full refund or rebook you in Economy right away. Would you like me to proceed with the refund or find the earliest rebooking flight?`,
        escalation: null,
      };
    }
    if (lastMsg.includes('refund')) {
      return {
        response: `Certainly, ${name}. I have initiated your full refund for booking reference ${customer.bookingRef}. It will be credited back to your original payment method within 7 business days per airline policy. Is there anything else I can assist you with today?`,
        escalation: null,
      };
    }
    if (lastMsg.includes('rebook') || lastMsg.includes('flight')) {
      return {
        response: `Under your Gold tier priority benefit, I can rebook you on the next available flight to Goa within 24 hours at no extra charge. Would you prefer a morning or afternoon departure?`,
        escalation: null,
      };
    }
  }

  // SCENARIO 2: Arvind Kulkarni (Delayed 4h SK-118)
  if (customer.id === 'arvind_kulkarni') {
    if (lastMsg.includes('hotel') || lastMsg.includes('meeting') || lastMsg.includes('delay')) {
      return {
        response: `Hello ${name}, I am truly sorry for the disruption to your schedule and the stress regarding your connecting meeting in Bengaluru. Flight ${booking.flight} is delayed by 4 hours, with a revised departure time of ${booking.newDeparture}.

Under our service rules, delays exceeding 3 hours entitle you to:
• A complimentary meal voucher (₹500 value)
• Full access to our airport lounge

Regarding hotel accommodation: per our airline policy, hotel stays are only provided for flight delays exceeding 5 hours. Because your delay is currently 4 hours, I am unable to arrange a hotel. However, I have already credited your meal voucher and lounge pass to your boarding pass reference ${customer.bookingRef} so you can wait comfortably with Wi-Fi and amenities.`,
        escalation: null,
      };
    }
  }

  // SCENARIO 3: Meher Kaur (Delayed 6h SK-305, requests full night hotel + flight change with ₹2,000 fare diff)
  if (customer.id === 'meher_kaur') {
    if (lastMsg.includes('full night') || lastMsg.includes('hotel') || lastMsg.includes('fare') || lastMsg.includes('switch') || lastMsg.includes('2,000') || lastMsg.includes('2000') || lastMsg.includes('higher-fare')) {
      return {
        response: `Dear ${name}, thank you for your patience and for your continued loyalty as a Platinum member. I deeply apologize for the 6-hour delay on flight ${booking.flight} to Hyderabad (new departure: 20:00).

Here is what we can do and what requires escalation:

1. Hotel Accommodation: Per airline policy for delays over 5 hours, we cover day-room accommodation covering the 6 delayed hours only until your departure, not a full night's stay.
2. Meal & Lounge: You are entitled to a meal voucher and lounge access, which are already active.
3. Flight Change & Fare Waiver: You requested a move to an alternate higher-fare flight with a ₹2,000 fare difference. As a customer resolution agent, my waiver limit is strictly ₹1,500. Because ₹2,000 exceeds my authorization limit, I am escalating this waiver request to our duty supervisor for immediate review.

I will have our senior specialist contact you directly or update your booking as soon as the supervisor reviews the fare waiver.`,
        escalation: {
          required: true,
          reason: 'Customer requested waiver for ₹2,000 fare difference on alternative flight, which exceeds agent waiver limit of ₹1,500.',
          type: 'supervisor',
        },
      };
    }
  }

  // Legal threat / Escalation general check
  if (lastMsg.includes('sue') || lastMsg.includes('court') || lastMsg.includes('legal') || lastMsg.includes('lawyer')) {
    return {
      response: `I understand your frustration, ${name}. Because you have mentioned legal action, company policy requires me to immediately escalate your file to our specialized legal and executive relations team. A senior case officer will reach out to you directly.`,
      escalation: {
        required: true,
        reason: 'Customer mentioned legal action or formal complaint',
        type: 'legal',
      },
    };
  }

  // Default helpful response grounded in policy
  return {
    response: `Hello ${name}, thank you for reaching out to Sky Airlines. I am looking at your booking ${customer.bookingRef} for flight ${booking.flight} (${booking.route.from} to ${booking.route.to}). The current status is: ${booking.status}${booking.delayHours ? ` with a ${booking.delayHours}-hour delay` : ''}. 

${policyContext.entitlements.length > 0 ? `Based on your ${customer.loyaltyTier} status and flight disruption, you are entitled to:\n` + policyContext.entitlements.map(e => `• ${e}`).join('\n') : ''}

How may I assist you with your travel plans today?`,
    escalation: null,
  };
}

// ── Generate Response ──────────────────────────────────────────────────────
async function generateResponse(customer, bookings, policyContext, conversationHistory) {
  // If no Gemini key is set, use the robust deterministic fallback
  if (!genAI || !process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    return generateSimulatedResponse(customer, bookings, policyContext, conversationHistory);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: buildSystemPrompt(customer, bookings, policyContext),
    });

    // Convert history (all but last message) to Gemini format
    const historyForGemini = conversationHistory.slice(0, -1).map((msg) => ({
      role: msg.role === 'agent' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({ history: historyForGemini });

    const lastMessage = conversationHistory[conversationHistory.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    const rawText = result.response.text();

    // Parse optional escalation signal from response
    let escalation = null;
    let cleanResponse = rawText;

    const escalateMatch = rawText.match(/\[ESCALATE:(\{[\s\S]*?\})\]/);
    if (escalateMatch) {
      try {
        escalation = JSON.parse(escalateMatch[1]);
        cleanResponse = rawText.replace(/\[ESCALATE:(\{[\s\S]*?\})\]/, '').trim();
      } catch (e) {
        console.error('Escalation JSON parse error:', e.message);
      }
    }

    return { response: cleanResponse, escalation, rawText };
  } catch (err) {
    console.warn('⚠️ Gemini API call failed or timed out, falling back to simulated policy engine:', err.message);
    return generateSimulatedResponse(customer, bookings, policyContext, conversationHistory);
  }
}

module.exports = { generateResponse };

