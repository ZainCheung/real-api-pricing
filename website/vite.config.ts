import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import { copyFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

function copyPricingData(): Plugin {
  const copy = () => {
    const destDir = resolve(__dirname, 'public/data')
    mkdirSync(destDir, { recursive: true })
    const pairs: [string, string][] = [
      [resolve(__dirname, '../derived/points.json'), resolve(destDir, 'points.json')],
      [resolve(__dirname, '../derived/points.csv'), resolve(destDir, 'points.csv')],
      [resolve(__dirname, '../data/adopted.csv'), resolve(destDir, 'adopted.csv')],
    ]
    for (const [src, dest] of pairs) {
      if (existsSync(src)) copyFileSync(src, dest)
    }
  }
  return {
    name: 'copy-pricing-data',
    buildStart: copy,
    configureServer() {
      copy()
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: env.VITE_BASE || '/',
    plugins: [
      copyPricingData(),
      TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
  }
})
