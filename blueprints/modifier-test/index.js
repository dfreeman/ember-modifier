'use strict';

const stringUtils = require('ember-cli-string-utils');
const isPackageMissing = require('ember-cli-is-package-missing');

const useTestFrameworkDetector = require('../test-framework-detector');
const isModuleUnificationProject = require('../module-unification')
  .isModuleUnificationProject;

const path = require('path');

module.exports = useTestFrameworkDetector({
  description: 'Generates a helper integration test or a unit test.',

  fileMapTokens: function () {
    if (isModuleUnificationProject(this.project)) {
      return {
        __root__(options) {
          if (options.inRepoAddon) {
            return path.join('packages', options.inRepoAddon, 'src');
          }

          if (options.inDummy) {
            throw new Error(
              "The --dummy flag isn't supported within a module unification app"
            );
          }

          return 'src';
        },
        __testType__() {
          return '';
        },
        __collection__() {
          return 'ui/components';
        },
      };
    } else {
      return {
        __root__() {
          return 'tests';
        },
        __testType__(options) {
          return options.locals.testType || 'integration';
        },
        __collection__() {
          return 'modifiers';
        },
      };
    }
  },

  locals: function (options) {
    const friendlyTestName = [
      'Integration',
      'Modifier',
      options.entity.name,
    ].join(' | ');
    let dasherizedModulePrefix;

    if (
      isModuleUnificationProject(options.project) &&
      (options.project.isEmberCLIAddon() || options.inRepoAddon)
    ) {
      dasherizedModulePrefix = options.inRepoAddon || options.project.name();
    } else {
      dasherizedModulePrefix = stringUtils.dasherize(
        options.project.config().modulePrefix
      );
    }

    return {
      friendlyTestName: friendlyTestName,
      dasherizedModulePrefix: dasherizedModulePrefix,
    };
  },

  afterInstall: function (options) {
    if (
      !options.dryRun &&
      options.testType === 'integration' &&
      isPackageMissing(this, 'ember-cli-htmlbars-inline-precompile')
    ) {
      return this.addPackagesToProject([
        { name: 'ember-cli-htmlbars-inline-precompile', target: '^0.3.1' },
      ]);
    }
  },
});
