import { defineConfig } from '@rsbuild/core';
import { pluginStylus } from '../../src';

export default defineConfig({
  environments: {
    web: {
      plugins: [pluginStylus()],
    },
  },
});
