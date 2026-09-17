import React, { useState, useEffect, useRef } from 'react';
import {
  fetchCustomers,
  sendMessage,
  resetSession,
  fetchAuditLog,
} from './services/api';
import {
  Send,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ShieldAlert,
  Plane,
  Clock,
  Award,
  FileText,
  User,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

const SCENARIOS = {
  priya_nair: {
    id: 'priya_nair',
    label: 'Scenario 1 — Priya Nair',
    badge: 'Flight Cancelled',
    prompt:
      "I'm furious! My flight SK-224 to Goa was cancelled and no one told me anything! I want a full cash refund PLUS a free upgrade to business class on my return flight for the trouble.",
  },
  arvind_kulkarni: {
    id: 'arvind_kulkarni',
    label: 'Scenario 2 — Arvind Kulkarni',
    badge: 'Delayed 4h',
    prompt:
      "My flight SK-118 is delayed by 4 hours and I'm going to miss my connecting meeting in Bengaluru. Since it's such a long delay, I want you to arrange hotel accommodation for me right now.",
  },
  meher_kaur: {
    id: 'meher_kaur',
    label: 'Scenario 3 — Meher Kaur',
    badge: 'Delayed 6h + Fare Diff',
    prompt:
      "My flight SK-305 is delayed 6 hours. I want a full night's hotel stay rather than just a few hours. Also, move me to an earlier higher-fare flight instead of waiting — the fare difference is ₹2,000.",
  },
};

export default function App() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('priya_nair');
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activePolicy, setActivePolicy] = useState(null);
  const [recentEscalation, setRecentEscalation] = useState(null);
  const [actionLog, setActionLog] = useState([]);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'audit' | 'architecture'
  const [auditData, setAuditData] = useState(null);
  const [errorBanner, setErrorBanner] = useState(null);

  const messagesEndRef = useRef(null);

  // Load customers on start
  useEffect(() => {
    loadCustomers();
  }, []);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const loadCustomers = async () => {
    try {
      const data = await fetchCustomers();
      setCustomers(data);
      if (data.length > 0 && !selectedCustomerId) {
        setSelectedCustomerId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
      setErrorBanner('Backend not reached yet. Ensure the server is running on port 3001.');
    }
  };

  const currentCustomer = customers.find((c) => c.id === selectedCustomerId);
  const currentBooking = currentCustomer?.primaryBooking;

  // Select customer & reset chat state for that customer
  const handleSelectCustomer = async (id) => {
    if (id === selectedCustomerId && messages.length > 0) return;
    if (sessionId) {
      await resetSession(sessionId).catch(() => {});
    }
    setSelectedCustomerId(id);
    setSessionId(null);
    setMessages([]);
    setActivePolicy(null);
    setRecentEscalation(null);
    setErrorBanner(null);
  };

  // Load a test scenario prompt into the input
  const handleLoadScenarioPrompt = (promptText) => {
    setInputMessage(promptText);
  };

  // Reset conversation
  const handleReset = async () => {
    if (sessionId) {
      await resetSession(sessionId).catch(() => {});
    }
    setSessionId(null);
    setMessages([]);
    setRecentEscalation(null);
    setActionLog((prev) => [
      ...prev,
      {
        action: 'session_reset',
        time: new Date().toLocaleTimeString(),
        label: `Reset session for ${currentCustomer?.name}`,
      },
    ]);
  };

  // Send message
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    const text = inputMessage.trim();
    if (!text || isLoading || !selectedCustomerId) return;

    const userMsg = { role: 'user', content: text, time: new Date().toLocaleTimeString() };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);
    setErrorBanner(null);

    try {
      const data = await sendMessage(selectedCustomerId, text, sessionId);
      setSessionId(data.sessionId);
      setActivePolicy(data.policyContext);

      const agentMsg = {
        role: 'agent',
        content: data.response,
        time: new Date().toLocaleTimeString(),
        escalation: data.escalation,
      };

      setMessages((prev) => [...prev, agentMsg]);

      if (data.escalation?.required) {
        setRecentEscalation(data.escalation);
        setActionLog((prev) => [
          ...prev,
          {
            action: 'escalation_triggered',
            time: new Date().toLocaleTimeString(),
            label: `Escalated: ${data.escalation.reason} (${data.escalation.type})`,
            type: 'escalation',
          },
        ]);
      }

      if (data.detectedActions && data.detectedActions.length > 0) {
        data.detectedActions.forEach((act) => {
          setActionLog((prev) => [
            ...prev,
            {
              action: act,
              time: new Date().toLocaleTimeString(),
              label: formatActionName(act),
              type: 'action',
            },
          ]);
        });
      }
    } catch (err) {
      console.error('Send error:', err);
      setErrorBanner('Failed to generate response. Please check the backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAudit = async () => {
    try {
      const data = await fetchAuditLog();
      setAuditData(data);
      setActiveTab('audit');
    } catch (err) {
      console.error('Audit fetch error:', err);
    }
  };

  function formatActionName(act) {
    return act
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  return (
    <div className="app">
      {/* ── Top Header ────────────────────────────────────────────── */}
      <header className="header">
        <div className="header-brand">
          <div className="header-logo">
            <Plane size={20} />
          </div>
          <div>
            <div className="header-title">SkyAssist AI</div>
            <div className="header-subtitle">Airline Disruption Resolution Agent</div>
          </div>
        </div>

        <div className="header-right">
          <div className="header-date">📅 Simulation: Wed, 23 Sep 2026</div>
          <div className="header-badge">
            <span className="dot" />
            Deterministic Policy Engine Active
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="reset-btn"
              style={{
                background: activeTab === 'chat' ? 'rgba(79,142,247,0.15)' : 'transparent',
                borderColor: activeTab === 'chat' ? 'var(--accent-blue)' : 'var(--border-subtle)',
                color: activeTab === 'chat' ? 'var(--accent-blue)' : 'var(--text-secondary)',
              }}
              onClick={() => setActiveTab('chat')}
            >
              Chat Console
            </button>
            <button
              className="reset-btn"
              style={{
                background: activeTab === 'audit' ? 'rgba(79,142,247,0.15)' : 'transparent',
                borderColor: activeTab === 'audit' ? 'var(--accent-blue)' : 'var(--border-subtle)',
                color: activeTab === 'audit' ? 'var(--accent-blue)' : 'var(--text-secondary)',
              }}
              onClick={handleOpenAudit}
            >
              <FileText size={14} /> Audit Trail
            </button>
            <button
              className="reset-btn"
              style={{
                background: activeTab === 'architecture' ? 'rgba(79,142,247,0.15)' : 'transparent',
                borderColor: activeTab === 'architecture' ? 'var(--accent-blue)' : 'var(--border-subtle)',
                color: activeTab === 'architecture' ? 'var(--accent-blue)' : 'var(--text-secondary)',
              }}
              onClick={() => setActiveTab('architecture')}
            >
              Architecture
            </button>
          </div>
        </div>
      </header>

      {errorBanner && (
        <div className="error-banner">
          <AlertTriangle size={16} />
          <span>{errorBanner}</span>
        </div>
      )}

      {/* ── Main View ─────────────────────────────────────────────── */}
      {activeTab === 'chat' && (
        <div className="main-content">
          {/* ── Left Panel: Customer Disruption Selector ──────────── */}
          <aside className="panel-left">
            <div className="panel-label">Select Customer Scenario</div>

            {customers.map((c) => {
              const booking = c.primaryBooking;
              const isSelected = c.id === selectedCustomerId;
              const tierClass =
                c.loyaltyTier === 'Gold'
                  ? 'avatar-gold tier-gold'
                  : c.loyaltyTier === 'Platinum'
                  ? 'avatar-platinum tier-platinum'
                  : 'avatar-silver tier-silver';

              const statusClass =
                booking?.status === 'Cancelled'
                  ? 'status-cancelled'
                  : booking?.status === 'Delayed'
                  ? 'status-delayed'
                  : 'status-unaffected';

              return (
                <div
                  key={c.id}
                  className={`customer-card ${isSelected ? 'active' : ''}`}
                  onClick={() => handleSelectCustomer(c.id)}
                >
                  <div className="customer-card-top">
                    <div className={`customer-avatar ${tierClass.split(' ')[0]}`}>
                      {c.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div className="customer-name-group">
                      <div className="customer-name">{c.name}</div>
                      <div className="customer-ref">PNR: {c.bookingRef}</div>
                    </div>
                    <span className={`tier-badge ${tierClass.split(' ')[1]}`}>
                      {c.loyaltyTier}
                    </span>
                  </div>

                  {booking && (
                    <div className="flight-pill">
                      <div>
                        <span className="flight-pill-route">
                          {booking.route.from} → {booking.route.to}
                        </span>
                        <span className="flight-pill-num"> ({booking.flight})</span>
                      </div>
                      <span className={`status-badge ${statusClass}`}>
                        {booking.status === 'Delayed'
                          ? `+${booking.delayHours}h Delay`
                          : booking.status}
                      </span>
                    </div>
                  )}

                  {/* Scenario 1-click test button */}
                  {SCENARIOS[c.id] && (
                    <button
                      type="button"
                      style={{
                        marginTop: '10px',
                        width: '100%',
                        padding: '6px 8px',
                        background: isSelected ? 'rgba(79,142,247,0.15)' : 'rgba(255,255,255,0.03)',
                        border: '1px solid',
                        borderColor: isSelected ? 'rgba(79,142,247,0.3)' : 'var(--border-subtle)',
                        borderRadius: '6px',
                        fontSize: '11px',
                        color: isSelected ? 'var(--accent-blue)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectCustomer(c.id);
                        handleLoadScenarioPrompt(SCENARIOS[c.id].prompt);
                      }}
                    >
                      <span>⚡ Load test scenario</span>
                      <ChevronRight size={12} />
                    </button>
                  )}
                </div>
              );
            })}

            <div className="divider" />

            {/* Customer Profile & Entitlements Details */}
            {currentCustomer && (
              <div className="info-card">
                <div className="info-card-title">Customer History</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  <strong>Travel frequency:</strong> {currentCustomer.travelHistory.flightsLast12Months} flights (12m)
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <strong>Prior complaints:</strong>{' '}
                  {currentCustomer.travelHistory.priorComplaints > 0
                    ? currentCustomer.travelHistory.priorComplaintDetails
                    : 'None (Clean profile)'}
                </div>
              </div>
            )}
          </aside>

          {/* ── Center Panel: Chat Window ─────────────────────────── */}
          <main className="panel-center">
            {/* Disruption summary bar */}
            {currentCustomer && currentBooking && (
              <div
                style={{
                  padding: '10px 24px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '13px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <User size={16} color="var(--accent-blue)" />
                  <span>
                    Conversing with <strong>{currentCustomer.name}</strong> ({currentCustomer.loyaltyTier} Tier)
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>•</span>
                  <span>
                    Flight: <strong>{currentBooking.flight}</strong> ({currentBooking.route.from} → {currentBooking.route.to})
                  </span>
                  <span
                    className={`status-badge ${
                      currentBooking.status === 'Cancelled'
                        ? 'status-cancelled'
                        : currentBooking.status === 'Delayed'
                        ? 'status-delayed'
                        : 'status-unaffected'
                    }`}
                  >
                    {currentBooking.status === 'Delayed'
                      ? `Delayed ${currentBooking.delayHours}h (Rev: ${currentBooking.newDeparture})`
                      : currentBooking.status}
                  </span>
                </div>

                <button className="reset-btn" onClick={handleReset} title="Clear conversation & reset context">
                  <RotateCcw size={13} /> Reset Chat
                </button>
              </div>
            )}

            {/* Messages Area */}
            <div className="chat-area">
              {messages.length === 0 && (
                <div className="chat-empty">
                  <div className="chat-empty-icon">
                    <Sparkles />
                  </div>
                  <div className="chat-empty-title">Ready for Customer Interaction</div>
                  <div className="chat-empty-sub">
                    Select a test scenario from the left panel or type a custom inquiry below to test
                    airline disruption resolution and policy compliance.
                  </div>

                  {currentCustomer && SCENARIOS[currentCustomer.id] && (
                    <button
                      className="reset-btn"
                      style={{
                        padding: '8px 16px',
                        background: 'var(--accent-gradient)',
                        color: 'white',
                        borderColor: 'transparent',
                        fontWeight: '500',
                      }}
                      onClick={() => handleLoadScenarioPrompt(SCENARIOS[currentCustomer.id].prompt)}
                    >
                      Load {SCENARIOS[currentCustomer.id].label}
                    </button>
                  )}
                </div>
              )}

              {messages.map((msg, index) => (
                <div key={index} className={`msg-row ${msg.role}`}>
                  <div className={`msg-avatar ${msg.role === 'agent' ? 'agent-av' : 'user-av'}`}>
                    {msg.role === 'agent' ? '✈️' : currentCustomer?.name?.[0] || 'U'}
                  </div>
                  <div className="msg-body">
                    <span className="msg-sender">
                      {msg.role === 'agent' ? 'SkyAssist Resolution Agent' : currentCustomer?.name}
                    </span>
                    <div className={`msg-bubble ${msg.role}`}>{msg.content}</div>

                    {/* Escalation alert badge if LLM triggered escalation */}
                    {msg.escalation?.required && (
                      <div className="escalation-alert">
                        <ShieldAlert size={18} className="esc-icon" />
                        <div>
                          <span className="escalation-label">
                            ESCALATION ROUTED TO {msg.escalation.type?.toUpperCase()} SUPERVISOR
                          </span>
                          <span>Reason: {msg.escalation.reason}</span>
                        </div>
                      </div>
                    )}

                    <span className="msg-time">{msg.time}</span>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="typing-row">
                  <div className="msg-avatar agent-av">✈️</div>
                  <div className="typing-bubble">
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input form */}
            <div className="chat-input-area">
              <form onSubmit={handleSendMessage}>
                <div className="chat-input-wrapper">
                  <textarea
                    className="chat-textarea"
                    placeholder={`Type customer message as ${currentCustomer?.name || 'customer'}... (Shift+Enter for new line)`}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    rows={2}
                  />
                  <button
                    type="submit"
                    className="send-btn"
                    disabled={!inputMessage.trim() || isLoading}
                  >
                    <Send size={16} />
                  </button>
                </div>
                <div className="input-meta">
                  <span className="input-hint">
                    💡 All responses strictly adhere to verifiable airline policies and authorized compensation ceilings.
                  </span>
                  <span className="input-hint">Press Enter to send</span>
                </div>
              </form>
            </div>
          </main>

          {/* ── Right Panel: Deterministic Policy Inspector & Audit ─── */}
          <aside className="panel-right">
            <div className="panel-label">Policy Engine Guardrails</div>

            {activePolicy ? (
              <>
                <div className="info-card">
                  <div className="info-card-title">Authorized Entitlements</div>
                  <div className="entitlement-list">
                    {activePolicy.entitlements.map((item, idx) => (
                      <div key={idx} className="entitlement-item">
                        <CheckCircle size={14} className="entitlement-icon" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-card-title">Strict Boundaries</div>
                  <div className="entitlement-list">
                    {activePolicy.restrictions.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="restriction-item">
                        <XCircle size={14} className="restriction-icon" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="info-card">
                <div className="info-card-title">Live Policy Engine</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Send a message to evaluate deterministic entitlements for {currentCustomer?.name}.
                </div>
              </div>
            )}

            <div className="divider" />
            <div className="panel-label">Live Action & Audit Log</div>

            {actionLog.length === 0 ? (
              <div className="log-empty">
                <Clock size={24} style={{ opacity: 0.3 }} />
                <span>No actions executed yet.</span>
              </div>
            ) : (
              actionLog.map((logItem, idx) => (
                <div key={idx} className="action-item">
                  <div
                    className={`action-icon-wrap ${
                      logItem.type === 'escalation'
                        ? 'action-icon-red'
                        : logItem.action.includes('refund')
                        ? 'action-icon-green'
                        : 'action-icon-blue'
                    }`}
                  >
                    {logItem.type === 'escalation' ? (
                      <ShieldAlert size={14} />
                    ) : (
                      <CheckCircle size={14} />
                    )}
                  </div>
                  <div>
                    <div className="action-label">{logItem.label}</div>
                    <div className="action-time">{logItem.time}</div>
                  </div>
                </div>
              ))
            )}
          </aside>
        </div>
      )}

      {/* ── View 2: Complete Audit Trail View ──────────────────────── */}
      {activeTab === 'audit' && (
        <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>
              Audit Log & Compliance Trail
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
              Preserves a tamper-evident record of all conversation turns, actions performed, and supervisor escalations per assignment requirements.
            </p>

            {auditData && auditData.sessions && auditData.sessions.length > 0 ? (
              auditData.sessions.map((sess, idx) => (
                <div
                  key={sess.sessionId || idx}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '20px',
                    marginBottom: '16px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '12px',
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '15px' }}>{sess.scenarioLabel || sess.customer?.name}</strong>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Session ID: {sess.sessionId} • Started: {new Date(sess.startTime).toLocaleString()}
                      </div>
                    </div>
                    <span className="tier-badge tier-gold">{sess.customer?.tier} Tier</span>
                  </div>

                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    Messages logged: <strong>{sess.messages?.length || 0}</strong> | Actions:{' '}
                    <strong>{sess.actionsPerformed?.length || 0}</strong> | Escalations:{' '}
                    <strong>{sess.escalations?.length || 0}</strong>
                  </div>

                  {sess.escalations && sess.escalations.length > 0 && (
                    <div
                      style={{
                        background: 'var(--danger-dim)',
                        padding: '10px 14px',
                        borderRadius: '6px',
                        border: '1px solid rgba(248,113,113,0.3)',
                        fontSize: '12px',
                        color: 'var(--danger)',
                        marginTop: '10px',
                      }}
                    >
                      <strong>Escalations:</strong>
                      {sess.escalations.map((esc, eIdx) => (
                        <div key={eIdx}>
                          • [{esc.type?.toUpperCase()}] {esc.reason} ({new Date(esc.timestamp).toLocaleTimeString()})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="log-empty">
                <span>No audit sessions logged to disk yet. Converse in the chat to create sessions.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── View 3: Architecture & System Design ──────────────────── */}
      {activeTab === 'architecture' && (
        <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>
              System Architecture & Policy Engine Flow
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
              A deterministic-first agentic architecture ensuring zero hallucinated compensation while preserving empathetic customer communication.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '16px',
                marginBottom: '24px',
              }}
            >
              <div className="info-card">
                <div className="info-card-title">1. Customer & Disruption Store</div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  Stores verified customer profiles, travel history, and flight status. Disruption states
                  (Cancelled / Delayed) dictate eligible policy branches.
                </p>
              </div>

              <div className="info-card">
                <div className="info-card-title">2. Deterministic Policy Engine</div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  Evaluates hard mathematical and policy limits (e.g. delay &gt; 3h = meal + lounge, delay &gt; 5h = hotel for delayed hours only, fare diff &gt; ₹1,500 = supervisor required).
                </p>
              </div>

              <div className="info-card">
                <div className="info-card-title">3. LLM Resolution Orchestrator</div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  Combines customer context, conversation history, and policy boundaries into a system prompt. Generates empathetic, solution-oriented replies without exceeding bounds.
                </p>
              </div>

              <div className="info-card">
                <div className="info-card-title">4. Escalation Protocol</div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  Explicit token-based escalation routing for legal threats, formal complaints, and unauthorized compensation or fare waivers.
                </p>
              </div>

              <div className="info-card">
                <div className="info-card-title">5. Audit Trail & Action Logger</div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  Persists every message turn, parsed action, and supervisor handoff to JSON storage for supervisory compliance audits.
                </p>
              </div>

              <div className="info-card">
                <div className="info-card-title">6. React 18 / Vite Client</div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  Real-time interactive dashboard equipped with 1-click test scenarios for Priya Nair, Arvind Kulkarni, and Meher Kaur.
                </p>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                fontFamily: 'monospace',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                lineHeight: '1.7',
              }}
            >
              <div style={{ color: 'var(--accent-blue)', fontWeight: 'bold', marginBottom: '8px' }}>
                DATA FLOW DIAGRAM
              </div>
              [Customer Input via React UI]
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;↓
              <br />
              [Express Route /api/chat/message]
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;↓
              <br />
              [Customer & Disruption Lookup (JSON)]
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;↓
              <br />
              [Deterministic Policy Engine (JavaScript Rules)]
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;↓
              <br />
              [Gemini LLM Prompt with Injected Boundaries & Context]
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;↓
              <br />
              [Response Parsing & Escalation Detector]
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;↓
              <br />
              [Audit Logger (JSON Persistence)] → [Client Response & Real-Time UI Update]
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
