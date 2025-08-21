import {
  chain,
  MergeStrategy,
  mergeWith,
  type Rule,
  type SchematicContext,
  SchematicsException,
  type Tree,
} from '@angular-devkit/schematics';
import { dasherize } from '@angular-devkit/core/src/utils/strings';
import { normalize } from '@angular-devkit/core';

import { copyPath } from '../utils/copy-path.fn.js';
import type { PackageJSON } from '../models/package-json-model.js';
import type { Schema } from './schema';
import { SCOPE_IDENTIFIER } from '../utils/schema.model.js';

/**
 * Copies the base files to the specified library directory.
 *
 * @param options - The schema options containing the library details.
 * @returns A `Rule` that merges the base files into the target directory with an overwrite strategy.
 */
function copyBaseFiles(options: Schema): Rule {
  return mergeWith(
    copyPath(options, 'base', `projects/${options.libraryNameWithoutPrefix}`),
    MergeStrategy.Overwrite,
  );
}

/**
 * Copies unit test files to the specified destination.
 *
 * @param options - The schema options containing the destination path and other configurations.
 * @returns A `Rule` that merges the copied files with the existing files, using the overwrite strategy.
 */
function copyUnitTestFiles(options: Schema): Rule {
  return mergeWith(
    copyPath(options, 'unit-testing', null),
    MergeStrategy.Overwrite,
  );
}

/**
 * Updates the `package.json` file by adding build and test scripts for a specified library.
 *
 * @param options - An object containing the schema options.
 * @returns A `Rule` that updates the `package.json` file in the tree.
 *
 * @throws `SchematicsException` if the `package.json` file is not found.
 *
 * @description
 * The following scripts are added to the `package.json`:
 * - `build:lib:<libraryNameWithoutScope>`: Builds the library in production mode.
 * - `build:lib:<libraryNameWithoutScope>:watch`: Builds the library in development mode and watches for changes.
 * - `test:lib:<libraryNameWithoutScope>`: Runs tests for the library using Jest with a specific configuration file.
 * - `test:lib:<libraryNameWithoutScope>:local`: Runs tests for the library using Jest with a specific configuration file without the silent flag.
 */
function updatePackageJson(options: Schema): Rule {
  return (tree: Tree): Tree => {
    const path = 'package.json';
    const file = tree.read(path);

    if (!file) {
      throw new SchematicsException('package.json not found.');
    }

    const json = JSON.parse(file.toString()) as PackageJSON;

    json.scripts = {
      ...json.scripts,
      [`build:lib:${options.libraryNameWithoutScope}`]: `ng build ${options.libraryName} --configuration=production`,
      [`build:lib:${options.libraryNameWithoutScope}:watch`]: `ng build ${options.libraryName} --configuration development --watch`,
      [`test:lib:${options.libraryNameWithoutScope}`]: `npm run test:esm -- -c=jest.${options.libraryNameWithoutScope}.config.ts --silent`,
      [`test:lib:${options.libraryNameWithoutScope}:local`]: `npm run test:esm -- -c=jest.${options.libraryNameWithoutScope}.config.ts`,
    };

    tree.overwrite(path, JSON.stringify(json, null, 2));

    return tree;
  };
}

/**
 * Updates the VSCode workspace configuration by adding a new folder entry.
 *
 * @param options - The schema options containing the necessary parameters.
 * @returns A `Rule` that updates the workspace configuration in the Tree.
 *
 * @throws `SchematicsException` if the specified `.code-workspace` file is not found.
 *
 * @description
 * The function performs the following steps:
 * 1. Constructs the path to the `.code-workspace` file based on the provided options.
 * 2. Reads the `.code-workspace` file from the `Tree`.
 * 3. Parses the file content as JSON.
 * 4. Adds a new folder entry to the `folders` array in the JSON object.
 * 5. Overwrites the `.code-workspace` file with the updated JSON content.
 */
