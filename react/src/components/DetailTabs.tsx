import { useMemo } from 'react';
import type { Cluster, Post } from '../types';

export type DetailTabKey = 'overview' | 'evidence' | 'compare' | 'debug';

interface DetailTabsProps {
  cluster: Cluster;
  posts: Post[];
  compareCluster?: Cluster;
  comparePosts?: Post[];
  activeTab: DetailTabKey;
  onTabChange: (tab: DetailTabKey) => void;
  onSelectCompare: (clusterId: string) => void;
  compareOptions: Cluster[];
}

function metricPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function distance(
  a: [number, number, number],
  b: [number, number, number],
) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function pitch(
  position: [number, number, number],
  target: [number, number, number],
) {
  const dx = target[0] - position[0];
  const dy = target[1] - position[1];
  const dz = target[2] - position[2];
  const planar = Math.sqrt(dx * dx + dy * dy);
  return Math.atan2(dz, planar) * (180 / Math.PI);
}

function uniqueFeatureRows(posts: Post[]) {
  return Array.from(new Set(posts.flatMap((item) => item.visibleElements))).slice(0, 8);
}

function compareSentence(current: Cluster, target?: Cluster) {
  if (!target) return '请选择一个 viewpoint 作为对比对象。';
  const heatDiff = current.heat - target.heat;
  const affordanceDiff = current.affordance - target.affordance;
  const costDiff = current.cost - target.cost;

  const heatText = heatDiff > 0.08 ? '更主流' : heatDiff < -0.08 ? '更偏小众' : '热度接近';
  const affordanceText = affordanceDiff > 0.08 ? '解释收益更高' : affordanceDiff < -0.08 ? '解释收益更弱' : '解释收益相近';
  const costText = costDiff > 0.8 ? '访问成本更高' : costDiff < -0.8 ? '访问成本更低' : '访问成本接近';

  return `相较于「${target.name}」，当前 viewpoint ${heatText}，${affordanceText}，且${costText}。`;
}

