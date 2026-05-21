import { defineConfig } from '@rsbuild/core';
import { pluginStylus } from '../../src';

export default defineConfig({
  plugins: [pluginStylus()],
});
