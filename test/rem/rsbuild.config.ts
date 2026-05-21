import { defineConfig } from '@rsbuild/core';
import { pluginRem } from '@rsbuild/plugin-rem';
import { pluginStylus } from '../../src';

export default defineConfig({
  plugins: [pluginStylus(), pluginRem()],
});
