import { describe, expect, it } from 'vitest';

import { resolveTrustedOrigins } from './web-origin';

describe('resolveTrustedOrigins', () => {
  it('allows localhost development origins on arbitrary ports', () => {
    const origins = resolveTrustedOrigins(new Request('http://localhost/api/auth/sign-in/email', {
      headers: {
        origin: 'http://localhost:4201',
      },
    }));

    expect(origins).toEqual(['http://localhost:4201']);
  });

  it('rejects untrusted origins', () => {
    const origins = resolveTrustedOrigins(new Request('http://localhost/api/auth/sign-in/email', {
      headers: {
        origin: 'https://evil.example.com',
      },
    }));

    expect(origins).toEqual([]);
  });
});
