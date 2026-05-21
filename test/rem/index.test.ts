import { expect, test } from '@playwright/test';
import { build, getFileContent } from '../helper';

test('should compile stylus and rem correctly', async () => {
  const { files } = await build(import.meta.dirname);
  const content = getFileContent(files, '.css');

  expect(content).toMatch(
    /body{color:red;font:\.28rem Arial,sans-serif}\.title-class-\w{6}{font-size:\.28rem}/,
  );
});
