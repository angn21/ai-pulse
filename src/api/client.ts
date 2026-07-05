import type {
  ActionCardsResponse,
  AttentionResponse,
  BriefBundle,
  FundingResponse,
  IncidentTriageResponse,
  ModelsResponse,
  NewsResponse,
  PapersTrendingResponse,
  PricingResponse,
  RoutingPreviewResponse,
  StatusResponse,
  TodayResponse,
  WhatsNewResponse,
} from '../types/tensorfeed';
import { normalizeFreeTier } from '../utils/normalize';

const BASE = '/api';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  const body = await res.json().catch(() => ({ error: res.statusText }));
  if (!res.ok) {
    const err = body as { error?: string; message?: string };
    throw new Error(err.error || err.message || `HTTP ${res.status}`);
  }
  return body as T;
}

export const api = {
  today: (limit = 5) => get<TodayResponse>(`/today?limit=${limit}`),
  brief: () => get<BriefBundle>('/brief'),
  news: (params?: { limit?: number; category?: string }) => {
    const q = new URLSearchParams();
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.category) q.set('category', params.category);
    const qs = q.toString();
    return get<NewsResponse>(`/news${qs ? `?${qs}` : ''}`);
  },
  status: () => get<StatusResponse>('/status'),
  incidentTriage: () => get<IncidentTriageResponse>('/status/incidents/triage'),
  actionCards: () => get<ActionCardsResponse>('/news/action-cards'),
  models: () => get<ModelsResponse>('/models'),
  pricing: () => get<PricingResponse>('/agents/pricing'),
  papersTrending: () => get<PapersTrendingResponse>('/papers/ai-trending'),
  arxivRecent: () => get<PapersTrendingResponse>('/papers/arxiv-recent'),
  funding: () => get<FundingResponse>('/funding'),
  attention: () => get<AttentionResponse>('/attention'),
  freeTierStatus: async () => normalizeFreeTier(await get('/free-tier/status')),
  routingPreview: (task: string) =>
    get<RoutingPreviewResponse>(`/preview/routing?task=${encodeURIComponent(task)}`),
  whatsNew: () => get<WhatsNewResponse>('/premium/whats-new'),
  verifiedNews: (minSources = 4) =>
    get<{ ok: boolean; clusters?: unknown[] }>(
      `/premium/history/news/verified?min_sources=${minSources}&date=${new Date().toISOString().slice(0, 10)}`,
    ),
};