function updateVSCodeWorkspace(options: Schema): Rule {
  return (tree: Tree): Tree => {
    const path = `.vscode/${options.name}.code-workspace`;
    const file = tree.read(path);

    if (!file) {
      throw new SchematicsException(
        `${options.name}.code-workspace not found.`,
      );
    }

    const json = JSON.parse(file.toString());

    json.folders = [
      ...json.folders,
      {
        name: options.libraryNameWithoutScope,
        path: `../projects/${options.libraryNameWithoutPrefix}`,
      },
    ];

    tree.overwrite(path, JSON.stringify(json, null, 2));

    return tree;
  };
}

/**
 * Updates the Angular workspace configuration by adding a new library project to the `angular.json` file.
 *
 * @param options - The schema options containing the library name and other configurations.
 * @returns A `Rule` that updates the Angular workspace configuration.
 *
 * @throws `SchematicsException` if the `angular.json` file is not found in the workspace.
 *
 * @description
 * The function performs the following steps:
 * 1. Reads the `angular.json` file from the workspace.
 * 2. Parses the JSON content of the file.
 * 3. Adds a new library project configuration to the `projects` section of the JSON.
 * 4. Overwrites the `angular.json` file with the updated JSON content.
 *
 * The new library project configuration includes:
 * - `root`: The root directory of the library project.
 * - `sourceRoot`: The source root directory of the library project.
 * - `prefix`: The prefix used for the library components.
 * - `projectType`: The type of the project, which is "library".
 * - `schematics`: Default schematics options for components and directives.
 * - `architect`: Build configurations for the library project, including production and development configurations.
 */
function updateAngularWorkspace(options: Schema): Rule {
  return (tree: Tree): Tree => {
    const path = 'angular.json';
    const file = tree.read(path);

    if (!file) {
      throw new SchematicsException(`angular.json not found.`);
    }

    const json = JSON.parse(file.toString());

    json.projects = {
      ...json.projects,
      [options.libraryName]: {
        projectType: 'library',
        root: normalize(`projects/${options.libraryNameWithoutPrefix}`),
        sourceRoot: normalize(
          `projects/${options.libraryNameWithoutPrefix}/src`,
        ),
        prefix: 'lib',
        schematics: {
          '@schematics/angular:component': {
            style: 'scss',
            changeDetection: 'OnPush',
          },
        },
        architect: {
          build: {
            builder: '@angular/build:ng-packagr',
            configurations: {
              production: {
                tsConfig: `projects/${options.libraryNameWithoutPrefix}/tsconfig.lib.prod.json`,
              },
              development: {
                tsConfig: `projects/${options.libraryNameWithoutPrefix}/tsconfig.lib.json`,
              },
            },
            defaultConfiguration: 'production',
          },
        },
      },
    };

    tree.overwrite(path, JSON.stringify(json, null, 2));

    return tree;
  };
}

/**
 * Updates the `tsconfig.json` file to include a new path mapping for the specified library.
 *
 * @param options - The schema options containing the library details.
 * @returns A `Rule` that updates the `tsconfig.json` file in the provided Tree.
 *
 * @throws `SchematicsException` if the `tsconfig.json` file is not found.
 */
function updateTsconfig(options: Schema): Rule {
  return (tree: Tree): Tree => {
    const path = 'tsconfig.json';
    const file = tree.read(path);

    if (!file) {
      throw new SchematicsException('tsconfig.json not found.');
    }

    const json = JSON.parse(file.toString());

    json.compilerOptions = {
      ...json.compilerOptions,
      paths: {
        ...json.compilerOptions.paths,
        [options.libraryName]: [`./dist/${options.libraryNameWithoutPrefix}`],
      },
    };

    if (json.references) {
      json.references = [
        ...json.references,
        {
          path: `./projects/${options.libraryNameWithoutPrefix}/tsconfig.lib.json`,
        },
      ];
    } else {
      json.references = [
        {
          path: `./projects/${options.libraryNameWithoutPrefix}/tsconfig.lib.json`,
        },
      ];
    }

    tree.overwrite(path, JSON.stringify(json, null, 2));

    return tree;
  };
}

