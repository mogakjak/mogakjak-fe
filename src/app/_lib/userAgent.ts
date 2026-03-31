export const BOT_UA_PATTERN =
  /bot|googlebot|crawler|spider|robot|crawling|facebookexternalhit|kakaotalk-scrap|slackbot|twitterbot|discordbot|yeti|daum|kakaostory/i;

export const MOBILE_UA_PATTERN = /iPhone|iPad|iPod|Android/i;

/**
 * User-Agent 문자열을 기반으로 모바일 기기 여부를 확인합니다.
 */
export function isMobileDevice(userAgent: string): boolean {
  return MOBILE_UA_PATTERN.test(userAgent);
}

/**
 * User-Agent 문자열을 기반으로 봇(크롤러) 여부를 확인합니다.
 */
export function isBot(userAgent: string): boolean {
  return BOT_UA_PATTERN.test(userAgent);
}
