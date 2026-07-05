import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { NewsCard } from '../components/NewsCard';
import type { ActionCard, NewsArticle } from '../types/tensorfeed';

type CategoryDef = {
  id: string;
  label: string;
  apiCategory?: string;
  clientFilter?: (article: NewsArticle) => boolean;
};

const TOOLS_PATTERN =
  /\b(tool|tools|sdk|framework|mcp|plugin|extension|library|cli|api|copilot|cursor|devin|agent|workflow|automation|integration)\b/i;

const MODELS_PATTERN =
  /\b(model|llm|gpt|claude|gemini|llama|mistral|deepseek|release|benchmark|weights|fine-tun|multimodal)\b/i;

const CATEGORIES: CategoryDef[] = [
  { id: 'all', label: 'All' },
  { id: 'research', label: 'Research', apiCategory: 'Research' },
  { id: 'models', label: 'Models', apiCategory: 'Models' },
  { id: 'google', label: 'Google', apiCategory: 'Google/Gemini' },
  { id: 'community', label: 'Community', apiCategory: 'Community' },
  {
    id: 'anthropic',
    label: 'Anthropic',
    clientFilter: (a) =>
      /anthropic|claude/i.test(a.source) ||
      a.categories?.some((c) => /anthropic|claude/i.test(c)) ||
      /anthropic|claude/i.test(a.title),
  },
  {
    id: 'openai',
    label: 'OpenAI',
    clientFilter: (a) =>
      /openai|chatgpt|gpt-/i.test(a.source) ||
      a.categories?.some((c) => /openai|gpt/i.test(c)) ||
      /openai|chatgpt|gpt-/i.test(a.title),
  },
  {
    id: 'tools',
    label: 'Tools',
    clientFilter: (a) => {
      const text = `${a.title} ${a.source} ${a.snippet ?? ''}`;
      return TOOLS_PATTERN.test(text) && !MODELS_PATTERN.test(a.title);
    },
  },
];

export function NewsPage() {
  const [category, setCategory] = useState('all');
  const active = CATEGORIES.find((c) => c.id === category) ?? CATEGORIES[0];
  const needsFullFeed = Boolean(active.clientFilter);

  const newsQuery = useQuery({
    queryKey: ['news', needsFullFeed ? 'full' : (active.apiCategory ?? 'all')],
    queryFn: () =>
      api.news({
        limit: 100,
        category: needsFullFeed ? undefined : active.apiCategory,
      }),
    staleTime: 5 * 60 * 1000,
  });

  const actionQuery = useQuery({
    queryKey: ['action-cards'],
    queryFn: () => api.actionCards(),
    staleTime: 10 * 60 * 1000,
  });

  const articles = useMemo(() => {
    const all = newsQuery.data?.articles ?? [];
    if (!active.clientFilter) return all;
    return all.filter(active.clientFilter);
  }, [newsQuery.data?.articles, active]);

  const actionByTitle = new Map<string, ActionCard>();
  for (const card of actionQuery.data?.cards ?? []) {
    if (card.title) actionByTitle.set(card.title.toLowerCase(), card);
    if (card.article_id) actionByTitle.set(card.article_id, card);
  }

  return (
    <main className="page">
      <header className="page-header">
        <h1>AI News</h1>
        <p>Aggregated from 36+ sources, refreshed every 10 minutes</p>
        {newsQuery.data?.updated && (
          <p className="timestamp" style={{ marginTop: 8 }}>
            Feed updated {new Date(newsQuery.data.updated).toLocaleString()}
          </p>
        )}
      </header>

      <div className="tabs" role="tablist">
        {CATEGORIES.map(({ id, label }) => (
          <button
            key={id}
            role="tab"
            className={`tab ${category === id ? 'active' : ''}`}
            onClick={() => setCategory(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {newsQuery.isLoading && <div className="loading">Loading news…</div>}
      {newsQuery.error && (
        <div className="error">Failed to load news: {(newsQuery.error as Error).message}</div>
      )}

      {!newsQuery.isLoading && articles.length === 0 && (
        <p className="loading">No articles in this category right now.</p>
      )}

      {articles.map((article) => (
        <NewsCard
          key={article.id}
          article={article}
          actionCard={
            actionByTitle.get(article.title.toLowerCase()) ?? actionByTitle.get(article.id)
          }
        />
      ))}

      <p className="disclaimer">
        Articles link to original sources. Urgency badges from TensorFeed action cards (AI-analyzed).
      </p>
    </main>
  );
}
