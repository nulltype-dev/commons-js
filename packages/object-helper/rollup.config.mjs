import esbuild from 'rollup-plugin-esbuild'
import dts from 'rollup-plugin-dts'

export default [
  {
    input: './src/index.ts',
    output: {
      file: 'dist/index.cjs',
      format: 'cjs',
      sourcemap: false,
    },
    plugins: [esbuild()],
  },
  {
    input: './src/index.ts',
    output: {
      file: 'dist/index.mjs',
      format: 'esm',
      sourcemap: false,
    },
    plugins: [esbuild()],
  },
  {
    input: './src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },
]
