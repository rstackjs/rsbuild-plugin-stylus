// Configuration guide: https://rstack.rs/config
import { define } from 'rstack';

define.lib({
  syntax: 'es2023',
  dts: true,
});

define.test({
  env: {
    // Let Rsbuild choose the mode based on the command.
    NODE_ENV: undefined,
  },
  isolate: false,
  testTimeout: 15_000,
});

define.fmt({
  singleQuote: true,
});

define.staged({
  '*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}': ['rs lint --fix', 'rs fmt'],
  '*.{json,md,mdx,css,scss,less,html,yml,yaml}': 'rs fmt',
});

define.lint(({ js, ts }) => [js.configs.recommended, ts.configs.recommended]);
