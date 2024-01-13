/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    coverage: {
      all: true,
      exclude: ['src/index.ts'],
      include: ['src/**/*.ts'],
    },
    globals: true,
    root: './',
  },
})
