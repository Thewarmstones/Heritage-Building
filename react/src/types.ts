export interface Cluster {
  id: string;
  name: string;
  semanticTag: string;
  description: string;
  color: string;
  heat: number;
  affordance: number;
  cost: number;
  uncertainty: number;
  location: string;
  anchor: string;
  whyImportant: string;
  complement: string;
  visibleElements: string[];
  recommendedFor: string[];
  cameraCentroid: [number, number, number];
  cameraTarget: [number, number, number];
  thumbnail?: string;
}

export interface Post {
  id: string;
  clusterId: string;
  title: string;
  representative?: boolean;
  caption: string;
  imageEmbedding: number[];
  textEmbedding: number[];
  fusionEmbedding: number[];
  camera: {
    position: [number, number, number];
    target: [number, number, number];
  };
  visibleElements: string[];
  social: number;
  uncertainty: number;
  cost: number;
  thumbnail?: string;
  source: string;
}

export interface ViewpointDataset {
  site: string;
  summary: string;
  clusters: Cluster[];
  posts: Post[];
}
