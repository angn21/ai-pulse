import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { StatusBadge } from '../components/StatusCard';

export function StatusWidget() {
  const { data, isLoading } = useQuery({
    queryKey: ['status-strip'],
    queryFn: () => api.status(),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
  });

  const services = data?.services ?? [];

  if (isLoading) {
    return <div className="status-strip loading">Loading live status…</div>;
  }

  return (
    <div className="status-strip" aria-label="Live provider status">
      {services.map((service) => (
        <a
          key={service.name}
          className="status-strip-item"
          href={service.statusPageUrl ?? '#'}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            if (!service.statusPageUrl) e.preventDefault();
          }}
        >
          <span className="status-strip-name">{service.name}</span>
          <StatusBadge status={service.status} />
        </a>
      ))}
    </div>
  );
}
