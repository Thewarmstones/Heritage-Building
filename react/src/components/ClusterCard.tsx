import type { Cluster } from '../types';

export function ClusterCard({
  cluster,
  active,
  onClick,
  onHover,
  size = 'default',
  nameOnly = false,
}: {
  cluster: Cluster;
  active: boolean;
  onClick: () => void;
  onHover?: () => void;
  size?: 'default' | 'large';
  nameOnly?: boolean;
}) {
  return (
    <button
      type="button"
      className={`ve-cluster-card slim ${size === 'large' ? 'large' : ''} ${active ? 'active' : ''}`}
      onClick={onClick}
      onMouseEnter={onHover}
      title={cluster.description}
    >
      <div className="ve-cluster-cover">
        {cluster.thumbnail ? <img src={cluster.thumbnail} alt={cluster.name} /> : <div className="ve-cluster-cover-fallback" />}
      </div>
      <div className="ve-cluster-copy">
        <div className="ve-cluster-name">{cluster.name}</div>
        {!nameOnly ? <div className="ve-cluster-meta-line">{cluster.semanticTag}</div> : null}
      </div>
    </button>
  );
}
