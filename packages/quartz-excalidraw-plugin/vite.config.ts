import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact()],
  define: {
    "process.env.IS_PREACT": JSON.stringify("true"),
    "process.env.NODE_ENV": JSON.stringify("production")
  },
  build: {
    minify: false,
    lib: {
      entry: 'src/lib.tsx',
      name: 'QuartzExcalidrawPlugin',
      fileName: 'quartz-excalidraw-plugin',
    }
  }
})
