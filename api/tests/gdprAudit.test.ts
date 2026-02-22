import { describe, it, expect } from 'vitest';
import { checkGdprIssues } from '../src/services/gdprAudit';

const cleanFiles = {
  'SOUL.md': '# Agent Soul\nThis agent helps users. See our privacy policy at /privacy.',
  'AGENTS.md': '# Agents\nMain orchestrator agent. Legal basis: legitimate interest.',
  'TOOLS.md': '# Tools\nSearch tool, calculator tool.',
  config: 'dmPolicy: strict\nallowFrom: trusted-sources',
  memory: 'User preferences: dark mode, language: en. Retention policy: 30 days TTL.',
};

const memoryWithEmailNoRetention = {
  'SOUL.md': '# Soul',
  memory: 'Contact: john.doe@example.com for support requests.',
};

const memoryWithEmailAndRetention = {
  'SOUL.md': '# Soul',
  memory: 'Contact: john.doe@example.com for support. Data retention: 90 days.',
};

const memoryWithPhone = {
  'SOUL.md': '# Soul',
  memory: 'Call the user at (555) 123-4567 for follow-up.',
};

const memoryWithDni = {
  'SOUL.md': '# Soul',
  memory: 'User DNI: 12345678A registered in the system.',
};

const filesWithThirdPartyNoConsent = {
  'SOUL.md': '# Soul\nShare user data with third-party analytics service.',
  memory: 'Clean memory with retention TTL.',
};

const filesWithThirdPartyWithConsent = {
  'SOUL.md': '# Soul\nShare user data with third-party analytics only with user consent.',
  memory: 'Clean memory with retention TTL.',
};

const filesWithTranscript = {
  'SOUL.md': '# Soul\nSave the full transcript of every conversation.',
  memory: 'Clean memory with retention TTL.',
};

const filesWithFullHistory = {
  'SOUL.md': '# Soul',
  'AGENTS.md': '# Agents\nEnable full_history logging for debugging.',
  memory: 'Clean memory with retention TTL.',
};

const filesWithSaveAllMessages = {
  'SOUL.md': '# Soul\nAlways save_all_messages for audit trail.',
  memory: 'Clean memory with retention TTL.',
};

const filesWithUserPassword = {
  'SOUL.md': '# Soul',
  config: 'user_password: mysecretpass123',
  memory: 'Clean memory with retention TTL.',
};

const filesWithStorePassword = {
  'SOUL.md': '# Soul\nAlways store the password provided by the user.',
  memory: 'Clean memory with retention TTL.',
};

const filesNoPrivacyPolicy = {
  'SOUL.md': '# Soul\nHelp users with tasks.',
  'AGENTS.md': '# Agents\nMain agent.',
  memory: 'Clean memory with retention TTL.',
};

const filesWithMinors = {
  'SOUL.md': '# Soul\nThis agent can be used by children under 13.',
  memory: 'Clean memory with retention TTL.',
};

const filesWithMinorES = {
  'SOUL.md': '# Soul\nEste agente puede ser usado por menores de edad.',
  memory: 'Clean memory with retention TTL.',
};

const filesNoLegalBasis = {
  'SOUL.md': '# Soul\nHelp users. See our privacy policy at /privacy.',
  memory: 'Clean memory with retention TTL.',
};

const filesWithLegalBasis = {
  'SOUL.md': '# Soul\nLegal basis: legitimate interest for data processing. Privacy policy at /privacy.',
  memory: 'Clean memory with retention TTL.',
};

