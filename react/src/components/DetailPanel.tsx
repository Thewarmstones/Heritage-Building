import type { Cluster } from '../types';

export function DetailPanel({ cluster }: { cluster: Cluster }) {
  return (
    <div className="ve-detail-scroll refined">
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
            <div className="ve-meter"><div style={{ width: `${cluster.heat * 100}%` }} /></div>
          </div>
          <div className="ve-metric-row">
            <span>语义收益</span>
            <strong>{Math.round(cluster.affordance * 100)}</strong>
            <div className="ve-meter affordance"><div style={{ width: `${cluster.affordance * 100}%` }} /></div>
          </div>
          <div className="ve-metric-row">
            <span>不确定性</span>
            <strong>{Math.round(cluster.uncertainty * 100)}%</strong>
            <div className="ve-meter uncertainty"><div style={{ width: `${cluster.uncertainty * 100}%` }} /></div>
          </div>
          <div className="ve-metric-row">
            <span>访问成本</span>
            <strong>{cluster.cost}m</strong>
            <div className="ve-meter cost"><div style={{ width: `${Math.min(cluster.cost / 6, 1) * 100}%` }} /></div>
          </div>
        </section>

        <section className="ve-section">
          <h4>相机卡</h4>
          <div className="ve-evidence-item"><strong>默认 position</strong><span className="ve-mono">[{cluster.cameraCentroid.join(', ')}]</span></div>
          <div className="ve-evidence-item"><strong>默认 target</strong><span className="ve-mono">[{cluster.cameraTarget.join(', ')}]</span></div>
          <div className="ve-evidence-item"><strong>分析对象</strong><span>仅展示 viewpoint 层，不展开 post 层内容。</span></div>
        </section>
      </div>
    </div>
  );
}
