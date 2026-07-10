import { expect, test } from '@rstest/playwright';
import { createRsbuildForTest, proxyConsole } from '../helper';

test('should print Stylus plugin hints as expected', async () => {
  const { logs, restore } = proxyConsole();

  try {
    const rsbuild = await createRsbuildForTest(import.meta.dirname);

    await expect(rsbuild.build()).rejects.toThrow();
    expect(logs.join('\n')).toContain(
      'To enable support for Stylus, use "@rsbuild/plugin-stylus"',
    );
  } finally {
    restore();
  }
});
