import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { NewsCard } from '../components/NewsCard';
import { StatusCard } from '../components/StatusCard';
import type { ActionCard } from '../types/tensorfeed';

export function HomePage() {
  const { data, isLoading, error, dataUpdatedAt } = useQuery({
    queryKey: ['brief'],
    queryFn: () => api.brief(),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });

  if (isLoading) return <div className="page loading">Loading daily brief…</div>;
  if (error) return <div className="page error">Failed to load: {(error as Error).message}</div>;

  const today = data?.today;
  const status = data?.status;
  const actionCards = data?.actionCards?.cards ?? [];
  const actionByTitle = new Map<string, ActionCard>();
  for (const card of actionCards) {
    if (card.title) actionByTitle.set(card.title.toLowerCase(), card);
  }

  const newsItems = today?.news?.data?.items ?? [];
  const trendingPapers =
    (today?.papers?.data as { ai_trending?: { data?: { items?: { title: string; authors?: string[]; citationCount?: number; url?: string }[] } } })
      ?.ai_trending?.data?.items ?? [];

  const services = status?.services ?? today?.status?.data?.services ?? [];
  const downCount = services.filter((s) => s.status !== 'operational').length;

  return (
    <main className="page">
      <header className="page-header">
        <h1>AI Pulse</h1>
        <p>Your daily AI ecosystem briefing</p>
        {dataUpdatedAt > 0 && (
          <p className="timestamp" style={{ marginTop: 8 }}>
            Updated {new Date(dataUpdatedAt).toLocaleTimeString()}
          </p>
        )}
      </header>

      <h2 className="section-title">Provider Status</h2>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 12 }}>
        {downCount === 0
          ? `All ${services.length} providers operational`
          : `${downCount} provider${downCount > 1 ? 's' : ''} with issues`}
      </p>
      <div className="status-grid">
        {services.slice(0, 6).map((s) => (
          <StatusCard key={s.name} service={s} />
        ))}
      </div>

      <h2 className="section-title">Top Headlines</h2>
      {newsItems.length === 0 ? (
        <p className="loading">No headlines available</p>
      ) : (
        newsItems.map((item, i) => (
          <NewsCard
            key={`${item.url}-${i}`}
            article={{
              id: String(i),
              title: item.title,
              url: item.url,
              source: item.source,
              publishedAt: item.publishedAt,
            }}
            actionCard={actionByTitle.get(item.title.toLowerCase())}
          />
        ))
      )}

      {trendingPapers.length > 0 && (
        <>
          <h2 className="section-title">Trending Research</h2>
          {trendingPapers.slice(0, 3).map((paper, i) => (
            <div className="card" key={i}>
              <h3>
                {paper.url ? (
                  <a href={paper.url} target="_blank" rel="noopener noreferrer">
                    {paper.title}
                  </a>
                ) : (
                  paper.title
                )}
              </h3>
              <div className="card-meta">
                {paper.authors?.slice(0, 2).join(', ')}
                {paper.citationCount != null && (
                  <span>{paper.citationCount.toLocaleString()} citations</span>
                )}
              </div>
            </div>
          ))}
        </>
      )}

      <p className="disclaimer">
        Data from{' '}
        <a href="https://tensorfeed.ai" target="_blank" rel="noopener noreferrer">
          TensorFeed.ai
        </a>
        . News links to original publishers.
      </p>
    </main>
  );
}
