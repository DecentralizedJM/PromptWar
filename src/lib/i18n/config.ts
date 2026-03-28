/** BCP-47 tags for Web Speech API (where supported). */
export const LOCALE_OPTIONS = [
  { code: 'en', label: 'English', speechLang: 'en-US' },
  { code: 'hi', label: 'हिन्दी (Hindi)', speechLang: 'hi-IN' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)', speechLang: 'kn-IN' },
  { code: 'bn', label: 'বাংলা (Bengali)', speechLang: 'bn-IN' },
  { code: 'as', label: 'অসমীয়া (Assamese)', speechLang: 'as-IN' },
  { code: 'ml', label: 'മലയാളം (Malayalam)', speechLang: 'ml-IN' },
  { code: 'ta', label: 'தமிழ் (Tamil)', speechLang: 'ta-IN' },
  { code: 'te', label: 'తెలుగు (Telugu)', speechLang: 'te-IN' },
  { code: 'gu', label: 'ગુજરાતી (Gujarati)', speechLang: 'gu-IN' },
  { code: 'mr', label: 'मराठी (Marathi)', speechLang: 'mr-IN' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)', speechLang: 'pa-IN' },
  { code: 'or', label: 'ଓଡ଼ିଆ (Odia)', speechLang: 'or-IN' },
  { code: 'ur', label: 'اردو (Urdu)', speechLang: 'ur-IN' },
] as const;

export type AppLocale = (typeof LOCALE_OPTIONS)[number]['code'];

export const DEFAULT_LOCALE: AppLocale = 'en';

export const LOCALE_STORAGE_KEY = 'lifebridge-locale';

export function isAppLocale(code: string): code is AppLocale {
  return LOCALE_OPTIONS.some((l) => l.code === code);
}

export function getSpeechLangForLocale(code: AppLocale): string {
  const row = LOCALE_OPTIONS.find((l) => l.code === code);
  return row?.speechLang ?? 'en-US';
}

/** English name for Gemini instructions */
export function getLocaleEnglishName(code: AppLocale): string {
  const names: Record<AppLocale, string> = {
    en: 'English',
    hi: 'Hindi',
    kn: 'Kannada',
    bn: 'Bengali',
    as: 'Assamese',
    ml: 'Malayalam',
    ta: 'Tamil',
    te: 'Telugu',
    gu: 'Gujarati',
    mr: 'Marathi',
    pa: 'Punjabi',
    or: 'Odia',
    ur: 'Urdu',
  };
  return names[code];
}
