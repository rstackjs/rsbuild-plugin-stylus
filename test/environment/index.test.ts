import { expect, test } from '@playwright/test';
import { build, getFileContent } from '../helper';

test('should allow to configure Stylus plugin for specific environment', async () => {
  const { files } = await build(import.meta.dirname);
  const content = getFileContent(files, '.css');

  expect(content).toMatch(
    /body{color:red;font:14px Arial,sans-serif}\.title-class-\w{6}{font-size:14px}/,
  );
});
