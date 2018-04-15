import path from 'path';

import typescript from 'rollup-plugin-typescript2';
import filesize from 'rollup-plugin-filesize';

import pkg from './package.json';

const input = path.join(__dirname, 'src', 'index.ts');
const output = path.join(__dirname, 'dist');
const banner = `
/**
  Version: ${pkg.version}
**/`;

const formats = ['umd', 'es'];

export default {
  input: input,
  output: formats.map((format) => {
    return {
      name: 'JSONApiClient',
      file: path.join(output, `index.${format}.js`),
      format: format,
      sourcemap: true,
      banner: banner,
      globals: {
        axios: 'axios'
      }
    };
  }),
  external: ['axios'],
  plugins: [
    typescript({
      tsconfigOverride: {
        compilerOptions: {
          module: 'ES2015'
        }
      }
    }),
    filesize()
  ]
};
