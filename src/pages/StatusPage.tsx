import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { ImpactBadge, StatusCard } from '../components/StatusCard';
import { StatusWidget } from '../components/StatusWidget';

export function StatusPage() {
  const statusQuery = useQuery({
    queryKey: ['status'],
    queryFn: () => api.status(),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
  });

  const triageQuery = useQuery({
    queryKey: ['incident-triage'],
    queryFn: () => api.incidentTriage(),
    staleTime: 5 * 60 * 1000,
  });

  const services = statusQuery.data?.services ?? [];
  const incidents = triageQuery.data?.cards ?? [];

  return (
    <main className="page">
      <header className="page-header">
        <h1>Provider Status</h1>
        <p>Live uptime for major AI services</p>
        {statusQuery.data?.checked && (
          <p className="timestamp" style={{ marginTop: 8 }}>
            Last checked {new Date(statusQuery.data.checked).toLocaleString()}
          </p>
        )}
      </header>

      <StatusWidget />

      {statusQuery.isLoading && <div className="loading">Loading status…</div>}
      {statusQuery.error && (
        <div className="error">Failed to load status: {(statusQuery.error as Error).message}</div>
      )}

      <h2 className="section-title">All Providers</h2>
      <div className="status-grid">
        {services.map((s) => (
          <StatusCard key={s.name} service={s} />
        ))}
      </div>

      {incidents.length > 0 && (
        <>
          <h2 className="section-title">Active Incidents</h2>
          {incidents.map((inc, i) => (
            <div className="card incident-card" key={inc.incident_id ?? i}>
              <div className="status-card-header">
                <h3>{inc.provider}</h3>
                {inc.impact_classification && (
                  <ImpactBadge impact={inc.impact_classification} />
                )}
              </div>
              {inc.triage_summary && (
                <p className="incident-summary">{inc.triage_summary}</p>
              )}
              {inc.recommended_action && (
                <p className="incident-action">
                  Recommended: {inc.recommended_action.replace(/_/g, ' ')}
                </p>
              )}
              {inc.affected_capabilities && inc.affected_capabilities.length > 0 && (
                <div className="card-meta">
                  {inc.affected_capabilities.map((c) => (
                    <span key={c} className="badge badge-tag">
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </>
      )}

      <p className="disclaimer">
        Status data from TensorFeed.ai, polled every 2 minutes. Check provider status pages for official updates.
      </p>
    </main>
  );
}
