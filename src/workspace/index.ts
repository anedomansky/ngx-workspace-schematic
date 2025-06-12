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

import type { PackageJSON } from '../models/package-json-model.js';
import { copyPath } from '../utils/copy-path.fn.js';
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
    version: '19.2.15',
    directory: './',
    routing: true,
    style: 'scss',
    createApplication: false,
    inlineStyle: false,
    inlineTemplate: false,
    skipInstall: true,
    skipGit: false,
  });
}

/**
 * Copies the base files to the specified destination.
 *
 * @param options - The schema options that define the source and destination paths.
 * @returns A `Rule` that merges the copied files with the existing files, using the overwrite strategy.
 */
function copyBaseFiles(options: Schema): Rule {
  return mergeWith(
    copyPath<Schema>(options, '', null),
    MergeStrategy.Overwrite,
  );
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

    json.dependencies['@angular/animations'] = '~19.2.14';
    json.dependencies['@angular/common'] = '~19.2.14';
    json.dependencies['@angular/compiler'] = '~19.2.14';
    json.dependencies['@angular/core'] = '~19.2.14';
    json.dependencies['@angular/forms'] = '~19.2.14';
    json.dependencies['@angular/platform-browser'] = '~19.2.14';
    json.dependencies['@angular/platform-browser-dynamic'] = '~19.2.14';
    json.dependencies['@angular/router'] = '~19.2.14';
    json.dependencies['rxjs'] = '~7.8.2';
    json.dependencies['tslib'] = '~2.8.1';
    json.dependencies['zone.js'] = '~0.15.0';
    json.devDependencies['@anedomansky/eslint-config'] = '1.2.0';
    json.devDependencies['@angular/cli'] = '~19.2.15';
    json.devDependencies['@angular/compiler-cli'] = '~19.2.14';
    json.devDependencies['@angular-devkit/build-angular'] = '~19.2.15';
    json.devDependencies['@jest/globals'] = '~30.0.0';
    json.devDependencies['@testing-library/angular'] = '~17.4.0';
    json.devDependencies['@testing-library/dom'] = '~10.4.0';
    json.devDependencies['@testing-library/jest-dom'] = '~6.6.3';
    json.devDependencies['@testing-library/user-event'] = '~14.6.1';
    json.devDependencies['@types/jest'] = '~29.5.14';
    json.devDependencies['@types/node'] = '~24.0.1';
    json.devDependencies['eslint'] = '~9.28.0';
    json.devDependencies['jest'] = '~30.0.0';
    json.devDependencies['jest-environment-jsdom'] = '~30.0.0';
    json.devDependencies['jest-preset-angular'] = '~14.6.0';
    json.devDependencies['ng-packagr'] = '~19.2.2';
    json.devDependencies['prettier'] = '~3.5.3';
    json.devDependencies['stylelint'] = '~16.19.1';
    json.devDependencies['stylelint-config-sass-guidelines'] = '~12.1.0';
    json.devDependencies['stylelint-config-standard-scss'] = '~15.0.0';
    json.devDependencies['stylelint-order'] = '~7.0.0';
    json.devDependencies['ts-node'] = '~10.9.2';
    json.devDependencies['typescript'] = '~5.8.3';
    json.devDependencies['typescript-eslint'] = '~8.34.0';

    // Delete Jasmin / Karma Tests
    delete json.devDependencies['@types/jasmine'];
    delete json.devDependencies['jasmine-core'];
    delete json.devDependencies['karma'];
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
