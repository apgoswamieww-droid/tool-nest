/**
 * URL extraction utilities.
 * Extracts URLs from text and categorizes them.
 */

export interface ExtractedUrl {
  url: string;
  domain: string;
  protocol: string;
  isSecure: boolean;
}

export interface ExtractionResult {
  urls: ExtractedUrl[];
  uniqueDomains: string[];
  totalCount: number;
  httpsCount: number;
  httpCount: number;
}

// Comprehensive URL pattern
const URL_REGEX =
  /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi;

/**
 * Extract all URLs from a text block.
 */
export function extractUrls(text: string): ExtractionResult {
  const matches = text.match(URL_REGEX) || [];

  const urls: ExtractedUrl[] = matches.map((url) => {
    try {
      const parsed = new URL(url);
      return {
        url: url.trim(),
        domain: parsed.hostname,
        protocol: parsed.protocol.replace(":", ""),
        isSecure: parsed.protocol === "https:",
      };
    } catch {
      return {
        url: url.trim(),
        domain: "",
        protocol: "unknown",
        isSecure: false,
      };
    }
  });

  const uniqueDomains = [...new Set(urls.map((u) => u.domain))].filter(Boolean);

  return {
    urls,
    uniqueDomains,
    totalCount: urls.length,
    httpsCount: urls.filter((u) => u.isSecure).length,
    httpCount: urls.filter((u) => !u.isSecure && u.protocol === "http").length,
  };
}

/**
 * Extract only unique URLs from text.
 */
export function extractUniqueUrls(text: string): ExtractionResult {
  const result = extractUrls(text);
  const seen = new Set<string>();
  const uniqueUrls: ExtractedUrl[] = [];

  for (const url of result.urls) {
    if (!seen.has(url.url.toLowerCase())) {
      seen.add(url.url.toLowerCase());
      uniqueUrls.push(url);
    }
  }

  return {
    ...result,
    urls: uniqueUrls,
    totalCount: uniqueUrls.length,
  };
}

/**
 * Format URLs as a plain text list.
 */
export function formatUrlsAsList(urls: ExtractedUrl[]): string {
  return urls.map((u) => u.url).join("\n");
}

/**
 * Format URLs as markdown links.
 */
export function formatUrlsAsMarkdown(urls: ExtractedUrl[]): string {
  return urls.map((u) => `[${u.domain || u.url}](${u.url})`).join("\n");
}

/**
 * Format URLs as HTML links.
 */
export function formatUrlsAsHtml(urls: ExtractedUrl[]): string {
  return urls
    .map((u) => `<a href="${u.url}" target="_blank" rel="noopener noreferrer">${u.domain || u.url}</a>`)
    .join("\n");
}

/**
 * Format URLs as JSON.
 */
export function formatUrlsAsJson(urls: ExtractedUrl[]): string {
  return JSON.stringify(
    urls.map((u) => ({ url: u.url, domain: u.domain, secure: u.isSecure })),
    null,
    2
  );
}
