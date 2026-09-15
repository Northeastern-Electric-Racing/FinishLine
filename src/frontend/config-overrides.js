/* eslint-disable */
import path from 'path';
import fs from 'fs';
import { override, babelInclude } from 'customize-cra';
module.exports = (config, env) => {
  return Object.assign(
    config,
    override(
      /* Makes sure Babel compiles the stuff in the common folder */
      babelInclude([
        path.resolve('src'),
        fs.realpathSync('../shared/src') // THIS
      ])
    )(config, env)
  );
};
