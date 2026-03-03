export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type CheckStatus = 'PASS' | 'FAIL' | 'N/A';

export interface GdprCheck {
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
  memory?: string;
}

function naCheck(id: string, severity: Severity, requiredFile: string): GdprCheck {
  return {
    id,
    status: 'N/A',
    severity,
    message: `Check skipped: ${requiredFile} not provided`,
    fix: null,
  };
}

export function checkGdprIssues(files: AuditFiles): GdprCheck[] {
  const allContent = Object.values(files).join('\n');
  const memoryContent = files.memory || '';
  const hasMemory = !!files.memory;

  return [
    hasMemory ? checkGdpr01(memoryContent) : naCheck('GDPR-01', 'CRITICAL', 'memory'),
    hasMemory ? checkGdpr02(memoryContent) : naCheck('GDPR-02', 'CRITICAL', 'memory'),
    checkGdpr03(allContent),
    checkGdpr04(allContent),
    checkGdpr05(allContent),
    checkGdpr06(allContent),
    checkGdpr07(allContent),
    checkGdpr08(allContent),
  ];
}

// GDPR-01 CRITICAL: Personal data without retention policy in memory
function checkGdpr01(memory: string): GdprCheck {
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const phonePattern = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;

  const hasPersonalData = emailPattern.test(memory) || phonePattern.test(memory);
  const hasRetentionPolicy = /retenci[oó]n|retention|data.?retention|ttl|expir/i.test(memory);

  if (hasPersonalData && !hasRetentionPolicy) {
    return {
      id: 'GDPR-01',
      status: 'FAIL',
      severity: 'CRITICAL',
      message: 'Personal data found in memory without a data retention policy',
      fix: 'Add a data retention policy specifying how long personal data is kept and when it is deleted.',
    };
  }

  return {
    id: 'GDPR-01',
    status: 'PASS',
    severity: 'CRITICAL',
    message: 'No personal data without retention policy detected in memory',
    fix: null,
  };
}

// GDPR-02 CRITICAL: Personal data (emails, phones, DNI) in memory files
function checkGdpr02(memory: string): GdprCheck {
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const phonePattern = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const dniPattern = /\b\d{8}[A-Z]\b/;

  if (emailPattern.test(memory) || phonePattern.test(memory) || dniPattern.test(memory)) {
    return {
      id: 'GDPR-02',
      status: 'FAIL',
      severity: 'CRITICAL',
      message: 'Personal data (email, phone, or DNI) detected in memory files',
      fix: 'Remove all personal data from memory files. Use anonymized identifiers instead.',
    };
  }

  return {
    id: 'GDPR-02',
    status: 'PASS',
    severity: 'CRITICAL',
    message: 'No personal data detected in memory files',
    fix: null,
  };
}

// GDPR-03 HIGH: Mentions of transferring data to third parties without consent
function checkGdpr03(content: string): GdprCheck {
  const transferPatterns = [
    /(?:share|transfer|send|provide)\b.{0,40}(?:third.?part|external|partner|vendor|proveedor|tercero)/i,
    /(?:third.?part|external|partner|vendor|proveedor|tercero).{0,40}(?:share|transfer|send|provide|access)/i,
  ];
  const consentPatterns = /consent|consentimiento|permission|permiso|authorize|autoriza/i;

  for (const pattern of transferPatterns) {
    if (pattern.test(content) && !consentPatterns.test(content)) {
      return {
        id: 'GDPR-03',
        status: 'FAIL',
        severity: 'HIGH',
        message: 'Data transfer to third parties mentioned without consent reference',
        fix: 'Add explicit user consent requirements before any data sharing with third parties.',
      };
    }
  }

  return {
    id: 'GDPR-03',
    status: 'PASS',
    severity: 'HIGH',
    message: 'No unconsented third-party data transfers detected',
    fix: null,
  };
}