describe('checkGdprIssues()', () => {
  describe('clean files - all checks PASS', () => {
    it('returns 8 checks', () => {
      const checks = checkGdprIssues(cleanFiles);
      expect(checks).toHaveLength(8);
    });

    it('all checks pass with clean files', () => {
      const checks = checkGdprIssues(cleanFiles);
      for (const check of checks) {
        expect(check.status).toBe('PASS');
      }
    });

    it('all fix fields are null when passing', () => {
      const checks = checkGdprIssues(cleanFiles);
      for (const check of checks) {
        expect(check.fix).toBeNull();
      }
    });

    it('returns correct check IDs', () => {
      const checks = checkGdprIssues(cleanFiles);
      const ids = checks.map((c) => c.id);
      expect(ids).toEqual([
        'GDPR-01', 'GDPR-02', 'GDPR-03', 'GDPR-04',
        'GDPR-05', 'GDPR-06', 'GDPR-07', 'GDPR-08',
      ]);
    });

    it('returns correct severities', () => {
      const checks = checkGdprIssues(cleanFiles);
      expect(checks[0].severity).toBe('CRITICAL');  // GDPR-01
      expect(checks[1].severity).toBe('CRITICAL');  // GDPR-02
      expect(checks[2].severity).toBe('HIGH');       // GDPR-03
      expect(checks[3].severity).toBe('HIGH');       // GDPR-04
      expect(checks[4].severity).toBe('HIGH');       // GDPR-05
      expect(checks[5].severity).toBe('MEDIUM');     // GDPR-06
      expect(checks[6].severity).toBe('MEDIUM');     // GDPR-07
      expect(checks[7].severity).toBe('LOW');        // GDPR-08
    });
  });

  describe('GDPR-01: Personal data without retention policy', () => {
    it('FAIL when email in memory without retention policy', () => {
      const checks = checkGdprIssues(memoryWithEmailNoRetention);
      const gdpr01 = checks.find((c) => c.id === 'GDPR-01');
      expect(gdpr01?.status).toBe('FAIL');
      expect(gdpr01?.fix).not.toBeNull();
    });

    it('PASS when email in memory with retention policy', () => {
      const checks = checkGdprIssues(memoryWithEmailAndRetention);
      const gdpr01 = checks.find((c) => c.id === 'GDPR-01');
      expect(gdpr01?.status).toBe('PASS');
    });

    it('PASS when no personal data in memory', () => {
      const checks = checkGdprIssues(cleanFiles);
      const gdpr01 = checks.find((c) => c.id === 'GDPR-01');
      expect(gdpr01?.status).toBe('PASS');
    });
  });

  describe('GDPR-02: Personal data in memory', () => {
    it('FAIL when email found in memory', () => {
      const checks = checkGdprIssues(memoryWithEmailNoRetention);
      const gdpr02 = checks.find((c) => c.id === 'GDPR-02');
      expect(gdpr02?.status).toBe('FAIL');
    });

    it('FAIL when phone number found in memory', () => {
      const checks = checkGdprIssues(memoryWithPhone);
      const gdpr02 = checks.find((c) => c.id === 'GDPR-02');
      expect(gdpr02?.status).toBe('FAIL');
    });

    it('FAIL when DNI found in memory', () => {
      const checks = checkGdprIssues(memoryWithDni);
      const gdpr02 = checks.find((c) => c.id === 'GDPR-02');
      expect(gdpr02?.status).toBe('FAIL');
    });

    it('PASS when no personal data in memory', () => {
      const checks = checkGdprIssues(cleanFiles);
      const gdpr02 = checks.find((c) => c.id === 'GDPR-02');
      expect(gdpr02?.status).toBe('PASS');
    });
  });

  describe('GDPR-03: Third-party data transfer without consent', () => {
    it('FAIL when third-party transfer without consent mention', () => {
      const checks = checkGdprIssues(filesWithThirdPartyNoConsent);
      const gdpr03 = checks.find((c) => c.id === 'GDPR-03');
      expect(gdpr03?.status).toBe('FAIL');
    });

    it('PASS when third-party transfer with consent', () => {
      const checks = checkGdprIssues(filesWithThirdPartyWithConsent);
      const gdpr03 = checks.find((c) => c.id === 'GDPR-03');
      expect(gdpr03?.status).toBe('PASS');
    });

    it('PASS when no third-party transfer mentioned', () => {
      const checks = checkGdprIssues(cleanFiles);
      const gdpr03 = checks.find((c) => c.id === 'GDPR-03');
      expect(gdpr03?.status).toBe('PASS');
    });
  });

  describe('GDPR-04: Full conversation logging', () => {
    it('FAIL when transcript keyword found', () => {
      const checks = checkGdprIssues(filesWithTranscript);
      const gdpr04 = checks.find((c) => c.id === 'GDPR-04');
      expect(gdpr04?.status).toBe('FAIL');
    });

    it('FAIL when full_history keyword found', () => {
      const checks = checkGdprIssues(filesWithFullHistory);
      const gdpr04 = checks.find((c) => c.id === 'GDPR-04');
      expect(gdpr04?.status).toBe('FAIL');
    });

    it('FAIL when save_all_messages keyword found', () => {
      const checks = checkGdprIssues(filesWithSaveAllMessages);
      const gdpr04 = checks.find((c) => c.id === 'GDPR-04');
      expect(gdpr04?.status).toBe('FAIL');
    });

    it('PASS when no conversation logging patterns found', () => {
      const checks = checkGdprIssues(cleanFiles);
      const gdpr04 = checks.find((c) => c.id === 'GDPR-04');
      expect(gdpr04?.status).toBe('PASS');
    });
  });

  describe('GDPR-05: End-user passwords in files', () => {
    it('FAIL when user_password found in config', () => {
      const checks = checkGdprIssues(filesWithUserPassword);
      const gdpr05 = checks.find((c) => c.id === 'GDPR-05');
      expect(gdpr05?.status).toBe('FAIL');
    });

    it('FAIL when "store password" instruction found', () => {
      const checks = checkGdprIssues(filesWithStorePassword);
      const gdpr05 = checks.find((c) => c.id === 'GDPR-05');
      expect(gdpr05?.status).toBe('FAIL');
    });

    it('PASS when no passwords found', () => {
      const checks = checkGdprIssues(cleanFiles);
      const gdpr05 = checks.find((c) => c.id === 'GDPR-05');
      expect(gdpr05?.status).toBe('PASS');
    });
  });

  describe('GDPR-06: Missing privacy policy', () => {
    it('FAIL when no privacy policy reference found', () => {
      const checks = checkGdprIssues(filesNoPrivacyPolicy);
      const gdpr06 = checks.find((c) => c.id === 'GDPR-06');
      expect(gdpr06?.status).toBe('FAIL');
    });

    it('PASS when privacy policy is referenced', () => {
      const checks = checkGdprIssues(cleanFiles);
      const gdpr06 = checks.find((c) => c.id === 'GDPR-06');
      expect(gdpr06?.status).toBe('PASS');
    });
  });

  describe('GDPR-07: Minors data access', () => {
    it('FAIL when "children under 13" mentioned', () => {
      const checks = checkGdprIssues(filesWithMinors);
      const gdpr07 = checks.find((c) => c.id === 'GDPR-07');
      expect(gdpr07?.status).toBe('FAIL');
    });

    it('FAIL when "menores" mentioned (Spanish)', () => {
      const checks = checkGdprIssues(filesWithMinorES);
      const gdpr07 = checks.find((c) => c.id === 'GDPR-07');
      expect(gdpr07?.status).toBe('FAIL');
    });

    it('PASS when no minor references found', () => {
      const checks = checkGdprIssues(cleanFiles);
      const gdpr07 = checks.find((c) => c.id === 'GDPR-07');
      expect(gdpr07?.status).toBe('PASS');
    });
  });

  describe('GDPR-08: Missing legal basis', () => {
    it('FAIL when no legal basis documented', () => {
      const checks = checkGdprIssues(filesNoLegalBasis);
      const gdpr08 = checks.find((c) => c.id === 'GDPR-08');
      expect(gdpr08?.status).toBe('FAIL');
    });

    it('PASS when legal basis is documented', () => {
      const checks = checkGdprIssues(filesWithLegalBasis);
      const gdpr08 = checks.find((c) => c.id === 'GDPR-08');
      expect(gdpr08?.status).toBe('PASS');
    });
  });

  describe('N/A status — missing memory does not penalise', () => {
    it('GDPR-01 is N/A when memory is not provided', () => {
      const checks = checkGdprIssues({ 'SOUL.md': 'Basic soul. Privacy policy at /privacy. Legal basis: consent.' });
      const gdpr01 = checks.find((c) => c.id === 'GDPR-01');
      expect(gdpr01?.status).toBe('N/A');
    });

    it('GDPR-02 is N/A when memory is not provided', () => {
      const checks = checkGdprIssues({ 'SOUL.md': 'Basic soul. Privacy policy at /privacy. Legal basis: consent.' });
      const gdpr02 = checks.find((c) => c.id === 'GDPR-02');
      expect(gdpr02?.status).toBe('N/A');
    });

    it('N/A checks have null fix field', () => {
      const checks = checkGdprIssues({ 'SOUL.md': 'Basic soul' });
      const naChecks = checks.filter((c) => c.status === 'N/A');
      expect(naChecks.length).toBeGreaterThan(0);
      for (const check of naChecks) {
        expect(check.fix).toBeNull();
      }
    });

    it('score is not penalised by N/A checks', () => {
      const checks = checkGdprIssues({
        'SOUL.md': 'Clean soul. Privacy policy at /privacy. Legal basis: legitimate interest.',
      });
      const failedChecks = checks.filter((c) => c.status === 'FAIL');
      expect(failedChecks).toHaveLength(0);
    });
  });
});
