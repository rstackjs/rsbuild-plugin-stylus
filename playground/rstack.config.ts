// Configuration guide: https://rstack.rs/config
import { define } from 'rstack';
import { pluginStylus } from '../src/index.ts';

define.app({
  plugins: [pluginStylus()],
});
