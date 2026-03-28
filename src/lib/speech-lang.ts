/** BCP-47 tag for Web Speech API — follows the browser locale (e.g. hi-IN, ta-IN). */
export function getBrowserSpeechLang(): string {
  if (typeof navigator === 'undefined') return 'en-US';
  return navigator.language?.trim() || 'en-US';
}
