import esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['src/**/*.ts'],
  format: 'esm',
  loader: { '.ts': 'ts' },
  minify: true,
  outbase: 'src',
  outdir: 'dist',
  platform: 'node',
  sourcemap: false,
  target: ['esnext'],
});