export function DetailTabs({
  cluster,
  posts,
  compareCluster,
  comparePosts = [],
  activeTab,
  onTabChange,
  onSelectCompare,
  compareOptions,
}: DetailTabsProps) {
  const representativePosts = useMemo(
    () => [...posts].sort((a, b) => Number(Boolean(b.representative)) - Number(Boolean(a.representative)) || b.social - a.social),
    [posts],
  );

  const featureRows = useMemo(() => uniqueFeatureRows(representativePosts), [representativePosts]);

  const cameraDistance = distance(cluster.cameraCentroid, cluster.cameraTarget).toFixed(2);
  const cameraPitch = pitch(cluster.cameraCentroid, cluster.cameraTarget).toFixed(1);

  return (
    <div className="ve-detail-scroll refined">
      <div className="ve-tabs-head">
        {[
          ['overview', 'Overview'],
          ['evidence', 'Evidence'],
          ['compare', 'Compare'],
          ['debug', 'Debug'],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`ve-tab-button ${activeTab === key ? 'active' : ''}`}
            onClick={() => onTabChange(key as DetailTabKey)}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' ? (
        <div className="ve-tab-panel">
          <div className="ve-detail-top refined">
            <div className="ve-detail-visual refined">
              {cluster.thumbnail ? <img src={cluster.thumbnail} alt={cluster.name} className="ve-detail-image" /> : <div className="ve-detail-thumb" />}
            </div>
            <div className="ve-detail-summary refined">
              <div className="ve-detail-kicker">当前联动对象</div>
              <h3>{cluster.name}</h3>
              <p>{cluster.description}</p>
              <div className="ve-chip-row">
                <span className="ve-chip">{cluster.location}</span>
                <span className="ve-chip">{cluster.semanticTag}</span>
                <span className="ve-chip">绕路 {cluster.cost} 分钟</span>
              </div>
            </div>
          </div>

          <div className="ve-detail-grid refined four-up">
            <section className="ve-section">
              <h4>摘要卡</h4>
              <div className="ve-stat-list">
                <div><span>空间位置</span><strong>{cluster.location}</strong></div>
                <div><span>推荐人群</span><strong>{cluster.recommendedFor.join(' / ')}</strong></div>
                <div><span>语义标签</span><strong>{cluster.semanticTag}</strong></div>
              </div>
            </section>

            <section className="ve-section">
              <h4>证据卡</h4>
              <div className="ve-evidence-item"><strong>看到什么</strong><span>{cluster.visibleElements.join('、')}</span></div>
              <div className="ve-evidence-item"><strong>为什么重要</strong><span>{cluster.whyImportant}</span></div>
              <div className="ve-evidence-item"><strong>补充什么</strong><span>{cluster.complement}</span></div>
              <div className="ve-evidence-item"><strong>空间锚定</strong><span>{cluster.anchor}</span></div>
            </section>

            <section className="ve-section">
              <h4>指标卡</h4>
              <div className="ve-metric-row">
                <span>热度</span>
                <strong>{Math.round(cluster.heat * 100)}</strong>
                <div className="ve-meter"><div style={{ width: metricPercent(cluster.heat) }} /></div>
              </div>
              <div className="ve-metric-row">
                <span>语义收益</span>
                <strong>{Math.round(cluster.affordance * 100)}</strong>
                <div className="ve-meter affordance"><div style={{ width: metricPercent(cluster.affordance) }} /></div>
              </div>
              <div className="ve-metric-row">
                <span>不确定性</span>
                <strong>{Math.round(cluster.uncertainty * 100)}%</strong>
                <div className="ve-meter uncertainty"><div style={{ width: metricPercent(cluster.uncertainty) }} /></div>
              </div>
              <div className="ve-metric-row">
                <span>访问成本</span>
                <strong>{cluster.cost}m</strong>
                <div className="ve-meter cost"><div style={{ width: `${Math.min(cluster.cost / 6, 1) * 100}%` }} /></div>
              </div>
            </section>

            <section className="ve-section">
              <h4>几何卡</h4>
              <div className="ve-evidence-item"><strong>默认 position</strong><span className="ve-mono">[{cluster.cameraCentroid.join(', ')}]</span></div>
              <div className="ve-evidence-item"><strong>默认 target</strong><span className="ve-mono">[{cluster.cameraTarget.join(', ')}]</span></div>
              <div className="ve-evidence-item"><strong>相机距离</strong><span>{cameraDistance}</span></div>
              <div className="ve-evidence-item"><strong>俯仰角</strong><span>{cameraPitch}°</span></div>
            </section>
          </div>
        </div>
      ) : null}

      {activeTab === 'evidence' ? (
        <div className="ve-tab-panel">
          <section className="ve-section">
            <div className="ve-section-row-head">
              <h4>Evidence strip</h4>
              <span>{representativePosts.length} 张证据图</span>
            </div>

            <div className="ve-post-strip refined ve-post-strip-scroll">
              {representativePosts.map((post) => (
                <button key={post.id} type="button" className="ve-post-card active">
                  <div className="ve-post-thumb-wrap">
                    {post.thumbnail ? <img src={post.thumbnail} alt={post.title} className="ve-post-thumb" /> : <div className="ve-post-thumb placeholder" />}
                  </div>
                  <div className="ve-post-meta">
                    <strong>{post.title}</strong>
                    <span>{post.caption}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="ve-section top-gap">
            <div className="ve-section-row-head">
              <h4>Feature matrix</h4>
              <span>图像-特征关系</span>
            </div>

            <div className="ve-matrix-wrap">
              <div className="ve-matrix-grid" style={{ gridTemplateColumns: `160px repeat(${Math.max(representativePosts.length, 1)}, minmax(48px, 1fr))` }}>
                <div className="ve-matrix-cell head" />
                {representativePosts.map((post, index) => (
                  <div key={post.id} className="ve-matrix-cell head">{index + 1}</div>
                ))}

                {featureRows.map((feature) => (
                  <>
                    <div key={`${feature}-label`} className="ve-matrix-cell label">{feature}</div>
                    {representativePosts.map((post) => (
                      <div key={`${feature}-${post.id}`} className="ve-matrix-cell">
                        {post.visibleElements.includes(feature) ? <span className="ve-matrix-dot" /> : <span className="ve-matrix-empty" />}
                      </div>
                    ))}
                  </>
                ))}
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {activeTab === 'compare' ? (
        <div className="ve-tab-panel">
          <section className="ve-section">
            <div className="ve-section-row-head">
              <h4>Compare target</h4>
              <span>选择另一个 viewpoint</span>
            </div>

            <div className="ve-filter-row facet no-pad">
              {compareOptions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`ve-filter-chip ${compareCluster?.id === item.id ? 'active' : ''}`}
                  onClick={() => onSelectCompare(item.id)}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </section>

          <section className="ve-section top-gap">
            <div className="ve-section-row-head">
              <h4>Difference summary</h4>
              <span>主流 / 小众 / 成本 / 解释收益</span>
            </div>

            <p className="ve-compare-copy">{compareSentence(cluster, compareCluster)}</p>

            {compareCluster ? (
              <div className="ve-compare-grid">
                <div className="ve-compare-col">
                  <div className="ve-compare-title">{cluster.name}</div>
                  <div className="ve-compare-item"><span>热度</span><strong>{Math.round(cluster.heat * 100)}</strong></div>
                  <div className="ve-compare-item"><span>收益</span><strong>{Math.round(cluster.affordance * 100)}</strong></div>
                  <div className="ve-compare-item"><span>成本</span><strong>{cluster.cost}m</strong></div>
                  <div className="ve-compare-item"><span>空间位置</span><strong>{cluster.location}</strong></div>
                </div>

                <div className="ve-compare-col">
                  <div className="ve-compare-title">{compareCluster.name}</div>
                  <div className="ve-compare-item"><span>热度</span><strong>{Math.round(compareCluster.heat * 100)}</strong></div>
                  <div className="ve-compare-item"><span>收益</span><strong>{Math.round(compareCluster.affordance * 100)}</strong></div>
                  <div className="ve-compare-item"><span>成本</span><strong>{compareCluster.cost}m</strong></div>
                  <div className="ve-compare-item"><span>空间位置</span><strong>{compareCluster.location}</strong></div>
                </div>
              </div>
            ) : null}
          </section>

          {comparePosts.length ? (
            <section className="ve-section top-gap">
              <div className="ve-section-row-head">
                <h4>Compare evidence</h4>
                <span>{comparePosts.length} 张对比证据</span>
              </div>

              <div className="ve-post-strip refined ve-post-strip-scroll">
                {comparePosts.map((post) => (
                  <div key={post.id} className="ve-post-card">
                    <div className="ve-post-thumb-wrap">
                      {post.thumbnail ? <img src={post.thumbnail} alt={post.title} className="ve-post-thumb" /> : <div className="ve-post-thumb placeholder" />}
                    </div>
                    <div className="ve-post-meta">
                      <strong>{post.title}</strong>
                      <span>{post.caption}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ) : null}

      {activeTab === 'debug' ? (
        <div className="ve-tab-panel">
          <section className="ve-section">
            <div className="ve-section-row-head">
              <h4>Debug guidance</h4>
              <span>调试区在中间 3D Viewer</span>
            </div>

            <div className="ve-evidence-item">
              <strong>当前对象</strong>
              <span>{cluster.name}</span>
            </div>
            <div className="ve-evidence-item">
              <strong>原始 position</strong>
              <span className="ve-mono">[{cluster.cameraCentroid.join(', ')}]</span>
            </div>
            <div className="ve-evidence-item">
              <strong>原始 target</strong>
              <span className="ve-mono">[{cluster.cameraTarget.join(', ')}]</span>
            </div>
            <div className="ve-evidence-item">
              <strong>建议流程</strong>
              <span>在中间场景中自由拖拽视角 → 读取当前 camera → 保存为该 viewpoint 默认视角。</span>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}