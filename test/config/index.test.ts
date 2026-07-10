import { expect, test } from '@rstest/playwright';
import { createRsbuild, type Rspack } from '@rsbuild/core';
import { pluginStylus } from '../../src';

type RuleRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is RuleRecord =>
  typeof value === 'object' && value !== null;

const isMatch = (test: unknown, testFile: string) =>
  test instanceof RegExp && test.test(testFile);

const matchRules = (config: Rspack.Configuration, testFile: string) => {
  const rules = config.module?.rules ?? [];

  return rules.filter((rule): rule is RuleRecord => {
    if (!isRecord(rule) || !('test' in rule)) {
      return false;
    }

    if (isMatch(rule.test, testFile)) {
      return true;
    }

    return Array.isArray(rule.test)
      ? rule.test.some((test) => isMatch(test, testFile))
      : false;
  });
};

const flattenRules = (rules: unknown[]): RuleRecord[] => {
  const flattened: RuleRecord[] = [];

  for (const rule of rules) {
    if (!isRecord(rule)) {
      continue;
    }

    flattened.push(rule);

    if (Array.isArray(rule.oneOf)) {
      flattened.push(...flattenRules(rule.oneOf));
    }
  }

  return flattened;
};

const collectUses = (rules: unknown[]) =>
  flattenRules(rules).flatMap((rule) =>
    Array.isArray(rule.use) ? rule.use.filter(isRecord) : [],
  );

const getOptions = (use: RuleRecord) =>
  isRecord(use.options) ? use.options : {};

const getStylusUses = (config: Rspack.Configuration) =>
  collectUses(matchRules(config, 'a.styl')).filter(
    (use) =>
      typeof use.loader === 'string' && use.loader.includes('stylus-loader'),
  );

test.describe('plugin-stylus config', () => {
  test('should add stylus loader config correctly', async () => {
    const rsbuild = await createRsbuild({
      rsbuildConfig: {
        plugins: [pluginStylus()],
      },
    });

    const rspackConfigs = await rsbuild.initConfigs();
    const rules = matchRules(rspackConfigs[0], 'a.styl');
    const uses = collectUses(rules);

    expect(rules).toHaveLength(1);
    expect(getStylusUses(rspackConfigs[0])).toHaveLength(3);
    expect(
      uses.some(
        (use) =>
          typeof use.loader === 'string' &&
          use.loader.includes('css-loader') &&
          getOptions(use).importLoaders === 2,
      ),
    ).toBe(true);
    expect(
      flattenRules(rules).some((rule) => rule.type === 'asset/source'),
    ).toBe(true);
  });

  test('should allow to configure stylus options', async () => {
    const rsbuild = await createRsbuild({
      rsbuildConfig: {
        plugins: [
          pluginStylus({
            stylusOptions: {
              lineNumbers: false,
            },
          }),
        ],
      },
    });

    const rspackConfigs = await rsbuild.initConfigs();
    const stylusUses = getStylusUses(rspackConfigs[0]);

    expect(stylusUses).toHaveLength(3);
    expect(
      stylusUses.every((use) => {
        const options = getOptions(use);
        const stylusOptions = options.stylusOptions;

        return (
          options.sourceMap === false &&
          isRecord(stylusOptions) &&
          stylusOptions.lineNumbers === false
        );
      }),
    ).toBe(true);
  });
});