/**
 * Updates the Jest configuration file (`jest.config.ts`) to include a new module name mapper entry
 * for the specified library.
 *
 * @param options - The schema options containing the library details.
 * @returns A Rule that updates the Jest configuration file in the provided Tree.
 *
 * @throws SchematicsException if the `jest.config.ts` file is not found.
 *
 * @description
 * The new entry is added to the `moduleNameMapper` section of the Jest configuration file.
 * The entry maps the library name to the corresponding path in the `dist` directory.
 *
 * Example of the new entry:
 * ```
 * '^libraryName': '<rootDir>/dist/libraryNameWithoutPrefix/fesm2022/libraryScope-libraryNameWithoutScope.mjs',
 * ```
 */
function updateUnitTestConfig(options: Schema): Rule {
  return (tree: Tree): Tree => {
    const path = 'jest.config.ts';

    const file = tree.readText(path);

    if (!file) {
      throw new SchematicsException('jest.config.ts not found.');
    }

    const libraryScope = options.libraryName.substring(
      options.libraryName.indexOf(SCOPE_IDENTIFIER) + 1 > -1
        ? options.libraryName.indexOf(SCOPE_IDENTIFIER) + 1
        : 0,
      options.libraryName.indexOf('/'),
    );
    const newEntry = `'^${options.libraryName}': '<rootDir>/dist/${
      options.libraryNameWithoutPrefix
    }/fesm2022/${options.libraryNameHasScope ? `${libraryScope}-` : ''}${
      options.libraryNameWithoutScope
    }.mjs',`;

    const updatedFile = file.replace(
      /moduleNameMapper:\s*\{[^}]*\}/,
      (match) => {
        // Remove the closing brace and add the new entry
        const updatedMapper = match.replace(/\}$/, `  ${newEntry}\n  }`);
        return updatedMapper;
      },
    );

    tree.overwrite(path, updatedFile);

    return tree;
  };
}

/**
 * Main function to generate a library schematic.
 *
 * @param options - The schema options for the library.
 * @returns A Rule that applies the necessary transformations to the tree.
 *
 * @description
 * The function performs the following steps:
 * 1. Dasherizes the library name.
 * 2. Checks if the library name has a scope.
 * 3. Extracts the library name without the scope identifier.
 * 4. Extracts the library name without the scope.
 * 5. If an app name is provided, it dasherizes the app name and extracts the app name without the scope.
 * 6. Chains a series of rules to copy base files, unit test files, and update various configuration files.
 */
export default function (options: Schema): Rule {
  options.libraryName = dasherize(options.libraryName);

  options.libraryNameHasScope =
    options.libraryName.startsWith(SCOPE_IDENTIFIER);

  const libraryNameWithoutPrefix = options.libraryName.replace(
    SCOPE_IDENTIFIER,
    '',
  );
  const libraryNameWithoutScope = libraryNameWithoutPrefix.slice(
    options.libraryName.includes('/') ? options.libraryName.indexOf('/') : 0,
  );

  options.libraryNameWithoutPrefix = libraryNameWithoutPrefix;
  options.libraryNameWithoutScope = libraryNameWithoutScope;

  if (options.appName) {
    options.appName = dasherize(options.appName);

    const appNameWithoutPrefix = options.appName.replace(SCOPE_IDENTIFIER, '');
    const appNameWithoutScope = appNameWithoutPrefix.slice(
      options.appName.includes('/') ? options.appName.indexOf('/') : 0,
    );

    options.appNameWithoutScope = appNameWithoutScope;
  }

  return (tree: Tree, context: SchematicContext) => {
    const rule = chain([
      copyBaseFiles(options),
      copyUnitTestFiles(options),
      updatePackageJson(options),
      updateVSCodeWorkspace(options),
      updateAngularWorkspace(options),
      updateTsconfig(options),
      updateUnitTestConfig(options),
    ]);

    return rule(tree, context);
  };
}
