import { normalize } from "@angular-devkit/core";
import { dasherize } from "@angular-devkit/core/src/utils/strings";
import {
  chain,
  MergeStrategy,
  mergeWith,
  type Rule,
  type SchematicContext,
  SchematicsException,
  type Tree,
} from "@angular-devkit/schematics";
import { copyPath } from "../utils/copy-path.fn.js";
import type { Schema } from "./schema";
import { SCOPE_IDENTIFIER } from "../utils/schema.model.js";
import type { PackageJSON } from "../models/package-json-model.js";

/**
 * Copies the base files to the specified project directory.
 *
 * @param options - The schema options containing configuration for the operation.
 * @returns A `Rule` that merges the copied files with the existing files in the target directory.
 */
function copyBaseFiles(options: Schema): Rule {
  return mergeWith(
    copyPath<Schema>(
      options,
      "base",
      `projects/${options.appNameWithoutPrefix}`
    ),
    MergeStrategy.Overwrite
  );
}

/**
 * Copies unit test files to the specified location.
 *
 * @param options - The schema options containing the configuration for the copy operation.
 * @returns A `Rule` that merges the unit test files with the existing files, using the overwrite strategy.
 */
function copyUnitTestFiles(options: Schema): Rule {
  return mergeWith(
    copyPath(options, "unit-testing", null),
    MergeStrategy.Overwrite
  );
}

/**
 * Updates the `package.json` file by adding custom scripts for the specified application.
 *
 * @param options - The schema options containing the application details.
 * @returns A `Rule` that updates the `package.json` file in the tree.
 *
 * @throws `SchematicsException` if the `package.json` file is not found.
 *
 * @remarks
 * The following scripts are added to the `package.json`:
 * - `start:app:<appNameWithoutScope>`: Runs `ng serve` for the specified application.
 * - `build:app:<appNameWithoutScope>`: Runs `ng build` for the specified application.
 * - `test:app:<appNameWithoutScope>`: Runs tests using Jest with a specific configuration file.
 * - `test:app:<appNameWithoutScope>:local`: Runs tests using Jest with a specific configuration file without the `--silent` flag.
 */
function updatePackageJson(options: Schema): Rule {
  return (tree: Tree): Tree => {
    const path = "package.json";
    const file = tree.read(path);

    if (!file) {
      throw new SchematicsException("package.json not found.");
    }

    const json = JSON.parse(file.toString()) as PackageJSON;

    json.scripts = {
      ...json.scripts,
      [`start:app:${options.appNameWithoutScope}`]: `ng serve ${options.appName}`,
      [`build:app:${options.appNameWithoutScope}`]: `ng build ${options.appName}`,
      [`test:app:${options.appNameWithoutScope}`]: `npm run test:esm -- -c=jest.${options.appNameWithoutScope}.config.ts --silent`,
      [`test:app:${options.appNameWithoutScope}:local`]: `npm run test:esm -- -c=jest.${options.appNameWithoutScope}.config.ts`,
    };

    tree.overwrite(path, JSON.stringify(json, null, 2));

    return tree;
  };
}

/**
 * Updates the VSCode workspace configuration by adding a new project folder to the workspace.
 *
 * @param options - The options provided to the schematic.
 * @returns A `Rule` that updates the VSCode workspace configuration.
 *
 * @throws `SchematicsException` If the specified `.code-workspace` file is not found.
 */
function updateVSCodeWorkspace(options: Schema): Rule {
  return (tree: Tree): Tree => {
    const path = `.vscode/${options.name}.code-workspace`;
    const file = tree.read(path);

    if (!file) {
      throw new SchematicsException(
        `${options.name}.code-workspace not found.`
      );
    }

    const json = JSON.parse(file.toString());

    json.folders = [
      ...json.folders,
      {
        name: options.appNameWithoutScope,
        path: `../projects/${options.appNameWithoutPrefix}`,
      },
    ];

    tree.overwrite(path, JSON.stringify(json, null, 2));

    return tree;
  };
}

/**
 * Updates the Angular workspace configuration by modifying the `angular.json` file.
 *
 * @param options - The schema options containing the application and library details.
 * @returns A `Rule` that modifies the Angular workspace configuration.
 *
 * @throws `SchematicsException` if the `angular.json` file is not found.
 *
 * @description
 * The function performs the following tasks:
 * - Reads the `angular.json` file from the workspace.
 * - Parses the JSON content of the file.
 * - Adds a new project configuration for the application specified in the options.
 * - Configures the build and serve targets for the application.
 * - If a library name is provided in the options, it adds the library's assets and styles to the application's build options.
 * - Overwrites the `angular.json` file with the updated configuration.
 *
 */
