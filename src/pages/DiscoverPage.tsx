import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import {
  normalizeArxivRecent,
  normalizeAttention,
  normalizeFunding,
  normalizeModels,
  normalizePapersTrending,
  normalizePricing,
} from '../utils/normalize';

type DiscoverTab = 'models' | 'papers' | 'funding' | 'attention';

export function DiscoverPage() {
  const [tab, setTab] = useState<DiscoverTab>('models');
  const [search, setSearch] = useState('');

  const modelsQuery = useQuery({
    queryKey: ['models'],
    queryFn: () => api.models(),
    staleTime: 10 * 60 * 1000,
    enabled: tab === 'models',
  });

  const pricingQuery = useQuery({
    queryKey: ['pricing'],
    queryFn: () => api.pricing(),
    staleTime: 10 * 60 * 1000,
    enabled: tab === 'models',
  });

  const papersQuery = useQuery({
    queryKey: ['papers-trending'],
    queryFn: () => api.papersTrending(),
    staleTime: 30 * 60 * 1000,
    enabled: tab === 'papers',
  });

  const arxivQuery = useQuery({
    queryKey: ['arxiv-recent'],
    queryFn: () => api.arxivRecent(),
    staleTime: 30 * 60 * 1000,
    enabled: tab === 'papers',
  });

  const fundingQuery = useQuery({
    queryKey: ['funding'],
    queryFn: () => api.funding(),
    staleTime: 30 * 60 * 1000,
    enabled: tab === 'funding',
  });

  const attentionQuery = useQuery({
    queryKey: ['attention'],
    queryFn: () => api.attention(),
    staleTime: 5 * 60 * 1000,
    enabled: tab === 'attention',
  });

  const pricing = useMemo(
    () => normalizePricing(pricingQuery.data),
    [pricingQuery.data],
  );
  const models = useMemo(
    () => normalizeModels(modelsQuery.data),
    [modelsQuery.data],
  );
  const papers = useMemo(
    () => normalizePapersTrending(papersQuery.data),
    [papersQuery.data],
  );
  const arxiv = useMemo(
    () => normalizeArxivRecent(arxivQuery.data),
    [arxivQuery.data],
  );
  const rounds = useMemo(
    () => normalizeFunding(fundingQuery.data),
    [fundingQuery.data],
  );
  const attention = useMemo(
    () => normalizeAttention(attentionQuery.data),
    [attentionQuery.data],
  );

  const q = search.toLowerCase();
  const filteredPricing = pricing.filter(
    (p) => !q || p.model?.toLowerCase().includes(q) || p.provider?.toLowerCase().includes(q),
  );
  const filteredModels = models.filter(
    (m) => !q || m.name?.toLowerCase().includes(q) || m.provider?.toLowerCase().includes(q),
  );
  const maxScore = Math.max(...attention.map((a) => a.score), 1);

  const isLoading =
    (tab === 'models' && (modelsQuery.isLoading || pricingQuery.isLoading)) ||
    (tab === 'papers' && (papersQuery.isLoading || arxivQuery.isLoading)) ||
    (tab === 'funding' && fundingQuery.isLoading) ||
    (tab === 'attention' && attentionQuery.isLoading);

  return (
    <main className="page">
      <header className="page-header">
        <h1>Discover</h1>
        <p>Models, research, funding, and attention index</p>
      </header>

      <div className="tabs">
        {(['models', 'papers', 'funding', 'attention'] as const).map((t) => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'models' && (
        <input
          className="search-input"
          placeholder="Search models or providers…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      )}

      {isLoading && <div className="loading">Loading…</div>}

      {tab === 'models' && !isLoading && (
        <>
          <h2 className="section-title">Pricing Comparison</h2>
          {filteredPricing.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="pricing-table">
                <thead>
                  <tr>
                    <th>Model</th>
                    <th>Provider</th>
                    <th>Input /1M</th>
                    <th>Output /1M</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPricing.slice(0, 40).map((p, i) => (
                    <tr key={i}>
                      <td>{p.model}</td>
                      <td>{p.provider}</td>
                      <td>${typeof p.input_per_1m === 'number' ? p.input_per_1m.toFixed(2) : '—'}</td>
                      <td>${typeof p.output_per_1m === 'number' ? p.output_per_1m.toFixed(2) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-dim">No pricing data</p>
          )}

          {filteredModels.length > 0 && (
            <>
              <h2 className="section-title">Model Catalog</h2>
              {filteredModels.slice(0, 20).map((m, i) => (
                <div className="card" key={m.id ?? i}>
                  <h3>{m.name}</h3>
                  <div className="card-meta">
                    <span>{m.provider}</span>
                    {m.context_window && <span>{m.context_window.toLocaleString()} ctx</span>}
                    {m.input_price_per_1m != null && (
                      <span>${m.input_price_per_1m}/1M in</span>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
          <p className="disclaimer">Pricing is informational only, not financial advice.</p>
        </>
      )}

      {tab === 'papers' && !isLoading && (
        <>
          <h2 className="section-title">Trending by Citations</h2>
          {papers.length === 0 ? (
            <p className="text-dim">No papers available</p>
          ) : (
            papers.slice(0, 10).map((p, i) => (
              <div className="card" key={i}>
                <h3>
                  {p.url ? (
                    <a href={p.url} target="_blank" rel="noopener noreferrer">
                      {p.title}
                    </a>
                  ) : (
                    p.title
                  )}
                </h3>
                <div className="card-meta">
                  {p.authors?.slice(0, 2).join(', ')}
                  {p.citationCount != null && <span>{p.citationCount} citations</span>}
                  {p.year && <span>{p.year}</span>}
                </div>
              </div>
            ))
          )}

          <h2 className="section-title">Latest arXiv</h2>
          {arxiv.length === 0 ? (
            <p className="text-dim">No arXiv papers available</p>
          ) : (
            arxiv.slice(0, 10).map((p) => (
              <div className="card" key={p.arxivId}>
                <h3>
                  <a href={p.htmlUrl ?? `https://arxiv.org/abs/${p.arxivId}`} target="_blank" rel="noopener noreferrer">
                    {p.title}
                  </a>
                </h3>
                <div className="card-meta">
                  <span>{p.primaryCategory}</span>
                  <span>{new Date(p.publishedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </>
      )}

      {tab === 'funding' && !isLoading && (
        <>
          <h2 className="section-title">Recent Funding Rounds</h2>
          {rounds.length === 0 ? (
            <p className="text-dim">No funding data available</p>
          ) : (
            rounds.slice(0, 25).map((r, i) => (
              <div className="card" key={i}>
                <h3>
                  {r.source_url ? (
                    <a href={r.source_url} target="_blank" rel="noopener noreferrer">
                      {r.company}
                    </a>
                  ) : (
                    r.company
                  )}
                </h3>
                {r.source_url && (
                  <a href={r.source_url} target="_blank" rel="noopener noreferrer" className="text-xs">
                    Source →
                  </a>
                )}
                <div className="card-meta">
                  {r.amount && <span>{r.amount}</span>}
                  {r.stage && <span>{r.stage}</span>}
                  {r.date && <span>{r.date}</span>}
                  {r.category && <span className="badge badge-tag">{r.category}</span>}
                </div>
              </div>
            ))
          )}
        </>
      )}

      {tab === 'attention' && !isLoading && (
        <>
          <h2 className="section-title">AI Attention Index</h2>
          <p className="text-muted-block">
            Who&apos;s dominating AI news and community attention right now
          </p>
          {attention.map((a) => (
            <div className="card" key={a.provider}>
              <div className="flex-row-between">
                <h3>{a.provider}</h3>
                <span className="score-value">{Math.round(a.score)}</span>
              </div>
              <div className="attention-bar">
                <div
                  className="attention-bar-fill"
                  style={{ width: `${(a.score / maxScore) * 100}%` }}
                />
              </div>
              <div className="card-meta">
                {a.news_24h != null && <span>{a.news_24h} articles (24h)</span>}
                {a.news_7d != null && <span>{a.news_7d} articles (7d)</span>}
              </div>
            </div>
          ))}
        </>
      )}
    </main>
  );
}
