import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls, Splat } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { Cluster } from '../types';

interface SpatialStageProps {
  clusters: Cluster[];
  selectedClusterId?: string;
  onUpdateClusterCamera?: (clusterId: string, camera: CameraSnapshot) => void;
}

type CameraSnapshot = {
  position: [number, number, number];
  target: [number, number, number];
};

function worldToData(vec: THREE.Vector3): [number, number, number] {
  return [Number(vec.x.toFixed(3)), Number(vec.z.toFixed(3)), Number(vec.y.toFixed(3))];
}

function dataToWorld(position: [number, number, number]): [number, number, number] {
  return [position[0], position[2], position[1]];
}

function CameraObserver({
  controlsRef,
  onCameraChange,
}: {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  onCameraChange: (snapshot: CameraSnapshot) => void;
}) {
  const { camera } = useThree();
  const lastSerialized = useRef('');

  useFrame(() => {
    const target = controlsRef.current?.target ?? new THREE.Vector3(0, 0, 0);
    const next = {
      position: worldToData(camera.position),
      target: worldToData(target),
    };
    const serialized = JSON.stringify(next);
    if (serialized !== lastSerialized.current) {
      lastSerialized.current = serialized;
      onCameraChange(next);
    }
  });

  return null;
}

function SmoothCameraRig({
  selectedCluster,
  autoFocus,
  controlsRef,
}: {
  selectedCluster?: Cluster;
  autoFocus: boolean;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}) {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3(10, 6, 10));
  const lookAtTarget = useRef(new THREE.Vector3(0, 2, 0));

  useEffect(() => {
    if (!autoFocus || !selectedCluster?.cameraCentroid) return;
    const [px, py, pz] = dataToWorld(selectedCluster.cameraCentroid);
    const [tx, ty, tz] = dataToWorld(selectedCluster.cameraTarget);
    targetPosition.current.set(px, py, pz);
    lookAtTarget.current.set(tx, ty, tz);
  }, [autoFocus, selectedCluster]);

  useFrame(() => {
    if (!autoFocus) return;
    camera.position.lerp(targetPosition.current, 0.08);
    const currentTarget = controlsRef.current?.target ?? new THREE.Vector3();
    currentTarget.lerp(lookAtTarget.current, 0.08);
    controlsRef.current?.target.copy(currentTarget);
    controlsRef.current?.update();
  });

  return null;
}

function GroundGrid() {
  const lines = [];
  for (let i = -20; i <= 20; i += 2) {
    lines.push(
      <line key={`x-${i}`}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={2} array={new Float32Array([i, 0, -20, i, 0, 20])} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color="#b8aa88" transparent opacity={0.28} />
      </line>,
    );
    lines.push(
      <line key={`z-${i}`}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={2} array={new Float32Array([-20, 0, i, 20, 0, i])} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color="#b8aa88" transparent opacity={0.28} />
      </line>,
    );
  }
  return <group>{lines}</group>;
}

function ClusterAnchors({
  clusters,
  selectedClusterId,
  visible,
  showLabels,
}: {
  clusters: Cluster[];
  selectedClusterId?: string;
  visible: boolean;
  showLabels: boolean;
}) {
  if (!visible) return null;
  return (
    <group>
      {clusters.map((cluster) => {
        const [x, y, z] = cluster.cameraCentroid;
        const active = cluster.id === selectedClusterId;
        return (
          <group key={cluster.id} position={[x, z, y]}>
            <mesh rotation={[0, 0, Math.PI / 4]}>
              <boxGeometry args={[active ? 0.7 : 0.45, active ? 0.7 : 0.45, active ? 0.7 : 0.45]} />
              <meshStandardMaterial
                color={cluster.color}
                emissive={cluster.color}
                emissiveIntensity={active ? 1.1 : 0.28}
                transparent
                opacity={active ? 0.9 : 0.55}
              />
            </mesh>
            {showLabels ? (
              <Html distanceFactor={11} position={[0, active ? 1.1 : 0.8, 0]} center>
                <div className={`ve-marker-label ${active ? 'active' : ''}`}>{cluster.name}</div>
              </Html>
            ) : null}
          </group>
        );
      })}
    </group>
  );
}

