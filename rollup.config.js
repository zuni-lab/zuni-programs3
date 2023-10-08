import commonJS from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';
import virtual from '@rollup/plugin-virtual';
import visualizer from 'rollup-plugin-visualizer';

// Needed by fastfile
import { O_CREAT, O_EXCL, O_RDONLY, O_RDWR, O_TRUNC } from 'constants';

const empty = 'export default {}';
// We create a stub with these constants instead of including the entire constants definition
const constants = `
export const O_TRUNC = ${O_TRUNC};
export const O_CREAT = ${O_CREAT};
export const O_RDWR = ${O_RDWR};
export const O_EXCL = ${O_EXCL};
export const O_RDONLY = ${O_RDONLY}
`;

export default {
  input: 'main.ts',
  output: {
    // dir: 'dist',
    format: 'iife',
    sourcemap: 'inline',
    globals: {
      os: 'null',
    },
    name: 'zuni',
    file: 'dist/zuni.js',
  },
  plugins: [
    typescript(),
    json(),
    virtual({
      fs: empty,
      os: empty,
      crypto: empty,
      readline: empty,
      ejs: empty,
      events: empty,
      stream: empty,
      util: empty,
      constants: constants,
    }),
    nodeResolve({
      browser: true,
      preferBuiltins: false,
      exportConditions: ['browser', 'default', 'module', 'require'],
    }),
    commonJS(),
    replace({
      // The current default is false, but they are changing it next version
      preventAssignment: false,
      'process.browser': !!process.env.BROWSER,
    }),
    visualizer.visualizer({ filename: './dist/stats.html' }),
  ],
};