function updateAngularWorkspace(options: Schema): Rule {
  return (tree: Tree): Tree => {
    const path = "angular.json";
    const file = tree.read(path);

    if (!file) {
      throw new SchematicsException(`angular.json not found.`);
    }

    const json = JSON.parse(file.toString());

    json.projects = {
      ...json.projects,
      [options.appName]: {
        root: normalize(`projects/${options.appNameWithoutPrefix}`),
        sourceRoot: normalize(`projects/${options.appNameWithoutPrefix}/src`),
        prefix: "app",
        projectType: "application",
        schematics: {
          "@schematics/angular:component": {
            style: "scss",
            changeDetection: "OnPush",
            standalone: true,
          },
          "@schematics/angular:directive": {
            standalone: true,
          },
        },
        architect: {
          build: {
            builder: "@angular-devkit/build-angular:browser-esbuild",
            options: {
              outputPath: `dist/${options.appNameWithoutPrefix}`,
              index: `projects/${options.appNameWithoutPrefix}/src/index.html`,
              main: `projects/${options.appNameWithoutPrefix}/src/main.ts`,
              polyfills: ["zone.js"],
              tsConfig: `projects/${options.appNameWithoutPrefix}/tsconfig.app.json`,
              inlineStyleLanguage: "scss",
              assets: [
                `projects/${options.appNameWithoutPrefix}/src/favicon.ico`,
                `projects/${options.appNameWithoutPrefix}/src/assets`,
              ],
              styles: [
                `projects/${options.appNameWithoutPrefix}/src/styles.scss`,
              ],
              scripts: [],
            },
            configurations: {
              production: {
                budgets: [
                  {
                    type: "initial",
                    maximumWarning: "500kb",
                    maximumError: "1500kb",
                  },
                  {
                    type: "anyComponentStyle",
                    maximumWarning: "2kb",
                    maximumError: "4kb",
                  },
                ],
                outputHashing: "all",
                aot: true,
                buildOptimizer: true,
                sourceMap: false,
                namedChunks: false,
                optimization: true,
              },
              development: {
                buildOptimizer: false,
                optimization: false,
                extractLicenses: false,
                sourceMap: true,
                namedChunks: true,
              },
            },
            defaultConfiguration: "production",
          },
          serve: {
            builder: "@angular-devkit/build-angular:dev-server",
            configurations: {
              production: {
                buildTarget: `${options.appName}:build:production`,
              },
              development: {
                buildTarget: `${options.appName}:build:development`,
              },
            },
            defaultConfiguration: "development",
          },
        },
      },
    };

    if (options.libraryName) {
      json.projects[options.appName].architect.build.options.assets.push({
        glob: "**/*",
        input: `dist/${
          options.libraryName.startsWith(SCOPE_IDENTIFIER)
            ? options.libraryName.slice(
                options.libraryName.indexOf(SCOPE_IDENTIFIER) + 1,
                options.libraryName.indexOf("/")
              ) + "/"
            : ""
        }${options.libraryNameWithoutScope}/assets`,
        output: "assets",
      });

      json.projects[options.appName].architect.build.options.styles.push(
        `dist/${
          options.libraryName.startsWith(SCOPE_IDENTIFIER)
            ? options.libraryName.slice(
                options.libraryName.indexOf(SCOPE_IDENTIFIER) + 1,
                options.libraryName.indexOf("/")
              ) + "/"
            : ""
        }${options.libraryNameWithoutScope}/styles/index.scss`
      );
    }

    tree.overwrite(path, JSON.stringify(json, null, 2));

    return tree;
  };
}

/**
 * This function is the main entry point for the schematic.
 * It processes the provided options, modifies them as needed,
 * and returns a rule that applies a series of transformations
 * to the Angular workspace.
 *
 * @param options - The schema options provided to the schematic.
 * @returns A `Rule` that applies the necessary transformations.
 */
export default function (options: Schema): Rule {
  options.appName = dasherize(options.appName);

  options.appNameHasScope = options.appName.startsWith(SCOPE_IDENTIFIER);

  const appNameWithoutPrefix = options.appName.replace(SCOPE_IDENTIFIER, "");
  const appNameWithoutScope = appNameWithoutPrefix.slice(
    options.appName.indexOf("/") > -1 ? options.appName.indexOf("/") : 0
  );

  options.appNameWithoutPrefix = appNameWithoutPrefix;
  options.appNameWithoutScope = appNameWithoutScope;

  options.libraryNameHasScope =
    options.libraryName?.startsWith(SCOPE_IDENTIFIER);

  if (options.libraryName) {
    const libraryNameWithoutPrefix = options.libraryName.replace(
      SCOPE_IDENTIFIER,
      ""
    );
    const libraryNameWithoutScope = libraryNameWithoutPrefix.slice(
      options.libraryName.indexOf("/") > -1
        ? options.libraryName.indexOf("/")
        : 0
    );

    options.libraryNameWithoutPrefix = libraryNameWithoutPrefix;
    options.libraryNameWithoutScope = libraryNameWithoutScope;
  }

  return (tree: Tree, context: SchematicContext) => {
    const rule = chain([
      copyBaseFiles(options),
      copyUnitTestFiles(options),
      updatePackageJson(options),
      updateVSCodeWorkspace(options),
      updateAngularWorkspace(options),
    ]);

    return rule(tree, context);
  };
}
