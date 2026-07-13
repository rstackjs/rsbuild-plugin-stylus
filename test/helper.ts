import { existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  createRsbuild,
  loadConfig,
  mergeRsbuildConfig,
  type RsbuildConfig,
} from '@rsbuild/core';
import {
  getDistFiles,
  getFileContent,
  getRandomPort,
  proxyConsole,
} from '@rstackjs/test-utils';
import type { Page } from 'playwright';

export { getFileContent, proxyConsole };

const hasConfigFile = (cwd: string) =>
  [
    'rsbuild.config.ts',
    'rsbuild.config.mts',
    'rsbuild.config.js',
    'rsbuild.config.mjs',
  ].some((filename) => existsSync(join(cwd, filename)));

export async function createRsbuildForTest(
  cwd: string,
  rsbuildConfig: RsbuildConfig = {},
) {
  const loadedConfig = hasConfigFile(cwd)
    ? (await loadConfig({ cwd })).content
    : {};

  return createRsbuild({
    cwd,
    rsbuildConfig: mergeRsbuildConfig(
      {
        server: {
          port: await getRandomPort(),
        },
        performance: {
          buildCache: false,
        },
      },
      loadedConfig,
      rsbuildConfig,
    ),
  });
}

export const normalizeCss = (content: string) =>
  content.replace(/\s+/g, '').replace(/;}/g, '}');

export async function build(cwd: string, rsbuildConfig?: RsbuildConfig) {
  const rsbuild = await createRsbuildForTest(cwd, rsbuildConfig);
  await rsbuild.build();
  return {
    rsbuild,
    files: await getDistFiles(rsbuild.context.distPath),
  };
}

export async function runDevAndPreview(
  page: Page,
  cwd: string,
  assert: (context: {
    mode: 'dev' | 'build';
    files?: Record<string, string>;
  }) => Promise<void>,
) {
  const devRsbuild = await createRsbuildForTest(cwd);
  const devServer = await devRsbuild.startDevServer();

  try {
    await page.goto(devServer.urls[0]);
    await assert({ mode: 'dev' });
  } finally {
    await devServer.server.close();
  }

  const previewRsbuild = await createRsbuildForTest(cwd);
  await previewRsbuild.build();
  const files = await getDistFiles(previewRsbuild.context.distPath);
  const previewServer = await previewRsbuild.preview();

  try {
    await page.goto(previewServer.urls[0]);
    await assert({ mode: 'build', files });
  } finally {
    await previewServer.server.close();
  }
}
