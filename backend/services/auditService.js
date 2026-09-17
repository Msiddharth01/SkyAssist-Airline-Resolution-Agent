const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const AUDIT_DIR = path.join(__dirname, '../data/audit');
const AUDIT_FILE = path.join(AUDIT_DIR, 'audit_log.json');

// ── File helpers ───────────────────────────────────────────────────────────
function ensureAuditFile() {
  if (!fs.existsSync(AUDIT_DIR)) {
    fs.mkdirSync(AUDIT_DIR, { recursive: true });
  }
  if (!fs.existsSync(AUDIT_FILE)) {
    fs.writeFileSync(AUDIT_FILE, JSON.stringify({ sessions: [] }, null, 2));
  }
}

function loadLog() {
  ensureAuditFile();
  return JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf-8'));
}

function saveLog(log) {
  ensureAuditFile();
  fs.writeFileSync(AUDIT_FILE, JSON.stringify(log, null, 2));
}

// ── Public API ─────────────────────────────────────────────────────────────

/** Creates a new audit session and returns the sessionId */
function createSession(customerId, customerName, tier, scenarioLabel = '') {
  const sessionId = uuidv4();
  const log = loadLog();
  log.sessions.push({
    sessionId,
    scenarioLabel,
    startTime: new Date().toISOString(),
    endTime: null,
    status: 'active',
    customer: { id: customerId, name: customerName, tier },
    messages: [],
    actionsPerformed: [],
    escalations: [],
  });
  saveLog(log);
  return sessionId;
}

/** Logs a single message (user or agent) with optional metadata */
function logMessage(sessionId, role, content, meta = {}) {
  const log = loadLog();
  const session = log.sessions.find((s) => s.sessionId === sessionId);
  if (!session) return;

  session.messages.push({
    timestamp: new Date().toISOString(),
    role,
    content,
  });

  if (meta.actions && meta.actions.length > 0) {
    meta.actions.forEach((a) =>
      session.actionsPerformed.push({ timestamp: new Date().toISOString(), action: a })
    );
  }

  if (meta.escalation?.required) {
    session.escalations.push({
      timestamp: new Date().toISOString(),
      reason: meta.escalation.reason,
      type: meta.escalation.type,
    });
  }

  saveLog(log);
}

function closeSession(sessionId) {
  const log = loadLog();
  const session = log.sessions.find((s) => s.sessionId === sessionId);
  if (session) {
    session.status = 'closed';
    session.endTime = new Date().toISOString();
    saveLog(log);
  }
}

function getAuditLog() {
  return loadLog();
}

module.exports = { createSession, logMessage, closeSession, getAuditLog };
