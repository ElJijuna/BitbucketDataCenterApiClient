import { Security } from '../../src/security/Security';

const API_URL = 'https://bitbucket.example.com';
const USER = 'pilmee';
const TOKEN = 'my-personal-access-token';

describe('Security', () => {
  let security: Security;

  beforeEach(() => {
    security = new Security(API_URL, USER, TOKEN);
  });

  describe('constructor', () => {
    it('throws TypeError for an invalid apiUrl', () => {
      expect(() => new Security('not-a-url', USER, TOKEN)).toThrow(TypeError);
    });

    it('throws with a descriptive message for an invalid apiUrl', () => {
      expect(() => new Security('not-a-url', USER, TOKEN)).toThrow(
        'Invalid apiUrl: "not-a-url" is not a valid URL'
      );
    });

    it('accepts a valid HTTP URL', () => {
      expect(() => new Security('http://bitbucket.local', USER, TOKEN)).not.toThrow();
    });

    it('accepts a valid HTTPS URL', () => {
      expect(() => new Security(API_URL, USER, TOKEN)).not.toThrow();
    });
  });

  describe('getApiUrl', () => {
    it('returns the API URL as provided', () => {
      expect(security.getApiUrl()).toBe(API_URL);
    });

    it('strips a trailing slash from the API URL', () => {
      const s = new Security('https://bitbucket.example.com/', USER, TOKEN);
      expect(s.getApiUrl()).toBe('https://bitbucket.example.com');
    });
  });

  describe('getAuthorizationHeader', () => {
    it('returns a Basic auth header string', () => {
      const header = security.getAuthorizationHeader();
      expect(header).toMatch(/^Basic /);
    });

    it('encodes user and token as Base64', () => {
      const expected = `Basic ${Buffer.from(`${USER}:${TOKEN}`).toString('base64')}`;
      expect(security.getAuthorizationHeader()).toBe(expected);
    });

    it('produces different headers for different credentials', () => {
      const other = new Security(API_URL, 'other-user', 'other-token');
      expect(security.getAuthorizationHeader()).not.toBe(other.getAuthorizationHeader());
    });
  });

  describe('getHeaders', () => {
    it('includes the Authorization header', () => {
      const headers = security.getHeaders();
      expect(headers['Authorization']).toBe(security.getAuthorizationHeader());
    });

    it('includes Content-Type as application/json', () => {
      expect(security.getHeaders()['Content-Type']).toBe('application/json');
    });

    it('includes Accept as application/json', () => {
      expect(security.getHeaders()['Accept']).toBe('application/json');
    });

    it('returns a plain object with exactly three keys', () => {
      const headers = security.getHeaders();
      expect(Object.keys(headers)).toHaveLength(3);
    });
  });
});
