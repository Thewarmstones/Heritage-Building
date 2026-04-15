import { useEffect, useMemo, useState } from 'react';
import { sampleData } from './data/sampleData';
import type { Cluster, ViewpointDataset } from './types';
import { ClusterCard } from './components/ClusterCard';
import { DetailPanel } from './components/DetailPanel';
import { JsonImporter } from './components/JsonImporter';
import { SpatialStage } from './components/SpatialStage';

type FilterKey = 'all' | 'classic' | 'undervalued' | 'entry' | 'detail';

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'classic', label: '经典' },
  { key: 'undervalued', label: '被低估' },
  { key: 'entry', label: '入口导向' },
  { key: 'detail', label: '细节导向' },
];

function matchesFilter(cluster: Cluster, filter: FilterKey) {
  if (filter === 'all') return true;
  if (filter === 'classic') return /经典|稳妥|canonical/.test(`${cluster.semanticTag} ${cluster.name}`);
  if (filter === 'undervalued') return /低热|价值|被低估/.test(`${cluster.semanticTag} ${cluster.name}`);
  if (filter === 'entry') return /入口|导向/.test(`${cluster.semanticTag} ${cluster.name}`);
  if (filter === 'detail') return /细节|装饰|文化|轮廓/.test(`${cluster.semanticTag} ${cluster.name}`);
  return true;
}

function matchesSelectableFilters(cluster: Cluster, semanticTag: string, location: string, audience: string) {
  const semanticOk = semanticTag === 'all' || cluster.semanticTag === semanticTag;
  const locationOk = location === 'all' || cluster.location === location;
  const audienceOk = audience === 'all' || cluster.recommendedFor.includes(audience);
  return semanticOk && locationOk && audienceOk;
}

