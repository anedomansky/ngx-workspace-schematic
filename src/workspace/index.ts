import {
  chain,
  externalSchematic,
  MergeStrategy,
  mergeWith,
  type Rule,
  type SchematicContext,
  SchematicsException,
  type Tree,
} from '@angular-devkit/schematics';

import { copyPath } from '../utils/copy-path.fn.js';
import type { PackageJSON } from '../models/package-json-model.js';
import type { Schema } from './schema';

/**
 * Executes an Angular schematic to create a new workspace.
 *
 * @param options - The schema options for the schematic.
 * @returns A `Rule` that applies the schematic.
 *
 * @description
 * This function uses the `externalSchematic` function to invoke the `ng-new` schematic
 * from the `@schematics/angular` collection. The schematic is configured to create a new
 * Angular workspace with the specified options.
 */
function executeSchematic(options: Schema): Rule {
  return externalSchematic('@schematics/angular', 'ng-new', {
    name: options.name,
    version: '20.2.0',
    directory: './',
    routing: true,
    style: 'scss',
    createApplication: false,
    inlineStyle: false,
    inlineTemplate: false,
    skipInstall: true,
    skipGit: false,
    zoneless: true,
    commit: false,
    aiConfig: ['none'],
  });
}

/**
 * Copies the base files to the specified destination.
 *
 * @param options - The schema options that define the source and destination paths.
 * @returns A `Rule` that merges the copied files with the existing files, using the overwrite strategy.
 */
function copyBaseFiles(options: Schema): Rule {
  return mergeWith(copyPath(options, '', null), MergeStrategy.Overwrite);
}

/**
 * Updates the `package.json` file in the Angular workspace with specific configurations.
 *
 * @description
 * This function performs the following updates:
 * - Sets the `type` to `"module"`.
 * - Adds and updates various npm scripts.
 * - Specifies the required Node.js engine versions.
 * - Adds and updates `dependencies` and `devDependencies` for Angular, ESLint, Jest, and other tools.
 * - Removes Jasmine and Karma related `devDependencies`.
 *
 * @returns A `Rule` that updates the `package.json` file in the Angular workspace.
 * @throws `SchematicsException` if the `package.json` file is not found.
 */
function updatePackageJson(): Rule {
  return (tree: Tree): Tree => {
    const path = 'package.json';
    const file = tree.read(path);

    if (!file) {
      throw new SchematicsException('package.json not found.');
    }

    const json = JSON.parse(file.toString()) as PackageJSON;

    json.type = 'module';

    json.scripts = {
      lint: 'eslint ./projects',
      'lint:fix': 'eslint ./projects --fix',
      test: 'npm run test:esm -- --silent',
      'test:coverage': 'npm run test:esm -- --silent --collectCoverage',
      'test:esm':
        'node --experimental-vm-modules --no-warnings ./node_modules/jest/bin/jest.js',
      'test:local': 'npm run test:esm',
    };

    json.engines = {
      node: '^18.19.1 || ^20.11.1 || ^22.0.0',
    };

    json.dependencies['@angular/animations'] = '20.2.0';
    json.dependencies['@angular/common'] = '20.2.0';
    json.dependencies['@angular/compiler'] = '20.2.0';
    json.dependencies['@angular/core'] = '20.2.0';
    json.dependencies['@angular/forms'] = '20.2.0';
    json.dependencies['@angular/platform-browser'] = '20.2.0';
    json.dependencies['@angular/platform-browser-dynamic'] = '20.2.0';
    json.dependencies['@angular/router'] = '20.2.0';
    json.dependencies.rxjs = '7.8.2';
    json.dependencies.tslib = '2.8.1';
    json.dependencies['zone.js'] = '0.15.1';
    json.devDependencies['@anedomansky/eslint-config'] = '2.3.0';
    json.devDependencies['@anedomansky/stylelint-config'] = '1.0.0';
    json.devDependencies['@angular/build'] = '20.2.0';
    json.devDependencies['@angular/cli'] = '20.2.0';
    json.devDependencies['@angular/compiler-cli'] = '20.2.0';
    json.devDependencies['@jest/globals'] = '30.0.5';
    json.devDependencies['@testing-library/angular'] = '17.4.0';
    json.devDependencies['@testing-library/dom'] = '10.4.1';
    json.devDependencies['@testing-library/jest-dom'] = '6.6.4';
    json.devDependencies['@testing-library/user-event'] = '14.6.1';
    json.devDependencies['@types/jest'] = '30.0.0';
    json.devDependencies['@types/node'] = '24.1.0';
    json.devDependencies.eslint = '9.33.0';
    json.devDependencies.jest = '30.0.5';
    json.devDependencies['jest-environment-jsdom'] = '30.0.5';
    json.devDependencies['jest-preset-angular'] = '15.0.0';
    json.devDependencies['ng-packagr'] = '20.1.0';
    json.devDependencies.prettier = '3.6.2';
    json.devDependencies.stylelint = '16.23.0';
    json.devDependencies['ts-node'] = '10.9.2';
    json.devDependencies.typescript = '5.8.3';
    json.devDependencies['typescript-eslint'] = '8.39.1';

    // Delete Jasmin / Karma Tests
    delete json.devDependencies['@types/jasmine'];
    delete json.devDependencies['jasmine-core'];
    delete json.devDependencies.karma;
    delete json.devDependencies['karma-chrome-launcher'];
    delete json.devDependencies['karma-coverage'];
    delete json.devDependencies['karma-jasmine'];
    delete json.devDependencies['karma-jasmine-html-reporter'];

    tree.overwrite(path, JSON.stringify(json, null, 2));

    return tree;
  };
}

/**
 * Schematic for creating new Angular workspaces.
 *
 * @param options - The options provided to the schematic.
 * @returns A Rule that applies the schematic.
 */
export default function (options: Schema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const rule = chain([
      executeSchematic(options),
      copyBaseFiles(options),
      updatePackageJson(),
    ]);

    return rule(tree, context);
  };
}
