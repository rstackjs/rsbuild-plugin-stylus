import { expect, test } from '@playwright/test';
import { build, getFileContent, normalizeCss } from '../helper';

test('should compile stylus correctly', async () => {
  const { files } = await build(import.meta.dirname);
  const content = normalizeCss(getFileContent(files, '.css'));

  expect(content).toContain('body{color:red;font:14pxArial,sans-serif}');
  expect(content).toMatch(/\.[^{]*title-class-\w{6}{font-size:14px}/);
});
