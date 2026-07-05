import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

type Task = 'general' | 'code' | 'reasoning' | 'creative';

function formatPremiumError(message: string, remaining?: number) {
  if (message === 'payment_required') {
    if (remaining === 0) {
      return 'Daily free premium quota used up (100 calls/IP/day). Resets in 24h, or pay via USDC on TensorFeed.';
    }
    return 'Premium endpoint requires payment. The free trial may not apply to this endpoint from localhost — try the routing preview instead.';
  }
  return message;
}

export function PremiumPage() {
  const [task, setTask] = useState<Task>('general');
  const [routingResult, setRoutingResult] = useState<object | null>(null);
  const [whatsNewResult, setWhatsNewResult] = useState<object | null>(null);
  const [verifiedResult, setVerifiedResult] = useState<object | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const quotaQuery = useQuery({
    queryKey: ['free-tier-status'],
    queryFn: () => api.freeTierStatus(),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });

  async function runPreview() {
    setLoading('preview');
    setError(null);
    try {
      const data = await api.routingPreview(task);
      setRoutingResult(data);
    } catch (e) {
      setError(formatPremiumError((e as Error).message, quotaQuery.data?.remaining));
    } finally {
      setLoading(null);
    }
  }

  async function runPremium(fn: () => Promise<unknown>, key: string) {
    setLoading(key);
    setError(null);
    try {
      const data = await fn();
      if (key === 'whats-new') setWhatsNewResult(data as object);
      if (key === 'verified') setVerifiedResult(data as object);
      quotaQuery.refetch();
    } catch (e) {
      setError(formatPremiumError((e as Error).message, quotaQuery.data?.remaining));
    } finally {
      setLoading(null);
    }
  }

  async function runFreeBrief() {
    setLoading('today');
    setError(null);
    try {
      const data = await api.today(5);
      setWhatsNewResult(data as object);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(null);
    }
  }

  const quota = quotaQuery.data;

  return (
    <main className="page">
      <header className="page-header">
        <h1>Premium Preview</h1>
        <p>Try TensorFeed premium features via free trial &amp; preview endpoints</p>
      </header>

      {quota && (
        <div className="premium-quota">
          Free premium trial: <strong>{quota.remaining ?? '?'}</strong> of{' '}
          {quota.limit ?? 100} calls remaining today
          {quota.resets_at && (
            <span className="premium-quota-sub">
              Resets {new Date(quota.resets_at).toLocaleString()}
            </span>
          )}
        </div>
      )}

      <h2 className="section-title">Model Routing Preview (free, 5/day)</h2>
      <p className="text-muted-block">
        Which model is best for your task? Uses the free preview endpoint — no credits consumed.
      </p>
      <div className="tabs tabs-compact">
        {(['general', 'code', 'reasoning', 'creative'] as const).map((t) => (
          <button key={t} className={`tab ${task === t ? 'active' : ''}`} onClick={() => setTask(t)}>
            {t}
          </button>
        ))}
      </div>
      <button className="btn" onClick={runPreview} disabled={loading === 'preview'}>
        {loading === 'preview' ? 'Loading…' : 'Get recommendation'}
      </button>
      {routingResult && (
        <pre className="premium-result mt-12">
          {JSON.stringify(routingResult, null, 2)}
        </pre>
      )}

      <h2 className="section-title">Daily Brief (free)</h2>
      <p className="text-muted-block">
        Free alternative to the premium morning brief — uses /api/today.
      </p>
      <button className="btn btn-secondary" disabled={!!loading} onClick={runFreeBrief}>
        {loading === 'today' ? 'Loading…' : 'Load daily brief'}
      </button>

      <h2 className="section-title">Premium Trial Features (uses free quota)</h2>
      <p className="text-muted-block">
        These call premium endpoints using your 100 free daily credits. No wallet required.
      </p>
      <div className="flex-wrap-gap mb-16">
        <button
          className="btn btn-secondary"
          disabled={!!loading}
          onClick={() => runPremium(() => api.whatsNew(), 'whats-new')}
        >
          {loading === 'whats-new' ? 'Loading…' : 'Premium morning brief'}
        </button>
        <button
          className="btn btn-secondary"
          disabled={!!loading}
          onClick={() => runPremium(() => api.verifiedNews(4), 'verified')}
        >
          {loading === 'verified' ? 'Loading…' : 'Verified news (4+ sources)'}
        </button>
      </div>

      {whatsNewResult && (
        <>
          <h3 className="subheading">Brief</h3>
          <pre className="premium-result">{JSON.stringify(whatsNewResult, null, 2)}</pre>
        </>
      )}
      {verifiedResult && (
        <>
          <h3 className="subheading">Verified News</h3>
          <pre className="premium-result">{JSON.stringify(verifiedResult, null, 2)}</pre>
        </>
      )}

      {error && (
        <div className="error error-left">
          {error}
        </div>
      )}

      <p className="disclaimer">
        Premium endpoints cost ~$0.02/call after the free trial. Routing recommendations and pricing data
        are informational only, not financial advice. Powered by{' '}
        <a href="https://tensorfeed.ai/developers/agent-payments" target="_blank" rel="noopener noreferrer">
          TensorFeed USDC credits
        </a>
        .
      </p>
    </main>
  );
}
