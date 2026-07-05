import type { NewsArticle, ActionCard } from '../types/tensorfeed';
import { stripHtml } from '../utils/normalize';

function urgencyClass(urgency?: string) {
  if (!urgency) return '';
  const u = urgency.toLowerCase();
  if (u.includes('critical')) return 'badge-urgency-critical';
  if (u.includes('high')) return 'badge-urgency-high';
  if (u.includes('medium') || u.includes('monitor')) return 'badge-urgency-medium';
  return 'badge-urgency-low';
}

interface NewsCardProps {
  article: NewsArticle;
  actionCard?: ActionCard;
}

export function NewsCard({ article, actionCard }: NewsCardProps) {
  const snippet = article.snippet ? stripHtml(article.snippet) : '';

  return (
    <article className="card">
      <h3>
        <a href={article.url} target="_blank" rel="noopener noreferrer">
          {article.title}
        </a>
      </h3>
      {snippet && (
        <p className="card-snippet">
          {snippet.slice(0, 200)}
          {snippet.length > 200 ? '…' : ''}
        </p>
      )}
      {actionCard?.action_summary && (
        <p className="card-action-summary">{actionCard.action_summary}</p>
      )}
      <div className="card-meta">
        <span>{article.source}</span>
        {article.categories?.map((c) => (
          <span key={c} className="badge badge-tag">
            {c}
          </span>
        ))}
        {actionCard?.urgency && (
          <span className={`badge ${urgencyClass(actionCard.urgency)}`}>{actionCard.urgency}</span>
        )}
        <span className="timestamp">
          {new Date(article.publishedAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </article>
  );
}
