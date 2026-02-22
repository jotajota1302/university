export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type CheckStatus = 'PASS' | 'FAIL' | 'WARN' | 'N/A';

export interface SecurityCheck {
  id: string;
  status: CheckStatus;
  severity: Severity;
  message: string;
  fix: string | null;
}

export interface AuditFiles {
  'SOUL.md'?: string;
  'AGENTS.md'?: string;
  'TOOLS.md'?: string;
  config?: string;
}

function isPlaceholderValue(value: string): boolean {
  const v = value.trim().toLowerCase();
  if (!v) return true;

  const placeholders = [
    'your_',
    'example',
    'dummy',
    'sample',
    'placeholder',
    'changeme',
    'replace_me',
    '<redacted>',
    '[redacted]',
    '***',
    'xxxxx',
    'token_here',
    'api_key_here',
  ];

  return placeholders.some((p) => v.includes(p));
}

// Returns N/A check when the required file is absent — no penalty applied
function naCheck(id: string, severity: Severity, requiredFile: string): SecurityCheck {
  return {
    id,
    status: 'N/A',
    severity,
    message: `Check skipped: ${requiredFile} not provided`,
    fix: null,
  };
}

export function checkSecurityIssues(files: AuditFiles): SecurityCheck[] {
  const allContent = Object.values(files).join('\n');
  const hasSoulOrAgents = !!(files['SOUL.md'] || files['AGENTS.md']);
  const soulAndAgents = [files['SOUL.md'] || '', files['AGENTS.md'] || ''].join('\n');
  const configContent = files.config || '';
  const hasConfig = !!files.config;

  return [
    checkSec01(allContent),
    hasConfig ? checkSec02(configContent) : naCheck('SEC-02', 'HIGH', 'config'),
    hasConfig ? checkSec03(configContent) : naCheck('SEC-03', 'HIGH', 'config'),
    hasSoulOrAgents ? checkSec04(soulAndAgents) : naCheck('SEC-04', 'HIGH', 'SOUL.md / AGENTS.md'),
    checkSec05(allContent),
    checkSec06(allContent),
    checkSec07(allContent),
    hasConfig ? checkSec08(configContent) : naCheck('SEC-08', 'LOW', 'config'),
    checkEth01(allContent),
    hasConfig ? checkTool01(configContent) : naCheck('TOOL-01', 'MEDIUM', 'config'),
    checkFile01(allContent),
    hasConfig ? checkNet01(configContent) : naCheck('NET-01', 'HIGH', 'config'),
    hasConfig ? checkMsg01(configContent) : naCheck('MSG-01', 'MEDIUM', 'config'),
    checkEth02(allContent),
    checkConsent01(allContent),
    checkPriv01(allContent),
  ];
}

