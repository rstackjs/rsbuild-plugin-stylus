import { readFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from '@rstest/playwright';
import { runDevAndPreview } from '../helper';

test('should allow to import raw Stylus files', async ({ page }) => {
  await runDevAndPreview(page, import.meta.dirname, async () => {
    const aRaw: string = await page.evaluate('window.aRaw');
    const bRaw: string = await page.evaluate('window.bRaw');
    const bStyles: Record<string, string> =
      await page.evaluate('window.bStyles');

    expect(aRaw).toBe(
      readFileSync(path.join(import.meta.dirname, 'src/a.styl'), 'utf-8'),
    );
    expect(bRaw).toBe(
      readFileSync(
        path.join(import.meta.dirname, 'src/b.module.styl'),
        'utf-8',
      ),
    );
    expect(bStyles['title-class']).toBeTruthy();
  });
});
