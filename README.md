# @rsbuild/plugin-stylus

Stylus is an expressive, dynamic, and robust CSS preprocessor. With this plugin, you can use Stylus as the CSS preprocessor in Rsbuild.

<p>
  <a href="https://npmjs.com/package/@rsbuild/plugin-stylus">
   <img src="https://img.shields.io/npm/v/@rsbuild/plugin-stylus?style=flat-square&colorA=564341&colorB=EDED91" alt="npm version" />
  </a>
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="license" />
  <a href="https://npmcharts.com/compare/@rsbuild/plugin-stylus?minimal=true"><img src="https://img.shields.io/npm/dm/@rsbuild/plugin-stylus.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="downloads" /></a>
</p>

## Usage

Install:

```bash
npm add @rsbuild/plugin-stylus -D
```

Add plugin to your `rsbuild.config.ts`:

```ts
// rsbuild.config.ts
import { pluginStylus } from '@rsbuild/plugin-stylus';

export default {
  plugins: [pluginStylus()],
};
```

After registering the plugin, you can import `*.styl`, `*.stylus`, `*.module.styl`, or `*.module.stylus` files without adding other configs.

```styl
// normalize.styl
body
  color #000
  font 14px Arial, sans-serif
```

```styl
// title.module.styl
.title
  font-size 14px
```

```js
// index.js
import './normalize.styl';
import style from './title.module.styl';

console.log(style.title);
```

## Options

### stylusOptions

- Type:

```ts
type StylusOptions = {
  use?: string[];
  define?: [string, unknown, boolean?][];
  include?: string[];
  includeCSS?: boolean;
  import?: string[];
  resolveURL?: boolean;
  lineNumbers?: boolean;
  hoistAtrules?: boolean;
};
```

- Default: `undefined`

These options are passed to Stylus. For details, see the [Stylus documentation](https://stylus-lang.com/docs/js).

```ts
pluginStylus({
  stylusOptions: {
    lineNumbers: false,
  },
});
```

### sourceMap

- Type: `boolean`
- Default: the same as Rsbuild's `output.sourceMap.css` config

Whether to generate source maps.

```ts
pluginStylus({
  sourceMap: false,
});
```

## License

[MIT](./LICENSE).
