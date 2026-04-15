# Viewpoint Explorer Product Bundle

这份交付基于你上传的 HTML 原型进一步产品化而来，原始参考文件为 `viewpoint_prototype(1).html` fileciteturn1file0。

## 包含内容

- `viewpoint_explorer_hifi.html`
  - 更像正式产品的高保真本地 demo
  - 支持导入真实 JSON
  - 保留双空间联动、证据解释、3D camera 表达

- `react/`
  - 可拆分到 React 项目的组件版
  - 适合作为 Vite + React 起点
  - 已拆出 `ClusterCard`、`DetailPanel`、`JsonImporter`、`StatCard`

- `real_data_template.json`
  - 真实数据接入模板
  - 用你自己的聚类结果、embedding、camera 坐标替换即可

## 推荐使用方式

### 1. 先看高保真本地版

直接打开：
- `viewpoint_explorer_hifi.html`

### 2. 再转进 React 项目

进入 `react/` 后执行：

```bash
npm install
npm run dev
```

### 3. 接真实数据

你只要保持以下三层结构：

- `site`
- `clusters[]`
- `posts[]`

其中最关键的是：

- cluster 层提供 viewpoint 语义与空间锚点
- post 层提供单帖级 embedding、caption、camera
- `clusterId` 把 post 和 cluster 对齐

## 下一轮我建议优先做的三件事

1. 把你真实 JSON 贴进模板并跑通
2. 把高保真 HTML 的视觉语言迁移进 React 版
3. 把 React 版的 `Spatial stage placeholder` 换成你仓库里的 Three / splat 场景
