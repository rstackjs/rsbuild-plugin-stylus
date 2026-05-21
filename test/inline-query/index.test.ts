import { expect, test } from '@playwright/test';
import { runDevAndPreview } from '../helper';

const normalizeCss = (content: string) =>
  content.replace(/\s+/g, '').replace(/;/g, '');

test('should allow to import inline Stylus files', async ({ page }) => {
  await runDevAndPreview(page, import.meta.dirname, async ({ mode }) => {
    const aInline: string = await page.evaluate('window.aInline');
    const bInline: string = await page.evaluate('window.bInline');
    const bStyles: Record<string, string> =
      await page.evaluate('window.bStyles');

    if (mode === 'dev') {
      expect(
        aInline.includes('.header-class') && aInline.includes('color: red'),
      ).toBe(true);
      expect(
        bInline.includes('.title-class') && bInline.includes('font-size: 14px'),
      ).toBe(true);
    } else {
      expect(normalizeCss(aInline)).toBe('.header-class{color:red}');
      expect(normalizeCss(bInline)).toBe('.title-class{font-size:14px}');
    }

    expect(bStyles['title-class']).toBeTruthy();
  });
});
