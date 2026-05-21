import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    { syntax: 'es2023', dts: true },
    { format: 'cjs', syntax: 'es2023' },
  ],
});
