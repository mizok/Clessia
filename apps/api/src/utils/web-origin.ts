export const CLOUDFLARE_PAGES_ORIGIN = 'https://clessia.pages.dev';

const LOCALHOST_ORIGIN_PATTERN = /^http:\/\/localhost(?::\d+)?$/;

export function isTrustedWebOrigin(origin: string | null | undefined): origin is string {
  if (!origin) {
    return false;
  }

  return origin === CLOUDFLARE_PAGES_ORIGIN || LOCALHOST_ORIGIN_PATTERN.test(origin);
}

export function resolveCorsOrigin(origin: string | null | undefined): string | null {
  return isTrustedWebOrigin(origin) ? origin : null;
}

export function resolveTrustedOrigins(request?: Request): string[] {
  const origin = request?.headers.get('origin');
  return isTrustedWebOrigin(origin) ? [origin] : [];
}
