import { defineConfig } from 'vite'
// https://vitejs.dev/config/
export default defineConfig({
  build: {
    minify: false,
    lib: {
      entry: 'src/lib.ts',
      name: 'QuartzGraphPlugin',
      fileName: 'quartz-graph-plugin',
      formats: ['umd'],
    },
    rollupOptions: {
      output: {
        preserveModules: false
      }
    }
  },
})
