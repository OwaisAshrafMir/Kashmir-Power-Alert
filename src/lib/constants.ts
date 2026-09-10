export const APP_NAME = "Kashmir Power Alerts";
export const APP_TAGLINE = "Know when power will go in your area — before it happens.";
export const APP_LOGO_PATH = "/logo.png";
export const HELPLINE_PRIMARY = "1912";
export const HELPLINE_TOLL_FREE = "18001807666";

/** Legacy CE Distribution notifications (often unreachable / deprecated). */
export const KPDCL_NOTIFICATIONS_URL = "https://cedistributionkmr.jkpdd.net/notifications.aspx";
/** Current official KPDCL consumer portal. */
export const KPDCL_PORTAL_URL = "https://kpdcl.jk.gov.in/";
/** Official portal notifications / circulars page (PDF uploads when present). */
export const KPDCL_PORTAL_NOTIFICATIONS_URL =
  "https://kpdcl.jk.gov.in/page/aDVGek9CVFEyYVp6MzIvMkdEVmJ0QT09";
/** J&K DIPR press releases — often carries full KPDCL shutdown text. */
export const DIPR_HOME_URL = "https://dipr.jk.gov.in/Home";
export const DIPR_BASE_URL = "https://dipr.jk.gov.in";

/**
 * WordPress RSS feeds that reprint official “Chief Engineer, Distribution, KPDCL” text.
 * Used when KPDCL/DIPR sites are empty or stale. Not original reporting.
 */
export const PRESS_RSS_FEEDS = [
  "https://www.jammulinksnews.com/search/Power+Shutdown+by+KPDCL/feed/rss2/",
  "https://kashmirlife.net/search/KPDCL+power+shutdown/feed/rss2/",
  "https://www.kashmirfrontier.com/search/Power+Shutdown+by+KPDCL/feed/rss2/",
] as const;
