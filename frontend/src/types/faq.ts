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

export type FaqStatus = 'draft' | 'published'

export interface FaqItem {
  id: string
  question: string
  answer: string
  category: string
  slug?: string | null
  status: FaqStatus
  knowledge_id: number | null
  source_label: string | null
  helpful_yes?: number
  helpful_no?: number
  created_at?: string | null
  updated_at?: string | null
}

export interface FaqPagination {
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface FaqListResponse {
  faqs: FaqItem[]
  pagination: FaqPagination
}

export type FaqImportMode = 'qa' | 'articles' | 'pdf'

export type FaqJobStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type FaqJobStage =
  | 'not_started'
  | 'analyzing_sources'
  | 'extracting'
  | 'drafting'
  | 'grouping'
  | 'completed'

export interface GenerationSource {
  id: number
  name: string
  source_type: string
  has_faqs: boolean
  pages: number
  estimated_calls: number
}

export interface GenerateEstimate {
  total_sources: number
  new_sources: number
  pages: number
  estimated_calls: number
  metered: boolean
  remaining_credits: number | null
  sources: GenerationSource[]
}

export interface FaqGenerationJob {
  id: number
  job_type: 'generate_all' | 'generate_source' | 'import_url' | 'import_articles' | 'import_pdf'
  status: FaqJobStatus
  stage: FaqJobStage
  progress_percentage: number
  faqs_created: number
  source_url: string | null
  error: string | null
  created_at?: string | null
}

export interface HelpCenterHeaderLink {
  label: string
  url: string
}

export interface HelpCenterAgentOption {
  id: string
  name: string
  has_widget: boolean
}

export type DomainStatus = 'unverified' | 'pending' | 'verified'
export type SslStatus = 'none' | 'pending' | 'active' | 'failed'

export interface HelpCenterDnsRecord {
  type: 'CNAME' | 'TXT'
  host: string
  value: string
  verified: boolean
}

export interface HelpCenterDomain {
  custom_domain: string | null
  domain_status: DomainStatus
  ssl_status: SslStatus
  records: HelpCenterDnsRecord[]
  domain_verified_at: string | null
}

export interface HelpCenterSettings {
  enabled: boolean
  slug: string | null
  title: string | null
  description: string | null
  logo_url: string | null
  brand_color: string
  header_links: HelpCenterHeaderLink[]
  cta_text: string | null
  cta_url: string | null
  cta_enabled: boolean
  auto_generate: boolean
  agent_id: string | null
  ai_search_enabled: boolean
  chat_widget_enabled: boolean
  live_url: string | null
  published_count: number
  plan_allowed: boolean
  agents: HelpCenterAgentOption[]
  domain: HelpCenterDomain | null
}

export type HelpCenterSettingsUpdate = Partial<
  Pick<
    HelpCenterSettings,
    | 'enabled'
    | 'title'
    | 'description'
    | 'brand_color'
    | 'header_links'
    | 'cta_text'
    | 'cta_url'
    | 'cta_enabled'
    | 'auto_generate'
    | 'agent_id'
    | 'ai_search_enabled'
    | 'chat_widget_enabled'
  >
>
