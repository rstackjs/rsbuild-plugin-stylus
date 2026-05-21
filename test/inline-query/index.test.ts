import { expect, test } from '@playwright/test';
import { normalizeCss, runDevAndPreview } from '../helper';

test('should allow to import inline Stylus files', async ({ page }) => {
  await runDevAndPreview(page, import.meta.dirname, async ({ mode }) => {
    const aInline: string = await page.evaluate('window.aInline');
    const bInline: string = await page.evaluate('window.bInline');
    const bStyles: Record<string, string> =
      await page.evaluate('window.bStyles');

    expect(normalizeCss(aInline)).toContain('.header-class{color:red}');
    expect(normalizeCss(bInline)).toMatch(
      /\.[^{]*title-class[^{]*{font-size:14px}/,
    );

    expect(bStyles['title-class']).toBeTruthy();
  });
});