function ModelContent({ modelUrl }: { modelUrl?: string }) {
  if (!modelUrl) {
    return (
      <Html center>
        <div className="ve-stage-overlay-card">还没有加载 3DGS 文件</div>
      </Html>
    );
  }

  const lower = modelUrl.toLowerCase();
  const isSplat = lower.includes('.splat') || lower.startsWith('blob:');

  if (!isSplat) {
    return (
      <Html center>
        <div className="ve-stage-overlay-card">
          当前演示版优先支持 <code>.splat</code> 文件。<br />
          你现在加载的不是 .splat，可先转换后再接入。
        </div>
      </Html>
    );
  }

  return (
    <Suspense
      fallback={
        <Html center>
          <div className="ve-stage-overlay-card">3DGS 模型加载中…</div>
        </Html>
      }
    >
      <Splat src={modelUrl} />
    </Suspense>
  );
}

function formatVector(vector: [number, number, number]) {
  return `[${vector.map((value) => value.toFixed(3)).join(', ')}]`;
}

export function SpatialStage({ clusters, selectedClusterId, onUpdateClusterCamera }: SpatialStageProps) {
  const [modelUrl, setModelUrl] = useState('');
  const [pathInput, setPathInput] = useState('drone/longxiangta/1.splat');
  const [showClusterAnchors, setShowClusterAnchors] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [autoFocus, setAutoFocus] = useState(true);
  const [liveCamera, setLiveCamera] = useState<CameraSnapshot>({ position: [10, 10, 6], target: [0, 0, 0] });
  const [copied, setCopied] = useState(false);
  const [showCameraDebugger, setShowCameraDebugger] = useState(true);
  const fileObjectUrlRef = useRef<string | null>(null);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  const selectedCluster = useMemo(
    () => clusters.find((item) => item.id === selectedClusterId) ?? clusters[0],
    [clusters, selectedClusterId],
  );

  const targetCamera = useMemo<CameraSnapshot | null>(() => {
    if (!selectedCluster) return null;
    return { position: selectedCluster.cameraCentroid, target: selectedCluster.cameraTarget };
  }, [selectedCluster]);

  useEffect(() => {
    return () => {
      if (fileObjectUrlRef.current) {
        URL.revokeObjectURL(fileObjectUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setCopied(false);
  }, [selectedClusterId]);

  const handleApplyCurrentView = () => {
    if (selectedCluster) {
      onUpdateClusterCamera?.(selectedCluster.id, liveCamera);
    }
  };

  const handleRestoreTarget = () => {
    if (!targetCamera || !controlsRef.current) return;
    setAutoFocus(false);
    const [px, py, pz] = dataToWorld(targetCamera.position);
    const [tx, ty, tz] = dataToWorld(targetCamera.target);
    controlsRef.current.object.position.set(px, py, pz);
    controlsRef.current.target.set(tx, ty, tz);
    controlsRef.current.update();
  };

  const handleCopyJson = async () => {
    const payload = JSON.stringify(liveCamera, null, 2);
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="ve-stage-shell refined">
      <div className="ve-stage-toolbar refined heritage">
        <input
          className="ve-input"
          value={pathInput}
          onChange={(event) => setPathInput(event.target.value)}
          placeholder="输入 public 下的 .splat 路径，例如 /models/scene.splat"
        />
        <button type="button" className="ve-button ve-button-primary" onClick={() => setModelUrl(pathInput.trim())}>
          加载路径
        </button>
        <label className="ve-button ve-file-button">
          选择本地 .splat
          <input
            type="file"
            accept=".splat"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              if (fileObjectUrlRef.current) URL.revokeObjectURL(fileObjectUrlRef.current);
              const url = URL.createObjectURL(file);
              fileObjectUrlRef.current = url;
              setModelUrl(url);
              setPathInput(file.name);
            }}
          />
        </label>
        <button type="button" className={`ve-toggle-button ${showClusterAnchors ? 'active' : ''}`} onClick={() => setShowClusterAnchors((v) => !v)}>
          锚点
        </button>
        <button type="button" className={`ve-toggle-button ${showLabels ? 'active' : ''}`} onClick={() => setShowLabels((v) => !v)}>
          标签
        </button>
        <button type="button" className={`ve-toggle-button ${autoFocus ? 'active' : ''}`} onClick={() => setAutoFocus((v) => !v)}>
          自动聚焦
        </button>
        <button type="button" className={`ve-toggle-button ${showCameraDebugger ? 'active' : ''}`} onClick={() => setShowCameraDebugger((v) => !v)}>
          调试面板 {showCameraDebugger ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="ve-stage-canvas-wrap refined heritage viewpoint-only">
        <div className="ve-stage-hud heritage">
          <div className="ve-stage-hud-title">{selectedCluster?.name ?? '未选择 viewpoint'}</div>
          <div className="ve-stage-hud-sub">{selectedCluster?.location ?? '未绑定空间标签'} · viewpoint-only</div>
        </div>

        {showCameraDebugger ? (
          <div className="ve-camera-debugger floating heritage">
            <div className="ve-camera-debugger-head">
              <div>
                <div className="ve-preview-kicker">Camera capture</div>
                <strong>手动拖拽后直接保存为 viewpoint</strong>
              </div>
              <button type="button" className="ve-button ve-button-small" onClick={() => setShowCameraDebugger(false)}>
                隐藏
              </button>
            </div>

            <div className="ve-camera-block">
              <span>当前读取位置 position</span>
              <code>{formatVector(liveCamera.position)}</code>
            </div>
            <div className="ve-camera-block">
              <span>当前读取朝向 target</span>
              <code>{formatVector(liveCamera.target)}</code>
            </div>
            <div className="ve-camera-block subtle">
              <span>当前目标对象</span>
              <code>{selectedCluster?.name ?? '未选中 viewpoint'}</code>
            </div>
            <div className="ve-camera-block subtle">
              <span>viewpoint 原始参数</span>
              <code>{targetCamera ? JSON.stringify(targetCamera) : '暂无'}</code>
            </div>

            <div className="ve-camera-actions">
              <button type="button" className="ve-button ve-button-primary" onClick={handleApplyCurrentView}>
                保存为该 viewpoint 默认视角
              </button>
              <button type="button" className="ve-button" onClick={handleRestoreTarget}>
                跳回 viewpoint 原始视角
              </button>
              <button type="button" className="ve-button" onClick={handleCopyJson}>
                {copied ? '已复制 JSON' : '复制当前 JSON'}
              </button>
            </div>
          </div>
        ) : (
          <button type="button" className="ve-debug-fab" onClick={() => setShowCameraDebugger(true)}>
            显示调试器
          </button>
        )}

        <Canvas camera={{ position: [10, 6, 10], fov: 45 }} dpr={[1, 1.5]} gl={{ antialias: false }}>
          <color attach="background" args={['#f6f1e7']} />
          <ambientLight intensity={1.45} />
          <directionalLight position={[8, 10, 6]} intensity={1.15} color="#fff7e8" />
          <directionalLight position={[-6, 8, -4]} intensity={0.45} color="#efe3c7" />
          <GroundGrid />
          <ModelContent modelUrl={modelUrl} />
          <ClusterAnchors
            clusters={clusters}
            selectedClusterId={selectedClusterId}
            visible={showClusterAnchors}
            showLabels={showLabels}
          />
          <SmoothCameraRig selectedCluster={selectedCluster} autoFocus={autoFocus} controlsRef={controlsRef} />
          <CameraObserver controlsRef={controlsRef} onCameraChange={setLiveCamera} />
          <OrbitControls ref={controlsRef} makeDefault enablePan enableDamping dampingFactor={0.08} minDistance={2} maxDistance={80} onStart={() => setAutoFocus(false)} />
        </Canvas>

        <div className="ve-stage-note heritage">
          当前前端仅保留 viewpoint 层操作：先打开模型，自由拖动到满意视角；右侧会实时读取当前位置与朝向；确认后点击“保存为该 viewpoint 默认视角”即可直接写回数据。
        </div>
      </div>
    </div>
  );
}