// GDPR-04 HIGH: Logs with full conversations
function checkGdpr04(content: string): GdprCheck {
  const logPatterns = [
    /\btranscript\b/i,
    /\bfull_history\b/i,
    /\bsave_all_messages\b/i,
    /\blog_conversations?\b/i,
    /\bstore_all_chat\b/i,
  ];

  for (const pattern of logPatterns) {
    if (pattern.test(content)) {
      return {
        id: 'GDPR-04',
        status: 'FAIL',
        severity: 'HIGH',
        message: 'Full conversation logging detected — may violate data minimization principle',
        fix: 'Avoid logging full conversations. Log only necessary metadata and anonymized summaries.',
      };
    }
  }

  return {
    id: 'GDPR-04',
    status: 'PASS',
    severity: 'HIGH',
    message: 'No full conversation logging patterns detected',
    fix: null,
  };
}

// GDPR-05 HIGH: End-user passwords or credentials in files
function checkGdpr05(content: string): GdprCheck {
  const patterns = [
    /user_password\s*[:=]/i,
    /user_credential\s*[:=]/i,
    /\bplaintext_password\b/i,
    /\bstore.{0,20}password\b/i,
    /\bguardar.{0,20}contraseña\b/i,
  ];

  for (const pattern of patterns) {
    if (pattern.test(content)) {
      return {
        id: 'GDPR-05',
        status: 'FAIL',
        severity: 'HIGH',
        message: 'End-user passwords or credentials found in agent files',
        fix: 'Never store end-user passwords in agent files. Use secure authentication providers and hashed storage.',
      };
    }
  }

  return {
    id: 'GDPR-05',
    status: 'PASS',
    severity: 'HIGH',
    message: 'No end-user passwords or credentials detected in files',
    fix: null,
  };
}

// GDPR-06 MEDIUM: Missing privacy policy or legal notice
function checkGdpr06(content: string): GdprCheck {
  const privacyPatterns = /privacy.?policy|pol[ií]tica.?de.?privacidad|aviso.?legal|legal.?notice|data.?protection|protecci[oó]n.?de.?datos/i;

  if (!privacyPatterns.test(content)) {
    return {
      id: 'GDPR-06',
      status: 'FAIL',
      severity: 'MEDIUM',
      message: 'No reference to a privacy policy or legal notice found',
      fix: 'Add a reference to a privacy policy or legal notice in the agent configuration.',
    };
  }

  return {
    id: 'GDPR-06',
    status: 'PASS',
    severity: 'MEDIUM',
    message: 'Privacy policy or legal notice reference found',
    fix: null,
  };
}

// GDPR-07 MEDIUM: Mentions of accessing data from minors
function checkGdpr07(content: string): GdprCheck {
  const minorPatterns = /\bmenor(?:es)?\b|\bchild(?:ren)?\b|\bunder.?(?:13|14|16|18)\b|\bminor\b|\bniño\b|\badolescent/i;

  if (minorPatterns.test(content)) {
    return {
      id: 'GDPR-07',
      status: 'FAIL',
      severity: 'MEDIUM',
      message: 'References to minors or children data detected — requires special GDPR protections',
      fix: 'Implement age verification and parental consent mechanisms. Apply enhanced data protection for minors.',
    };
  }

  return {
    id: 'GDPR-07',
    status: 'PASS',
    severity: 'MEDIUM',
    message: 'No references to minor data access detected',
    fix: null,
  };
}

// GDPR-08 LOW: Missing documented legal basis
function checkGdpr08(content: string): GdprCheck {
  const legalBasisPatterns = /legal.?basis|base.?legal|legitimate.?interest|inter[eé]s.?leg[ií]timo|consent.?basis|contractual.?obligation|obligaci[oó]n.?contractual/i;

  if (!legalBasisPatterns.test(content)) {
    return {
      id: 'GDPR-08',
      status: 'FAIL',
      severity: 'LOW',
      message: 'No documented legal basis for data processing found',
      fix: 'Document the legal basis for data processing (consent, legitimate interest, contractual obligation, etc.).',
    };
  }

  return {
    id: 'GDPR-08',
    status: 'PASS',
    severity: 'LOW',
    message: 'Legal basis for data processing is documented',
    fix: null,
  };
}
