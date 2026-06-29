export const getAvatarUrl = (agentType: string): string => {
  const avatars = {
    customer_support: '/avatars/support-agent.svg',
    sales: '/avatars/sales-agent.svg',
    tech_support: '/avatars/tech-agent.svg',
    general: '/avatars/general-agent.svg',
    custom: '/avatars/custom-agent.svg',
  }
  return avatars[agentType as keyof typeof avatars] || avatars.general
}

/**
 * True when `path` is already an absolute URL (e.g. a signed S3/CDN link) and
 * should be used as-is instead of being prefixed with the API base URL.
 *
 * We test for an absolute http(s) scheme rather than matching a host substring
 * such as "amazonaws.com": substring host checks are unreliable — the host can
 * appear anywhere in an attacker-influenced string — and are flagged by static
 * analysis (CodeQL js/incomplete-url-substring-sanitization).
 */
export const isAbsoluteUrl = (path?: string | null): boolean =>
  !!path && /^https?:\/\//i.test(path)
