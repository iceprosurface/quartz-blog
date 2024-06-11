# quartz-graph-plugin

Add support for canvas graphs renderer in Quartz.

## Installation

Currently, the plugin cannot install on npm, so you will need to copy the `dist/quartz-graph-plugin.js` file into your Quartz project.

## Usage

```typescript
window.QuartzGraphPlugin.renderGraph(graph, {
  onNodeClick: (node: NodeData) => {
    const targ = resolveRelative(fullSlug, node.id)
    window.spaNavigate(new URL(targ, window.location.toString()))
  },
  graphData,
  slug,
  visited,
  drag: enableDrag,
  zoom: enableZoom,
  depth,
  scale,
  repelForce,
  centerForce,
  linkDistance,
  fontSize,
  opacityScale,
  focusOnHover,
})
```

## Supported Features

+ [x] Render graph
+ [x] Drag and zoom
+ [x] Click on node to navigate
+ [x] Hover on node to focus
+ [ ] Customizable settings for force graph
  + [ ] Repel force
  + [ ] Center force
  + [ ] Link distance
  + [ ] Font size
  + [ ] Opacity scale
+ [ ] Customizable settings for interaction
  + [ ] Drag
  + [ ] Zoom
