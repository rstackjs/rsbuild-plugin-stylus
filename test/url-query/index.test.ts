import { expect, test } from '@rstest/playwright';
import { getFileContent, runDevAndPreview } from '../helper';

type StylusUrlResult = {
  styleContent: string;
  styleUrl: string;
  targetColor: string;
};

test('should return transformed Stylus URL with `?url`', async ({ page }) => {
  await runDevAndPreview(page, import.meta.dirname, async ({ mode, files }) => {
    const { styleContent, styleUrl, targetColor } =
      await page.evaluate<StylusUrlResult>('window.getStylusUrlResult()');

    expect(styleUrl).toMatch(/\/static\/css\/style\.css$/);
    expect(styleContent).toContain('.url-query-stylus');
    expect(styleContent).toMatch(/\.url-query-stylus:{1,2}after/);
    expect(targetColor).toBe('rgb(0, 0, 0)');

    if (mode === 'build') {
      const html = getFileContent(files!, 'index.html');
      expect(html).not.toMatch(/<link[^>]+rel="stylesheet"/);
    }
  });
});