export default function App() {
  const [data, setData] = useState<ViewpointDataset>(sampleData);
  const [selectedClusterId, setSelectedClusterId] = useState(sampleData.clusters[0]?.id ?? '');
  const [showJson, setShowJson] = useState(false);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [hoveredClusterId, setHoveredClusterId] = useState(sampleData.clusters[0]?.id ?? '');
  const [selectedSemanticTag, setSelectedSemanticTag] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedAudience, setSelectedAudience] = useState<string>('all');

  const selectableOptions = useMemo(() => {
    const semanticTags = Array.from(new Set(data.clusters.map((item) => item.semanticTag)));
    const locations = Array.from(new Set(data.clusters.map((item) => item.location)));
    const audiences = Array.from(new Set(data.clusters.flatMap((item) => item.recommendedFor)));
    return { semanticTags, locations, audiences };
  }, [data.clusters]);

  const filteredClusters = useMemo(
    () => data.clusters.filter((item) => matchesFilter(item, filter)
      && matchesSelectableFilters(item, selectedSemanticTag, selectedLocation, selectedAudience)),
    [data.clusters, filter, selectedAudience, selectedLocation, selectedSemanticTag],
  );

  useEffect(() => {
    if (!filteredClusters.some((item) => item.id === selectedClusterId)) {
      const nextCluster = filteredClusters[0] ?? data.clusters[0];
      setSelectedClusterId(nextCluster?.id ?? '');
    }
  }, [data.clusters, filteredClusters, selectedClusterId]);

  const selectedCluster = useMemo(
    () => data.clusters.find((item) => item.id === selectedClusterId) ?? filteredClusters[0] ?? data.clusters[0],
    [data.clusters, filteredClusters, selectedClusterId],
  );

  const hoveredCluster = useMemo(
    () => data.clusters.find((item) => item.id === hoveredClusterId) ?? selectedCluster,
    [data.clusters, hoveredClusterId, selectedCluster],
  );

  const stats = useMemo(() => {
    const count = Math.max(filteredClusters.length, 1);
    const avgAffordance = Math.round((filteredClusters.reduce((sum, item) => sum + item.affordance, 0) / count) * 100);
    const avgHeat = Math.round((filteredClusters.reduce((sum, item) => sum + item.heat, 0) / count) * 100);
    const avgCost = Math.round((filteredClusters.reduce((sum, item) => sum + item.cost, 0) / count) * 10) / 10;
    return { avgAffordance, avgHeat, avgCost };
  }, [filteredClusters]);

  const handleLoad = (nextData: ViewpointDataset) => {
    setData(nextData);
    setSelectedClusterId(nextData.clusters[0]?.id ?? '');
    setHoveredClusterId(nextData.clusters[0]?.id ?? '');
    setFilter('all');
    setSelectedSemanticTag('all');
    setSelectedLocation('all');
    setSelectedAudience('all');
  };

  const handleUpdateClusterCamera = (clusterId: string, camera: { position: [number, number, number]; target: [number, number, number] }) => {
    setData((current) => ({
      ...current,
      clusters: current.clusters.map((cluster) => (
        cluster.id === clusterId
          ? { ...cluster, cameraCentroid: camera.position, cameraTarget: camera.target }
          : cluster
      )),
    }));
  };

  const facetRows = [
    {
      label: '语义标签',
      value: selectedSemanticTag,
      onChange: setSelectedSemanticTag,
      options: selectableOptions.semanticTags,
    },
    {
      label: '空间位置',
      value: selectedLocation,
      onChange: setSelectedLocation,
      options: selectableOptions.locations,
    },
    {
      label: '推荐人群',
      value: selectedAudience,
      onChange: setSelectedAudience,
      options: selectableOptions.audiences,
    },
  ];

  return (
    <div className="ve-app">
      <header className="ve-topbar compact">
        <div className="ve-brand compact">
          <div className="ve-kicker">Heritage Viewpoint Explorer</div>
          <div className="ve-title-row compact">
            <h1>{data.site}</h1>
            <span className="ve-badge">Workbench</span>
            <span className="ve-badge soft">{data.clusters.length} viewpoints</span>
            <span className="ve-badge soft">viewpoint-only analysis</span>
          </div>
        </div>

        <div className="ve-toolbar-group">
          <button type="button" className="ve-button" onClick={() => setShowJson((v) => !v)}>
            {showJson ? '收起 schema' : '查看 schema'}
          </button>
          <button type="button" className="ve-button" onClick={() => handleLoad(sampleData)}>
            恢复样例
          </button>
          <JsonImporter onLoad={handleLoad} />
        </div>
      </header>

      <main className="ve-shell refined">
        <aside className="ve-sidebar refined">
          <section className="ve-panel ve-candidates-panel refined split-layout">
            <div className="ve-sidebar-top">
              <div className="ve-panel-head compact with-border">
                <div>
                  <div className="ve-section-kicker">Viewpoint candidates</div>
                  <h2>候选导航器</h2>
                  <p>上方先按研究意图筛选，下方只保留 viewpoint 预览图与名称进行快速浏览。</p>
                </div>
              </div>

              <section className="ve-selector-panel">
                <div className="ve-selector-title-row">
                  <strong>用户可选内容</strong>
                  <span>{filteredClusters.length} / {data.clusters.length} 个 viewpoint</span>
                </div>

                <div className="ve-filter-row major">
                  {FILTERS.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      className={`ve-filter-chip ${item.key === filter ? 'active' : ''}`}
                      onClick={() => setFilter(item.key)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="ve-facet-stack">
                  {facetRows.map((row) => (
                    <div className="ve-facet-row" key={row.label}>
                      <div className="ve-facet-label">{row.label}</div>
                      <div className="ve-filter-row facet">
                        <button
                          type="button"
                          className={`ve-filter-chip ${row.value === 'all' ? 'active' : ''}`}
                          onClick={() => row.onChange('all')}
                        >
                          全部
                        </button>
                        {row.options.map((option) => (
                          <button
                            key={option}
                            type="button"
                            className={`ve-filter-chip ${row.value === option ? 'active' : ''}`}
                            onClick={() => row.onChange(option)}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <section className="ve-card-panel">
              <div className="ve-section-subhead">
                <div>
                  <div className="ve-section-kicker">Candidate viewpoints</div>
                  <h3>候选 viewpoint</h3>
                </div>
                {hoveredCluster ? <span className="ve-badge soft">Hover: {hoveredCluster.name}</span> : null}
              </div>

              <div className="ve-cluster-list refined gallery">
                {filteredClusters.map((cluster) => (
                  <ClusterCard
                    key={cluster.id}
                    cluster={cluster}
                    active={cluster.id === selectedCluster?.id}
                    onClick={() => {
                      setSelectedClusterId(cluster.id);
                    }}
                    onHover={() => setHoveredClusterId(cluster.id)}
                    size="large"
                    nameOnly
                  />
                ))}
              </div>

              {hoveredCluster ? (
                <div className="ve-sidebar-preview">
                  <div className="ve-preview-kicker">Hover summary</div>
                  <strong>{hoveredCluster.name}</strong>
                  <p>{hoveredCluster.description}</p>
                  <div className="ve-chip-row compact tighter">
                    <span className="ve-chip">{hoveredCluster.semanticTag}</span>
                    <span className="ve-chip">{hoveredCluster.location}</span>
                  </div>
                </div>
              ) : null}

              <div className="ve-sidebar-stats">
                <div><span>平均收益</span><strong>{stats.avgAffordance}</strong></div>
                <div><span>平均热度</span><strong>{stats.avgHeat}</strong></div>
                <div><span>平均成本</span><strong>{stats.avgCost}m</strong></div>
              </div>
            </section>
          </section>
        </aside>

        <section className="ve-workspace refined">
          <section className="ve-panel ve-stage-panel hero-stage">
            <div className="ve-panel-head stage-head compact-stage">
              <div>
                <div className="ve-section-kicker">Spatial stage · 3DGS viewer</div>
                <h2>{selectedCluster?.name ?? '未选择 viewpoint'}</h2>
                <p>{selectedCluster?.anchor ?? '请选择一个 viewpoint 以查看空间锚定。'}</p>
              </div>
              <div className="ve-stage-summary">
                <span className="ve-badge soft">{selectedCluster?.semanticTag}</span>
                <span className="ve-badge soft">热度 {Math.round((selectedCluster?.heat ?? 0) * 100)}</span>
                <span className="ve-badge soft">收益 {Math.round((selectedCluster?.affordance ?? 0) * 100)}</span>
                <span className="ve-badge soft">成本 {selectedCluster?.cost}m</span>
              </div>
            </div>
            <SpatialStage
              clusters={data.clusters}
              selectedClusterId={selectedCluster?.id}
              onUpdateClusterCamera={handleUpdateClusterCamera}
            />
          </section>

          <section className="ve-panel ve-detail-panel-wrap refined">
            <div className="ve-panel-head compact with-border">
              <div>
                <div className="ve-section-kicker">Viewpoint detail</div>
                <h2>证据解释器</h2>
                <p>仅围绕 viewpoint 的摘要、证据、指标与空间锚定组织信息。</p>
              </div>
            </div>
            {selectedCluster ? <DetailPanel cluster={selectedCluster} /> : null}
          </section>

          {showJson ? (
            <section className="ve-panel ve-json-panel refined">
              <div className="ve-panel-head compact with-border">
                <div>
                  <div className="ve-section-kicker">Data schema</div>
                  <h2>当前 JSON</h2>
                  <p>仍兼容 posts 字段，但前端界面不再直接展示 post 内容。</p>
                </div>
              </div>
              <pre className="ve-json-block">{JSON.stringify(data, null, 2)}</pre>
            </section>
          ) : null}
        </section>
      </main>
    </div>
  );
}
