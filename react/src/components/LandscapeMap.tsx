import type { Cluster } from '../types';

interface LandscapeMapProps {
  clusters: Cluster[];
  selectedClusterId?: string;
  compareClusterId?: string;
  hoveredClusterId?: string;
  onHover?: (clusterId: string) => void;
  onSelect: (clusterId: string) => void;
  onCompareSelect: (clusterId: string) => void;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getPoint(cluster: Cluster) {
  const width = 360;
  const height = 260;
  const marginLeft = 54;
  const marginRight = 20;
  const marginTop = 18;
  const marginBottom = 40;

  const plotWidth = width - marginLeft - marginRight;
  const plotHeight = height - marginTop - marginBottom;

  const x = marginLeft + cluster.heat * plotWidth;
  const y = marginTop + (1 - cluster.affordance) * plotHeight;

  return {
    x: clamp(x, marginLeft + 6, width - marginRight - 6),
    y: clamp(y, marginTop + 6, height - marginBottom - 6),
  };
}

export function LandscapeMap({
  clusters,
  selectedClusterId,
  compareClusterId,
  hoveredClusterId,
  onHover,
  onSelect,
  onCompareSelect,
}: LandscapeMapProps) {
  const width = 360;
  const height = 260;
  const marginLeft = 54;
  const marginRight = 20;
  const marginTop = 18;
  const marginBottom = 40;

  const x0 = marginLeft;
  const y0 = height - marginBottom;
  const x1 = width - marginRight;
  const y1 = marginTop;

  return (
    <div className="ve-landscape-map-shell">
      <svg className="ve-landscape-map" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Viewpoint landscape">
        <defs>
          <marker id="axis-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="rgba(95,72,48,0.85)" />
          </marker>
        </defs>

        <rect x="0" y="0" width={width} height={height} rx="18" fill="rgba(249,244,236,0.95)" />

        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const x = x0 + (x1 - x0) * t;
          const y = y0 - (y0 - y1) * t;
          return (
            <g key={t}>
              <line x1={x} y1={y1} x2={x} y2={y0} className="ve-axis-grid" />
              <line x1={x0} y1={y} x2={x1} y2={y} className="ve-axis-grid" />
              <line x1={x} y1={y0} x2={x} y2={y0 + 5} className="ve-axis-tick" />
              <line x1={x0 - 5} y1={y} x2={x0} y2={y} className="ve-axis-tick" />
              <text x={x} y={y0 + 18} textAnchor="middle" className="ve-axis-tick-label">{Math.round(t * 100)}</text>
              <text x={x0 - 10} y={y + 4} textAnchor="end" className="ve-axis-tick-label">{Math.round(t * 100)}</text>
            </g>
          );
        })}

        <line x1={x0} y1={y0} x2={x1 + 8} y2={y0} className="ve-axis-line" markerEnd="url(#axis-arrow)" />
        <line x1={x0} y1={y0} x2={x0} y2={y1 - 8} className="ve-axis-line" markerEnd="url(#axis-arrow)" />

        <text x={(x0 + x1) / 2} y={height - 8} textAnchor="middle" className="ve-axis-label">
          热度 / 主流度 →
        </text>
        <text
          x="16"
          y={(y0 + y1) / 2}
          textAnchor="middle"
          transform={`rotate(-90 16 ${(y0 + y1) / 2})`}
          className="ve-axis-label"
        >
          收益 / 解释价值 →
        </text>

        {clusters.map((cluster) => {
          const { x, y } = getPoint(cluster);
          const active = cluster.id === selectedClusterId;
          const compared = cluster.id === compareClusterId;
          const hovered = cluster.id === hoveredClusterId;
          const r = 10 + cluster.heat * 14;

          return (
            <g
              key={cluster.id}
              className="ve-landscape-node"
              onMouseEnter={() => onHover?.(cluster.id)}
              onClick={(event) => {
                if (event.shiftKey) {
                  onCompareSelect(cluster.id);
                } else {
                  onSelect(cluster.id);
                }
              }}
            >
              <circle
                cx={x}
                cy={y}
                r={r + (hovered ? 4 : 0)}
                fill={cluster.color}
                opacity={hovered ? 0.12 : 0.08}
                pointerEvents="none"
              />
              <circle
                cx={x}
                cy={y}
                r={r}
                fill={cluster.color}
                opacity={active ? 0.86 : 0.64}
                stroke={compared ? '#7a4e35' : active ? '#4e3721' : 'rgba(118,97,71,0.20)'}
                strokeWidth={compared ? 3 : active ? 2.4 : 1.2}
              />
              <circle
                cx={x}
                cy={y}
                r={Math.max(6, r * 0.42)}
                fill="rgba(255,248,239,0.96)"
                stroke="rgba(118,97,71,0.14)"
                strokeWidth={1}
                pointerEvents="none"
              />
              <text
                x={x}
                y={y - r - 8}
                textAnchor="middle"
                className={`ve-landscape-label ${active ? 'active' : ''}`}
                pointerEvents="none"
              >
                {cluster.name}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="ve-landscape-legend strong">
        <span>右侧更热门</span>
        <span>上方更有解释价值</span>
      </div>
    </div>
  );
}