// SEC-01 CRITICAL: Detect API keys/tokens in plaintext
// Patterns built via RegExp constructor to avoid triggering secret-scan hooks on source code
function checkSec01(content: string): SecurityCheck {
  const lines = content.split('\n');

  const directSecretPatterns = [
    new RegExp('ghp' + '_' + '[a-zA-Z0-9]{36}'),
    new RegExp('sk-[a-zA-Z0-9]{32,}'),
    new RegExp('AKIA' + '[0-9A-Z]{16}'),
  ];

  for (const line of lines) {
    const trimmed = line.trim();

    // Avoid obvious docs/examples text
    if (/\b(example|dummy|sample|placeholder)\b/i.test(trimmed)) continue;

    for (const pattern of directSecretPatterns) {
      if (pattern.test(trimmed)) {
        return {
          id: 'SEC-01',
          status: 'FAIL',
          severity: 'CRITICAL',
          message: 'API key or token detected in plaintext within agent files',
          fix: 'Remove all hardcoded API keys and tokens. Use environment variables or a secrets manager instead.',
        };
      }
    }

    const bearerMatch = trimmed.match(/Bearer\s+(.{20,})/i);
    if (bearerMatch && !isPlaceholderValue(bearerMatch[1])) {
      return {
        id: 'SEC-01',
        status: 'FAIL',
        severity: 'CRITICAL',
        message: 'Bearer token detected in plaintext within agent files',
        fix: 'Never store bearer tokens in files. Use environment variables or runtime vault retrieval.',
      };
    }

    const assignmentMatch = trimmed.match(/\b(token|api[_-]?key|secret)\b\s*[:=]\s*["']?([^"'\s]{10,})/i);
    if (assignmentMatch && !isPlaceholderValue(assignmentMatch[2])) {
      return {
        id: 'SEC-01',
        status: 'FAIL',
        severity: 'CRITICAL',
        message: 'Token/API key assignment detected in plaintext within agent files',
        fix: 'Remove inline token/API key assignments. Load secrets from environment variables.',
      };
    }
  }

  return {
    id: 'SEC-01',
    status: 'PASS',
    severity: 'CRITICAL',
    message: 'No API keys or tokens detected in plaintext',
    fix: null,
  };
}

// SEC-02 HIGH: Verify dmPolicy is configured
function checkSec02(config: string): SecurityCheck {
  const hasDmPolicy = /dmPolicy/i.test(config);

  if (!hasDmPolicy) {
    return {
      id: 'SEC-02',
      status: 'FAIL',
      severity: 'HIGH',
      message: 'dmPolicy is not configured in the agent config',
      fix: 'Add a dmPolicy configuration to restrict direct message handling and define allowed communication patterns.',
    };
  }

  return {
    id: 'SEC-02',
    status: 'PASS',
    severity: 'HIGH',
    message: 'dmPolicy is configured',
    fix: null,
  };
}

// SEC-03 HIGH: Verify allowFrom is configured
function checkSec03(config: string): SecurityCheck {
  const hasAllowFrom = /allowFrom/i.test(config);

  if (!hasAllowFrom) {
    return {
      id: 'SEC-03',
      status: 'FAIL',
      severity: 'HIGH',
      message: 'allowFrom is not configured in the agent config',
      fix: 'Add an allowFrom configuration to whitelist trusted sources and prevent unauthorized access.',
    };
  }

  return {
    id: 'SEC-03',
    status: 'PASS',
    severity: 'HIGH',
    message: 'allowFrom is configured',
    fix: null,
  };
}

// SEC-04 HIGH: Detect passwords/credentials in SOUL/AGENTS
function checkSec04(soulAndAgents: string): SecurityCheck {
  const lines = soulAndAgents.split('\n');
  let hasCredentialMentions = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (/\b(password|passwd|secret|credential|api[_-]?key|token)\b/i.test(line)) {
      hasCredentialMentions = true;
    }

    // Documentation/policy text should not be flagged unless there is an explicit value assignment.
    const assignment = line.match(/\b(password|passwd|secret|credential|api[_-]?key|token)\b\s*[:=]\s*["']?([^"'\s]{6,})/i);
    if (!assignment) continue;

    const value = assignment[2];
    if (isPlaceholderValue(value)) continue;

    return {
      id: 'SEC-04',
      status: 'FAIL',
      severity: 'HIGH',
      message: 'Sensitive credential assignment detected in SOUL.md or AGENTS.md',
      fix: 'Remove hardcoded credentials from SOUL/AGENTS. Keep only policy-level instructions without secret values.',
    };
  }

  if (hasCredentialMentions) {
    return {
      id: 'SEC-04',
      status: 'WARN',
      severity: 'HIGH',
      message: 'Credential-related terms found in SOUL/AGENTS, but no hardcoded secret value detected',
      fix: 'Review wording to keep policy guidance explicit (e.g., use env vars) and avoid ambiguous credential handling text.',
    };
  }

  return {
    id: 'SEC-04',
    status: 'PASS',
    severity: 'HIGH',
    message: 'No hardcoded credential assignments detected in agent definition files',
    fix: null,
  };
}

// SEC-05 HIGH: Detect destructive commands
function checkSec05(content: string): SecurityCheck {
  const patterns = [
    /rm\s+-rf/i,
    /DROP\s+TABLE/i,
    /format\s+c:/i,
    /mkfs/i,
  ];

  for (const pattern of patterns) {
    if (pattern.test(content)) {
      return {
        id: 'SEC-05',
        status: 'FAIL',
        severity: 'HIGH',
        message: 'Destructive command detected in agent files',
        fix: 'Remove all destructive commands (rm -rf, DROP TABLE, format, mkfs) from agent configuration.',
      };
    }
  }

  return {
    id: 'SEC-05',
    status: 'PASS',
    severity: 'HIGH',
    message: 'No destructive commands detected',
    fix: null,
  };
}

// SEC-06 MEDIUM: Check if memory files could contain personal data
function checkSec06(content: string): SecurityCheck {
  const lines = content.split('\n');
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const phonePattern = /(?:\+\d{1,3}[\s.-]?)?(?:\d[\s.-]?){9,14}\d/;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Reduce false positives: require PII context labels or contact intent.
    const hasPiiContext = /\b(contact|email|mail|phone|tel|whatsapp|telegram|dni|address|customer|client)\b/i.test(line);
    if (!hasPiiContext) continue;

    if (emailPattern.test(line) || phonePattern.test(line)) {
      return {
        id: 'SEC-06',
        status: 'FAIL',
        severity: 'MEDIUM',
        message: 'Potential personal data (email or phone number) detected in agent files',
        fix: 'Remove personal data from agent files. Use anonymized identifiers instead of real contact information.',
      };
    }
  }

  return {
    id: 'SEC-06',
    status: 'PASS',
    severity: 'MEDIUM',
    message: 'No personal data patterns detected in agent files',
    fix: null,
  };
}

// SEC-07 MEDIUM: Detect data exfiltration instructions
// Requires an explicit external target (URL or email) within 60 chars of an exfiltration verb
// This avoids false positives on normal instructions like "send a reply" or "manda a Pilar"
function checkSec07(content: string): SecurityCheck {
  // Pattern 1: exfiltration verb near an external URL (http/https, not localhost)
  const urlPattern = /(?:send|upload|export|subir|enviar|POST|PUT)\b.{0,60}https?:\/\/(?!localhost|127\.0\.0\.1)/i;

  // Pattern 2: exfiltration verb near an email address
  const emailPattern = /(?:send|email|mail|forward|enviar|reenviar)\b.{0,60}[\w.+-]+@[\w.-]+\.[a-z]{2,}/i;

  // Pattern 3: raw HTTP call to external host (API call pattern)
  const httpCallPattern = /(?:POST|PUT|PATCH)\s+https?:\/\/(?!localhost|127\.0\.0\.1)/i;

  if (urlPattern.test(content) || emailPattern.test(content) || httpCallPattern.test(content)) {
    return {
      id: 'SEC-07',
      status: 'FAIL',
      severity: 'MEDIUM',
      message: 'Potential data exfiltration instruction detected (external URL or email target found)',
      fix: 'Review instructions that direct the agent to send or upload data to external endpoints.',
    };
  }

  return {
    id: 'SEC-07',
    status: 'PASS',
    severity: 'MEDIUM',
    message: 'No data exfiltration patterns detected',
    fix: null,
  };
}

// SEC-08 LOW: Verify session isolation configured
function checkSec08(config: string): SecurityCheck {
  const hasSessionConfig = /sessionId|session_id|session\s*:\s*|dmScope|dm_scope/i.test(config);

  if (!hasSessionConfig) {
    return {
      id: 'SEC-08',
      status: 'FAIL',
      severity: 'LOW',
      message: 'Session isolation configuration not found in config',
      fix: 'Add sessionId or session_id configuration to ensure proper session isolation between agent interactions.',
    };
  }

  return {
    id: 'SEC-08',
    status: 'PASS',
    severity: 'LOW',
    message: 'Session isolation is configured',
    fix: null,
  };
}

// ETH-01 MEDIUM: risky external actions should require explicit user confirmation language
function checkEth01(content: string): SecurityCheck {
  const mentionsExternalAction = /\b(send|email|forward|publish|post|upload|share|transfer|enviar|reenviar|publicar|subir|compartir)\b/i.test(content);
  const mentionsExternalTarget = /https?:\/\/(?!localhost|127\.0\.0\.1)|[\w.+-]+@[\w.-]+\.[a-z]{2,}|\bthird[- ]party\b|\bexternal\b|\bwebhook\b/i.test(content);
  const hasConfirmationGuard = /\b(explicit (user )?confirmation|ask (the )?user first|with user approval|only when user explicitly asks|confirm before sending|pedir confirmaci[oó]n|solo si el usuario lo pide expl[ií]citamente)\b/i.test(content);

  if (mentionsExternalAction && mentionsExternalTarget && !hasConfirmationGuard) {
    return {
      id: 'ETH-01',
      status: 'WARN',
      severity: 'MEDIUM',
      message: 'External action with external target detected without explicit confirmation policy',
      fix: 'Add a policy rule requiring explicit user confirmation before sending/sharing/uploading data externally.',
    };
  }

  return {
    id: 'ETH-01',
    status: 'PASS',
    severity: 'MEDIUM',
    message: 'External actions appear guarded by explicit user-confirmation policy or no external target detected',
    fix: null,
  };
}

// TOOL-01 MEDIUM: risky tools should be accompanied by restrictions/guardrails
function checkTool01(config: string): SecurityCheck {
  const configLc = config.toLowerCase();
  const riskyToolMentions = /(\bexec\b|\bgateway\b|\bbrowser\b|\bmessage\b|\bnodes\.run\b|\bshell\b)/i.test(config);
  const toolsExplicitlyEnabled = /enabled\s*:\s*true|allow\s*:\s*\[|tools\s*:\s*\[/i.test(config);
  const hasGuardrails = /\b(deny|allowlist|allowed|restricted|ratelimit|approval|confirm|dmpolicy|allowfrom|maxattempts|lockout)\b/i.test(configLc);

  if (riskyToolMentions && toolsExplicitlyEnabled && !hasGuardrails) {
    return {
      id: 'TOOL-01',
      status: 'WARN',
      severity: 'MEDIUM',
      message: 'Potentially risky tool access detected without clear guardrails in config',
      fix: 'Define allowlists/restrictions/rate-limits/approval for high-risk tools (exec, message, gateway, browser).',
    };
  }

  return {
    id: 'TOOL-01',
    status: 'PASS',
    severity: 'MEDIUM',
    message: 'Tool access appears constrained by guardrails or no risky tools explicitly exposed',
    fix: null,
  };
}

// FILE-01 HIGH: broad access to sensitive paths should be guarded
function checkFile01(content: string): SecurityCheck {
  const sensitivePathMention = /(\/etc\/|\.ssh|id_rsa|id_ed25519|keychain|passwords?\.csv|\.env\b|secrets?\b|credentials?\b)/i.test(content);
  const broadReadWrite = /(read|write|copy|upload|scan|index|sync)\b.{0,50}(entire|whole|all|recursive|home|~\/|\/users\/)/i.test(content);

  if (sensitivePathMention && broadReadWrite) {
    return {
      id: 'FILE-01',
      status: 'FAIL',
      severity: 'HIGH',
      message: 'Potential broad file access over sensitive paths detected',
      fix: 'Restrict file operations to explicit workspace paths and block sensitive directories (.ssh, keychains, system paths).',
    };
  }

  return {
    id: 'FILE-01',
    status: 'PASS',
    severity: 'HIGH',
    message: 'No broad unsafe file-access patterns detected',
    fix: null,
  };
}

// NET-01 HIGH: network exposure requires auth + allowlist/rate-limit signals
function checkNet01(config: string): SecurityCheck {
  const exposedBind = /bind\s*:\s*("|')?(0\.0\.0\.0|lan)/i.test(config);
  const hasAuthToken = /auth\s*:\s*|token\s*:\s*/i.test(config);
  const hasRateLimit = /rateLimit|maxAttempts|lockout|windowMs/i.test(config);
  const hasAllowlist = /allowFrom|allowlist|dmPolicy\s*:\s*allowlist/i.test(config);

  if (exposedBind && (!hasAuthToken || !hasRateLimit || !hasAllowlist)) {
    return {
      id: 'NET-01',
      status: 'FAIL',
      severity: 'HIGH',
      message: 'Gateway/network appears exposed without complete protection controls',
      fix: 'For LAN/0.0.0.0 binds, enforce token auth, rate limiting, and allowlist-based access policies.',
    };
  }

  return {
    id: 'NET-01',
    status: 'PASS',
    severity: 'HIGH',
    message: 'Network exposure controls appear adequately configured',
    fix: null,
  };
}

// MSG-01 MEDIUM: outbound messaging/email should have explicit policy boundaries
function checkMsg01(config: string): SecurityCheck {
  const hasOutboundChannels = /channels\s*:\s*|whatsapp|telegram|discord|email|smtp|himalaya|message/i.test(config);
  const hasPolicyBoundary = /allowFrom|allowlist|dmPolicy|explicit|confirm|consent|only when user/i.test(config);

  if (hasOutboundChannels && !hasPolicyBoundary) {
    return {
      id: 'MSG-01',
      status: 'WARN',
      severity: 'MEDIUM',
      message: 'Outbound messaging channels detected without explicit policy boundaries',
      fix: 'Define who can trigger outbound messages and require explicit user confirmation for contact-facing actions.',
    };
  }

  return {
    id: 'MSG-01',
    status: 'PASS',
    severity: 'MEDIUM',
    message: 'Outbound messaging appears constrained by policy boundaries',
    fix: null,
  };
}

// ETH-02 HIGH: irreversible/destructive actions should require explicit confirmation
function checkEth02(content: string): SecurityCheck {
  const irreversibleAction = /\b(delete|erase|destroy|drop table|format|wipe|reset database|borrar|eliminar|destruir)\b/i.test(content);
  const hasGuard = /\b(confirm|confirmation|explicit approval|ask user first|double-check|requiere confirmaci[oó]n|solo con confirmaci[oó]n)\b/i.test(content);

  if (irreversibleAction && !hasGuard) {
    return {
      id: 'ETH-02',
      status: 'FAIL',
      severity: 'HIGH',
      message: 'Irreversible action patterns detected without explicit confirmation guard',
      fix: 'Require explicit user confirmation before any irreversible/destructive action.',
    };
  }

  return {
    id: 'ETH-02',
    status: 'PASS',
    severity: 'HIGH',
    message: 'Irreversible actions appear guarded or not present',
    fix: null,
  };
}

// CONSENT-01 MEDIUM: external-data handling should mention consent/authorization intent
function checkConsent01(content: string): SecurityCheck {
  const externalDataFlow = /\b(share|send|upload|forward|publish|third[- ]party|vendor|api endpoint|webhook|enviar|compartir|subir)\b/i.test(content);
  const hasConsentSignals = /\b(consent|authorization|authori[sz]ation|approved by user|user approved|gdpr|legal basis|consentimiento|autorizaci[oó]n)\b/i.test(content);

  if (externalDataFlow && !hasConsentSignals) {
    return {
      id: 'CONSENT-01',
      status: 'WARN',
      severity: 'MEDIUM',
      message: 'External data-flow instructions detected without explicit consent/authorization language',
      fix: 'Add explicit consent/authorization requirements for external data sharing and transfers.',
    };
  }

  return {
    id: 'CONSENT-01',
    status: 'PASS',
    severity: 'MEDIUM',
    message: 'Consent/authorization language appears present or no external data flow detected',
    fix: null,
  };
}

// PRIV-01 MEDIUM: detect long-term retention/full transcript storage risks
function checkPriv01(content: string): SecurityCheck {
  const storesEverything = /\b(store|save|retain|archive|log)\b.{0,50}\b(all messages|full transcript|everything|all data|entire history)\b/i.test(content);
  const hasRetentionBound = /\b(ttl|retention|expire|delete after|anonymi[sz]e|minimi[sz]e|30 days|7 days|retenci[oó]n|caduca)\b/i.test(content);

  if (storesEverything && !hasRetentionBound) {
    return {
      id: 'PRIV-01',
      status: 'WARN',
      severity: 'MEDIUM',
      message: 'Broad retention pattern detected without minimization/retention limits',
      fix: 'Define retention limits (TTL), minimization, and anonymization policies for stored transcripts/data.',
    };
  }

  return {
    id: 'PRIV-01',
    status: 'PASS',
    severity: 'MEDIUM',
    message: 'No broad retention risk detected or retention limits are defined',
    fix: null,
  };
}
