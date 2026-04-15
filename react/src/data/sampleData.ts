import type { ViewpointDataset } from '../types';

function makeThumb(title: string, color: string) {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 150">
    <defs>
      <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.95"/>
        <stop offset="100%" stop-color="#10233c" stop-opacity="1"/>
      </linearGradient>
    </defs>
    <rect width="240" height="150" rx="20" fill="url(#g)"/>
    <circle cx="188" cy="36" r="22" fill="rgba(255,255,255,0.18)"/>
    <path d="M78 116 L102 54 L120 42 L138 54 L162 116 Z" fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.64)" stroke-width="2"/>
    <path d="M90 116 L110 70 L121 60 L132 70 L148 116" fill="none" stroke="rgba(255,255,255,0.84)" stroke-width="3" stroke-linecap="round"/>
    <text x="24" y="128" fill="rgba(255,255,255,0.95)" font-size="26" font-family="Arial, sans-serif" font-weight="700">${title}</text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const frontThumb = makeThumb('正面全景', '#64B5F6');
const sideThumb = makeThumb('侧面轮廓', '#A78BFA');
const entranceThumb = makeThumb('入口关系', '#34D399');

export const sampleData: ViewpointDataset = {
  site: '龙象塔',
  summary: '示例数据用于演示高保真视角发现产品，包括语义空间、证据链和 3D camera 锚定。',
  clusters: [
    {
      id: 'front',
      name: '正面全景',
      semanticTag: '经典 / 稳妥',
      description: '完整呈现塔身与中轴关系，是 canonical viewpoint。',
      color: '#64B5F6',
      heat: 0.94,
      affordance: 0.76,
      cost: 2,
      uncertainty: 0.14,
      location: '主入口前广场',
      anchor: '中轴线前场',
      whyImportant: '适合首次到访者快速建立整体印象。',
      complement: '作为后续对比基线最稳定。',
      visibleElements: ['塔身全貌', '基座', '中轴对称', '树线前景'],
      recommendedFor: ['经典稳妥', '首次到访', '快速决策'],
      cameraCentroid: [1.410, -8.878, -1.557],
      cameraTarget: [0.784, -1.152, -1.999],
      thumbnail: "tempdata/龙象塔热点图/整体带碑1.jpg",
    },
    {
      id: 'side',
      name: '侧面轮廓',
      semanticTag: '低热 / 高价值',
      description: '揭示体量层次与转角关系，是典型被低估 viewpoint。',
      color: '#A78BFA',
      heat: 0.46,
      affordance: 0.88,
      cost: 4,
      uncertainty: 0.21,
      location: '东南侧步道',
      anchor: '转角树阵旁',
      whyImportant: '把平面正视转成体量关系观看。',
      complement: '相比正面，全景信息少但层次更丰富。',
      visibleElements: ['塔身层次', '转角关系', '屋檐退进', '侧向轮廓'],
      recommendedFor: ['出片独特', '建筑观察', '中阶用户'],
      cameraCentroid: [-0.483, -0.099, -5.555],
      cameraTarget: [-0.003, -1.359, -2.679]
      ,

      thumbnail: "tempdata/龙象塔热点图/氛围仰拍.jpg",
    },
    {
      id: 'entrance',
      name: '内部外摄',
      semanticTag: '空间导向',
      description: '展现塔外风光。',
      color: '#34D399',
      heat: 0.63,
      affordance: 0.68,
      cost: 1,
      uncertainty: 0.18,
      location: '入口门廊附近',
      anchor: '入口标识交接处',
      whyImportant: '把“塔内”与“塔外”联系起来。',
      complement: '相较全景更适合到场导航。',
      visibleElements: ['导向路径', '人与建筑比例', '近景关系'],
      recommendedFor: ['到场导航', '快速决策', '讲解开场'],
      cameraCentroid: [
        0.783,
        0.983,
        -0.803
      ],
      cameraTarget: [
        0.979,
        -0.803,
        0.075
      ],
      thumbnail: "tempdata/龙象塔热点图/内部拍窗.jpg",
    },
  ],
  posts: [
    {
      id: 'front-1',
      clusterId: 'front',
      title: '正面全景 #1',
      representative: true,
      caption: '站在前广场可以稳定拍到塔身全貌，几乎不会出错。',
      imageEmbedding: [0.88, 0.21, 0.16, 0.58, 0.22, 0.18, 0.12, 0.3],
      textEmbedding: [0.84, 0.25, 0.17, 0.52, 0.19, 0.24, 0.24, 0.38],
      fusionEmbedding: [0.8632, 0.2268, 0.1642, 0.5548, 0.2074, 0.2052, 0.1704, 0.3336],
      camera: { position: [0, -9.2, 1.7], target: [0, 0.5, 4.2] },
      visibleElements: ['塔身全貌', '基座', '中轴对称', '树线前景'],
      social: 0.95,
      uncertainty: 0.12,
      cost: 2,
      thumbnail: frontThumb,
      source: 'mock-front-1',
    },
    {
      id: 'side-1',
      clusterId: 'side',
      title: '侧面轮廓 #1',
      representative: true,
      caption: '侧面更能看出层层退台，照片会比正面更有体积感。',
      imageEmbedding: [0.31, 0.86, 0.16, 0.42, 0.56, 0.25, 0.31, 0.19],
      textEmbedding: [0.35, 0.78, 0.26, 0.37, 0.53, 0.29, 0.43, 0.28],
      fusionEmbedding: [0.3268, 0.8264, 0.202, 0.399, 0.5474, 0.2668, 0.3604, 0.2278],
      camera: { position: [8.2, 4.4, 1.7], target: [0.5, 0.2, 4.0] },
      visibleElements: ['塔身层次', '转角关系', '屋檐退进', '侧向轮廓'],
      social: 0.48,
      uncertainty: 0.22,
      cost: 4,
      thumbnail: sideThumb,
      source: 'mock-side-1',
    },
    {
      id: 'entrance-1',
      clusterId: 'entrance',
      title: '入口关系 #1',
      representative: true,
      caption: '这个角度虽然没有全景完整，但很适合现场判断路线。',
      imageEmbedding: [0.54, 0.22, 0.81, 0.36, 0.22, 0.7, 0.18, 0.48],
      textEmbedding: [0.49, 0.27, 0.77, 0.35, 0.31, 0.75, 0.2, 0.55],
      fusionEmbedding: [0.519, 0.241, 0.7932, 0.3558, 0.2578, 0.721, 0.1884, 0.5094],
      camera: { position: [-4.6, -6.2, 1.65], target: [-0.2, -0.4, 3.4] },
      visibleElements: ['入口门廊', '导向路径', '人与建筑比例', '近景关系'],
      social: 0.66,
      uncertainty: 0.18,
      cost: 1,
      thumbnail: entranceThumb,
      source: 'mock-entrance-1',
    },
  ],
};
