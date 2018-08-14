'use strict';

/**
 * Style manager. It manage style files for components. Usually used with component manage.
 * @module
 **/
const path = require('path');
const _ = require('lodash');

const { vio, template, config, paths } = rekit.core;
const entry = require('./entry');

const cssExt = config.css;
/**
 * Add a style file for a component. It create the style file with the extension 'cssExt' configured in 'rekit' section of package.json.
 * @param {string} feature - The feature name.
 * @param {string} component - The component name.
 * @alias module:style.add
 *
 * @example
 * const style = require('rekit-core').style;
 *
 * // create a file named 'Hello.less' in feature 'home'.
 * style.add('home', 'Hello');
 **/
function add(elePath, args) {
  // Create style file for a component
  // args = args || {};
  const arr = elePath.split('/');
  const name = _.pascalCase(arr.pop());
  const prefix = arr.join('-');
  template.generate(
    `src/features/${arr.join('/')}/${name}.${cssExt}`,
    Object.assign({}, args, {
      templateFile: path.join(__dirname, './templates/Component.less.tpl'),
      context: Object.assign(
        {
          name,
          prefix,
        },
        args.context || {}
      ),
    })
  );

  // entry.addToStyle(feature, component);
}

/**
 * Remove a style file for a component.
 * @param {string} feature - The feature name.
 * @param {string} component - The component name.
 * @alias module:style.remove
 *
 **/
function remove(elePath) {
  // Remove style file of a component
  const arr = elePath.split('/');
  const name = _.pascalCase(arr.pop());
  vio.del(`src/features/${arr.join('/')}/${name}.${cssExt}`);
  // entry.removeFromStyle(feature, component);
}

/**
 * Move/rename a style file for a component.
 * @param {string} feature - The feature name.
 * @param {string} component - The component name.
 * @alias module:style.remove
 *
 **/
function move(source, target) {
  // 1. Move File.less to the destination
  // 2. Rename css class name
  // 3. Update references in the style.less

  source.feature = _.kebabCase(source.feature);
  source.name = _.pascalCase(source.name);
  target.feature = _.kebabCase(target.feature);
  target.name = _.pascalCase(target.name);

  const srcPath = utils.mapComponent(source.feature, source.name) + '.' + utils.getCssExt();
  const targetPath = utils.mapComponent(target.feature, target.name) + '.' + utils.getCssExt();
  vio.move(srcPath, targetPath);

  let lines = vio.getLines(targetPath);
  const oldCssClass = `${_.kebabCase(source.feature)}-${_.kebabCase(source.name)}`;
  const newCssClass = `${_.kebabCase(target.feature)}-${_.kebabCase(target.name)}`;

  lines = lines.map(line => line.replace(`.${oldCssClass}`, `.${newCssClass}`));
  vio.save(targetPath, lines);

  if (source.feature === target.feature) {
    entry.renameInStyle(source.feature, source.name, target.name);
  } else {
    entry.removeFromStyle(source.feature, source.name);
    entry.addToStyle(target.feature, target.name);
  }
}

module.exports = {
  add,
  move,
  remove,
};