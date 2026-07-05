import type { ServiceStatus } from '../types/tensorfeed';
import { statusLabel } from '../utils/normalize';

const STATUS_CLASS: Record<string, string> = {
  operational: 'badge-operational',
  degraded: 'badge-degraded',
  down: 'badge-down',
  maintenance: 'badge-maintenance',
};

export function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_CLASS[status] || 'badge-maintenance';
  return <span className={`badge badge-status ${cls}`}>{statusLabel(status)}</span>;
}

export function ImpactBadge({ impact }: { impact: string }) {
  const normalized = impact.toLowerCase();
  let cls = 'badge-maintenance';
  if (normalized === 'critical') cls = 'badge-down';
  else if (normalized === 'major') cls = 'badge-urgency-high';
  else if (normalized === 'minor') cls = 'badge-degraded';
  else if (normalized === 'informational') cls = 'badge-operational';

  const label = impact.charAt(0).toUpperCase() + impact.slice(1);
  return <span className={`badge badge-status ${cls}`}>{label}</span>;
}

export function StatusCard({ service }: { service: ServiceStatus }) {
  const degradedComponents =
    service.components?.filter((c) => c.status !== 'operational').length ?? 0;

  return (
    <div className="card status-card">
      <div className="status-card-header">
        <div className="status-card-title">
          <h3>{service.name}</h3>
          <p>{service.provider}</p>
        </div>
        <StatusBadge status={service.status} />
      </div>
      {degradedComponents > 0 && (
        <p className="status-card-note">
          {degradedComponents} component{degradedComponents > 1 ? 's' : ''} affected
        </p>
      )}
      {service.statusPageUrl && (
        <a
          href={service.statusPageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="status-card-link"
        >
          Status page →
        </a>
      )}
    </div>
  );
}
