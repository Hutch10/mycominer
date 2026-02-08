import { FacilityCluster } from '../tenantTypes';

interface Props {
  clusters: FacilityCluster[];
}

export function FacilityClusterPanel({ clusters }: Props) {
  return (
    <section className="mt-card">
      <header className="mt-card-header">
        <div>
          <p className="mt-kicker">Clusters</p>
          <h2>Facility Clusters</h2>
        </div>
      </header>
      <ul className="mt-list">
        {clusters.map((c) => (
          <li key={c.clusterId} className="mt-tile">
            <div className="mt-row">
              <strong>{c.name}</strong>
              <span className="mt-pill">{c.facilities.length} facilities</span>
            </div>
            <p className="mt-sub">{c.clusterId}</p>
          </li>
        ))}
        {clusters.length === 0 && <li>No clusters</li>}
      </ul>
    </section>
  );
}
