/*
Copyright 2024-2026 ChatterMate

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/**
 * The languages Meta accepts for a WhatsApp message template, transcribed from
 * https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates/supported-languages
 *
 * This list exists only to stop typos reaching Graph — Meta remains the
 * authority on what it accepts, and the server passes the code through
 * untouched. A language Meta adds after this was written is simply missing from
 * the picker until we update it; it is never rejected by us, and a template
 * already using one still displays (see languageLabel).
 *
 * Codes are not uniformly `xx` or `xx_YY`: `fil` and `prs_AF` have three-letter
 * languages, `es_CRI` a three-letter region. Do not "tidy" them.
 */
export interface WhatsAppLanguage {
  code: string
  label: string
}

/** Meta's own names, kept verbatim so they can be cross-referenced against the
 *  Business Manager UI. Sorted by label here rather than at runtime — a sort on
 *  import hides the ordering from review and re-runs on every module load. */
export const WHATSAPP_LANGUAGES: readonly WhatsAppLanguage[] = [
  { code: 'af', label: 'Afrikaans' },
  { code: 'sq', label: 'Albanian' },
  { code: 'ar', label: 'Arabic' },
  { code: 'ar_EG', label: 'Arabic (EGY)' },
  { code: 'ar_LB', label: 'Arabic (LBN)' },
  { code: 'ar_MA', label: 'Arabic (MAR)' },
  { code: 'ar_QA', label: 'Arabic (QAT)' },
  { code: 'ar_AE', label: 'Arabic (UAE)' },
  { code: 'az', label: 'Azerbaijani' },
  { code: 'be_BY', label: 'Belarusian' },
  { code: 'bn', label: 'Bengali' },
  { code: 'bn_IN', label: 'Bengali (IND)' },
  { code: 'bg', label: 'Bulgarian' },
  { code: 'ca', label: 'Catalan' },
  { code: 'zh_CN', label: 'Chinese (CHN)' },
  { code: 'zh_HK', label: 'Chinese (HKG)' },
  { code: 'zh_TW', label: 'Chinese (TAI)' },
  { code: 'hr', label: 'Croatian' },
  { code: 'cs', label: 'Czech' },
  { code: 'da', label: 'Danish' },
  { code: 'prs_AF', label: 'Dari' },
  { code: 'nl', label: 'Dutch' },
  { code: 'nl_BE', label: 'Dutch (BEL)' },
  { code: 'en', label: 'English' },
  { code: 'en_AU', label: 'English (AUS)' },
  { code: 'en_CA', label: 'English (CAN)' },
  { code: 'en_GH', label: 'English (GHA)' },
  { code: 'en_IN', label: 'English (IND)' },
  { code: 'en_IE', label: 'English (IRL)' },
  { code: 'en_JM', label: 'English (JAM)' },
  { code: 'en_MY', label: 'English (MYS)' },
  { code: 'en_NZ', label: 'English (NZL)' },
  { code: 'en_QA', label: 'English (QAT)' },
  { code: 'en_SG', label: 'English (SGP)' },
  { code: 'en_AE', label: 'English (UAE)' },
  { code: 'en_UG', label: 'English (UGA)' },
  { code: 'en_GB', label: 'English (UK)' },
  { code: 'en_US', label: 'English (US)' },
  { code: 'en_ZA', label: 'English (ZAF)' },
  { code: 'et', label: 'Estonian' },
  { code: 'fil', label: 'Filipino' },
  { code: 'fi', label: 'Finnish' },
  { code: 'fr', label: 'French' },
  { code: 'fr_BE', label: 'French (BEL)' },
  { code: 'fr_CA', label: 'French (CAN)' },
  { code: 'fr_CH', label: 'French (CHE)' },
  { code: 'fr_CI', label: 'French (CIV)' },
  { code: 'fr_MA', label: 'French (MAR)' },
  { code: 'ka', label: 'Georgian' },
  { code: 'de', label: 'German' },
  { code: 'de_AT', label: 'German (AUT)' },
  { code: 'de_CH', label: 'German (CHE)' },
  { code: 'el', label: 'Greek' },
  { code: 'gu', label: 'Gujarati' },
  { code: 'ha', label: 'Hausa' },
  { code: 'he', label: 'Hebrew' },
  { code: 'hi', label: 'Hindi' },
  { code: 'hu', label: 'Hungarian' },
  { code: 'id', label: 'Indonesian' },
  { code: 'ga', label: 'Irish' },
  { code: 'it', label: 'Italian' },
  { code: 'ja', label: 'Japanese' },
  { code: 'kn', label: 'Kannada' },
  { code: 'kk', label: 'Kazakh' },
  { code: 'rw_RW', label: 'Kinyarwanda' },
  { code: 'ko', label: 'Korean' },
  { code: 'ky_KG', label: 'Kyrgyz (Kyrgyzstan)' },
  { code: 'lo', label: 'Lao' },
  { code: 'lv', label: 'Latvian' },
  { code: 'lt', label: 'Lithuanian' },
  { code: 'mk', label: 'Macedonian' },
  { code: 'ms', label: 'Malay' },
  { code: 'ml', label: 'Malayalam' },
  { code: 'mr', label: 'Marathi' },
  { code: 'nb', label: 'Norwegian' },
  { code: 'ps_AF', label: 'Pashto' },
  { code: 'fa', label: 'Persian' },
  { code: 'pl', label: 'Polish' },
  { code: 'pt_BR', label: 'Portuguese (BR)' },
  { code: 'pt_PT', label: 'Portuguese (POR)' },
  { code: 'pa', label: 'Punjabi' },
  { code: 'ro', label: 'Romanian' },
  { code: 'ru', label: 'Russian' },
  { code: 'sr', label: 'Serbian' },
  { code: 'si_LK', label: 'Sinhala' },
  { code: 'sk', label: 'Slovak' },
  { code: 'sl', label: 'Slovenian' },
  { code: 'es', label: 'Spanish' },
  { code: 'es_AR', label: 'Spanish (ARG)' },
  { code: 'es_CL', label: 'Spanish (CHL)' },
  { code: 'es_CO', label: 'Spanish (COL)' },
  { code: 'es_CRI', label: 'Spanish (CRI)' },
  { code: 'es_DO', label: 'Spanish (DOM)' },
  { code: 'es_EC', label: 'Spanish (ECU)' },
  { code: 'es_HN', label: 'Spanish (HND)' },
  { code: 'es_MX', label: 'Spanish (MEX)' },
  { code: 'es_PA', label: 'Spanish (PAN)' },
  { code: 'es_PE', label: 'Spanish (PER)' },
  { code: 'es_ES', label: 'Spanish (SPA)' },
  { code: 'es_UY', label: 'Spanish (URY)' },
  { code: 'sw', label: 'Swahili' },
  { code: 'sv', label: 'Swedish' },
  { code: 'ta', label: 'Tamil' },
  { code: 'te', label: 'Telugu' },
  { code: 'th', label: 'Thai' },
  { code: 'tr', label: 'Turkish' },
  { code: 'uk', label: 'Ukrainian' },
  { code: 'ur', label: 'Urdu' },
  { code: 'uz', label: 'Uzbek' },
  { code: 'vi', label: 'Vietnamese' },
  { code: 'zu', label: 'Zulu' },
] as const

export const DEFAULT_LANGUAGE = 'en_US'

const BY_CODE = new Map(WHATSAPP_LANGUAGES.map((language) => [language.code, language.label]))

/** The display name for a code, falling back to the code itself — a template
 *  may use a language Meta added after this list was written, and showing the
 *  raw code beats showing nothing. */
export const languageLabel = (code: string): string => BY_CODE.get(code) ?? code
