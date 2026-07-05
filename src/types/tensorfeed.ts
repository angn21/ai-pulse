export interface NewsArticle {
  id: string;
  title: string;
  url: string;
  source: string;
  sourceDomain?: string;
  snippet?: string;
  categories?: string[];
  publishedAt: string;
  fetchedAt?: string;
}

export interface NewsResponse {
  ok: boolean;
  updated: string;
  count: number;
  articles: NewsArticle[];
}

export interface ServiceStatus {
  name: string;
  provider: string;
  status: 'operational' | 'degraded' | 'down' | 'maintenance' | string;
  statusPageUrl?: string;
  components?: { name: string; status: string }[];
  lastChecked?: string;
}

export interface StatusResponse {
  ok: boolean;
  checked: string;
  services: ServiceStatus[];
}

export interface IncidentTriageCard {
  provider: string;
  incident_id?: string;
  triage_summary?: string;
  impact_classification?: string;
  recommended_action?: string;
  affected_capabilities?: string[];
  started_at?: string;
  resolved_at?: string | null;
}

export interface IncidentTriageResponse {
  ok: boolean;
  cards?: IncidentTriageCard[];
}

export interface ActionCard {
  article_id?: string;
  title?: string;
  source?: string;
  url?: string;
  action_summary?: string;
  urgency?: string;
  affected_capability?: string;
  cost_impact?: string;
  security_impact?: string;
  migration_recommendation?: string;
  published_at?: string;
}

export interface ActionCardsResponse {
  ok: boolean;
  cards?: ActionCard[];
}

export interface TodayResponse {
  ok: boolean;
  generated_at: string;
  sections_included: string[];
  limit_per_section: number;
  news?: {
    available: boolean;
    captured_at: string;
    data: { items: { title: string; source: string; url: string; publishedAt: string }[] };
  };
  papers?: {
    available: boolean;
    captured_at: string;
    data: Record<string, unknown>;
  };
  hf?: { available: boolean; captured_at: string; data: Record<string, unknown> };
  community?: { available: boolean; captured_at: string; data: Record<string, unknown> };
  inference?: { available: boolean; captured_at: string; data: Record<string, unknown> };
  status?: {
    available: boolean;
    captured_at: string;
    data: { services?: ServiceStatus[] };
  };
}

export interface ModelPricing {
  model: string;
  provider?: string;
  input_per_1m?: number;
  output_per_1m?: number;
  context_window?: number;
}

export interface PricingResponse {
  ok: boolean;
  pricing?: ModelPricing[];
}

export interface ModelEntry {
  id?: string;
  name: string;
  provider: string;
  input_price_per_1m?: number;
  output_price_per_1m?: number;
  context_window?: number;
}

export interface ModelsResponse {
  ok: boolean;
  models?: ModelEntry[];
}

export interface PaperTrending {
  title: string;
  authors?: string[];
  year?: number;
  venue?: string;
  citationCount?: number;
  arxivId?: string;
  url?: string;
}

export interface PapersTrendingResponse {
  ok: boolean;
  papers?: PaperTrending[];
  items?: PaperTrending[];
}

export interface ArxivPaper {
  arxivId: string;
  title: string;
  authors?: string[];
  primaryCategory?: string;
  publishedAt: string;
  htmlUrl?: string;
}

export interface ArxivRecentResponse {
  ok: boolean;
  papers?: ArxivPaper[];
  items?: ArxivPaper[];
}

export interface FundingRound {
  company: string;
  amount?: string;
  stage?: string;
  date?: string;
  lead_investors?: string[];
  category?: string;
  source_url?: string;
}

export interface FundingResponse {
  ok: boolean;
  rounds?: FundingRound[];
  funding?: FundingRound[];
}

export interface AttentionProvider {
  provider: string;
  score: number;
  news_24h?: number;
  news_7d?: number;
}

export interface AttentionResponse {
  ok: boolean;
  providers?: AttentionProvider[];
  index?: AttentionProvider[];
}

export interface FreeTierStatus {
  ok: boolean;
  used_today?: number;
  remaining?: number;
  limit?: number;
  resets_at?: string;
}

export interface RoutingPreviewResponse {
  ok: boolean;
  recommendation?: {
    model?: string;
    provider?: string;
    reason?: string;
  };
  task?: string;
}

export interface WhatsNewResponse {
  ok: boolean;
  brief?: string;
  sections?: Record<string, unknown>[];
  generated_at?: string;
}

export interface BriefBundle {
  ok: boolean;
  generated_at: string;
  today: TodayResponse;
  status: StatusResponse;
  actionCards: ActionCardsResponse;
}
