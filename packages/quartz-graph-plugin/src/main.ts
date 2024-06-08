import { renderGraph } from './lib'
// import testJson from './test.json'
import verylarge from './very-large-text.json'
renderGraph(document.getElementById('app')!, {
  graphData: verylarge,
  onNodeClick: (node) => {
    console.log(node)
  },
  slug: '/',
  visited: new Set<string>(),
  // "drag": true,
  // "zoom": true,
  "depth": -1, "scale": 0.9, "repelForce": 0.5, "centerForce": 0.3, "linkDistance": 30, "fontSize": 0.6, "opacityScale": 1,
  // "showTags": true,
  // "removeTags": [],
  "focusOnHover": true
})