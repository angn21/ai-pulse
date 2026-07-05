import type {
  ArxivPaper,
  AttentionProvider,
  FundingRound,
  ModelEntry,
  ModelPricing,
  PaperTrending,
} from '../types/tensorfeed';

export function stripHtml(text: string): string {
  return text
    .replace(/<img[^>]*>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function statusLabel(status: string): string {
  switch (status) {
    case 'operational':
      return '[OK]';
    case 'degraded':
      return '[DEG]';
    case 'down':
      return '[DOWN]';
    case 'maintenance':
      return '[MAINT]';
    default:
      return `[${status.toUpperCase()}]`;
  }
}

export function impactLabel(impact?: string): string {
  if (!impact) return 'Unknown';
  return impact.charAt(0).toUpperCase() + impact.slice(1);
}

export function impactClass(impact?: string): string {
  switch (impact?.toLowerCase()) {
    case 'critical':
      return 'badge-down';
    case 'major':
      return 'badge-urgency-high';
    case 'minor':
      return 'badge-degraded';
    default:
      return 'badge-maintenance';
  }
}

interface RawProviderBlock {
  id?: string;
  name: string;
  models?: {
    id?: string;
    name: string;
    inputPrice?: number;
    outputPrice?: number;
    contextWindow?: number;
  }[];
}

export function normalizePricing(raw: unknown): ModelPricing[] {
  if (!raw) return [];
  const data = raw as {
    pricing?: ModelPricing[];
    providers?: { providers?: RawProviderBlock[] } | RawProviderBlock[];
  };

  if (Array.isArray(data.pricing) && data.pricing.length > 0) {
    return data.pricing;
  }

  const blocks = Array.isArray(data.providers)
    ? data.providers
    : data.providers?.providers ?? [];

  const rows: ModelPricing[] = [];
  for (const block of blocks) {
    for (const m of block.models ?? []) {
      rows.push({
        model: m.name,
        provider: block.name,
        input_per_1m: m.inputPrice,
        output_per_1m: m.outputPrice,
        context_window: m.contextWindow,
      });
    }
  }

  return rows;
}

export function normalizeModels(raw: unknown): ModelEntry[] {
  if (!raw) return [];
  const data = raw as { models?: ModelEntry[]; providers?: RawProviderBlock[] };
  if (Array.isArray(data.models) && data.models.length > 0) {
    return data.models;
  }

  const rows: ModelEntry[] = [];
  for (const block of data.providers ?? []) {
    for (const m of block.models ?? []) {
      rows.push({
        id: m.id,
        name: m.name,
        provider: block.name,
        input_price_per_1m: m.inputPrice,
        output_price_per_1m: m.outputPrice,
        context_window: m.contextWindow,
      });
    }
  }
  return rows;
}

export function normalizePapersTrending(raw: unknown): PaperTrending[] {
  if (!raw) return [];
  const data = raw as {
    papers?: PaperTrending[];
    items?: PaperTrending[];
    snapshot?: { papers?: PaperTrending[] };
  };
  const papers = data.snapshot?.papers ?? data.papers ?? data.items ?? [];

  return papers.map((p) => ({
    ...p,
    url: p.url ?? (p as { arxivId?: string }).arxivId
      ? `https://arxiv.org/abs/${(p as { arxivId?: string }).arxivId}`
      : undefined,
    citationCount: p.citationCount ?? (p as { citation_count?: number }).citation_count,
  }));
}

export function normalizeArxivRecent(raw: unknown): ArxivPaper[] {
  if (!raw) return [];
  const data = raw as {
    papers?: ArxivPaper[];
    items?: ArxivPaper[];
    snapshot?: { papers?: ArxivPaper[] };
  };
  return data.snapshot?.papers ?? data.papers ?? data.items ?? [];
}

export function normalizeFunding(raw: unknown): FundingRound[] {
  if (!raw) return [];
  const data = raw as {
    rounds?: Record<string, unknown>[];
    funding?: Record<string, unknown>[];
  };
  const rounds = data.rounds ?? data.funding ?? [];

  return rounds.map((r) => ({
    company: String(r.company ?? ''),
    amount: r.amountM != null ? `$${r.amountM}M` : (r.amount as string | undefined),
    stage: r.stage as string | undefined,
    date: (r.announcedDate ?? r.date) as string | undefined,
    category: r.category as string | undefined,
    source_url: (r.sourceUrl ?? r.url ?? r.source_url) as string | undefined,
    lead_investors: r.leadInvestors as string[] | undefined,
  }));
}

export function normalizeAttention(raw: unknown): AttentionProvider[] {
  if (!raw) return [];
  const data = raw as {
    providers?: Record<string, unknown>[];
    index?: Record<string, unknown>[];
  };
  const list = data.providers ?? data.index ?? [];

  const normalized = list.map((p) => ({
    provider: String(p.name ?? p.provider ?? p.id ?? 'Unknown'),
    score: Number(p.attention_score ?? p.score ?? 0),
    news_24h: p.news_24h as number | undefined,
    news_7d: p.news_7d as number | undefined,
  }));

  return normalized;
}

export function normalizeFreeTier(raw: unknown) {
  const data = raw as {
    remaining?: number;
    used_today?: number;
    limit?: number;
    resets_at?: string;
    free_trial?: {
      remaining?: number;
      used_today?: number;
      calls_per_ip_per_day?: number;
      resets_at?: string;
    };
  };
  const trial = data.free_trial;
  return {
    ok: true,
    remaining: trial?.remaining ?? data.remaining,
    used_today: trial?.used_today ?? data.used_today,
    limit: trial?.calls_per_ip_per_day ?? data.limit ?? 100,
    resets_at: trial?.resets_at ?? data.resets_at,
  };
}
