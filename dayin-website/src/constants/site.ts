const DEFAULT_SITE_DOMAIN = 'sunflower.ccwu.cc';

const SITE_DOMAIN_BY_HOSTNAME: Readonly<Record<string, string>> = {
  [DEFAULT_SITE_DOMAIN]: DEFAULT_SITE_DOMAIN,
};

const currentHostname =
  typeof window === 'undefined' ? '' : window.location.hostname.toLowerCase();

export const SITE_DOMAIN =
  SITE_DOMAIN_BY_HOSTNAME[currentHostname] ?? DEFAULT_SITE_DOMAIN;

export const SITE_URL = `https://${SITE_DOMAIN}`;

export const PAPER_FOOTER_ZH = `向日葵打印　${SITE_URL}`;
export const PAPER_FOOTER_EN = `Sunflower Print  ${SITE_URL}`;
