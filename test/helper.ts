import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import net from 'node:net';
import { join } from 'node:path';
import { stripVTControlCharacters as stripAnsi } from 'node:util';
import {
  createRsbuild,
  loadConfig,
  mergeRsbuildConfig,
  type RsbuildConfig,
} from '@rsbuild/core';
import type { Page } from 'playwright';

const portMap = new Set<number>();

function isPortAvailable(port: number) {
  return new Promise<boolean>((resolve) => {
    const server = net.createServer();

    server.once('error', () => {
      resolve(false);
    });
    server.once('listening', () => {
      server.close(() => {
        resolve(true);
      });
    });
    server.listen(port);
  });
}

export async function getRandomPort(
  defaultPort = Math.ceil(Math.random() * 30000) + 15000,
) {
  let port = defaultPort;
  while (true) {
    if (!portMap.has(port) && (await isPortAvailable(port))) {
      portMap.add(port);
      return port;
    }
    port++;
  }
}

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

export function getDistFiles(distPath: string) {
  const files: Record<string, string> = {};

  const readDir = (dir: string) => {
    for (const filename of readdirSync(dir)) {
      const filePath = join(dir, filename);
      const stat = statSync(filePath);
      if (stat.isDirectory()) {
        readDir(filePath);
      } else if (!filePath.endsWith('.map')) {
        files[filePath] = readFileSync(filePath, 'utf-8');
      }
    }
  };

  readDir(distPath);
  return files;
}

export function getFileContent(files: Record<string, string>, matcher: string) {
  const file = Object.keys(files).find((filename) =>
    matcher.startsWith('.')
      ? filename.endsWith(matcher)
      : filename.includes(matcher),
  );

  if (!file) {
    throw new Error(`Can not find file: ${matcher}`);
  }

  return files[file];
}

export const normalizeCss = (content: string) =>
  content.replace(/\s+/g, '').replace(/;}/g, '}');

export async function build(cwd: string, rsbuildConfig?: RsbuildConfig) {
  const rsbuild = await createRsbuildForTest(cwd, rsbuildConfig);
  await rsbuild.build();
  return {
    rsbuild,
    files: getDistFiles(rsbuild.context.distPath),
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
  const files = getDistFiles(previewRsbuild.context.distPath);
  const previewServer = await previewRsbuild.preview();

  try {
    await page.goto(previewServer.urls[0]);
    await assert({ mode: 'build', files });
  } finally {
    await previewServer.server.close();
  }
}

export function proxyConsole() {
  const logs: string[] = [];
  const restores: Array<() => void> = [];
  const types = ['log', 'warn', 'info', 'error'] as const;

  for (const type of types) {
    const method = console[type];
    restores.push(() => {
      console[type] = method;
    });
    console[type] = (...args: unknown[]) => {
      logs.push(
        stripAnsi(
          args
            .map((arg) =>
              typeof arg === 'string' ? arg : JSON.stringify(arg, null, 2),
            )
            .join(' '),
        ),
      );
    };
  }

  return {
    logs,
    restore: () => {
      for (const restore of restores) {
        restore();
      }
    },
  };
}
