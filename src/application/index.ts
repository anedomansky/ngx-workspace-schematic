import { normalize } from "@angular-devkit/core";
import { dasherize } from "@angular-devkit/core/src/utils/strings";
import {
  chain,
  MergeStrategy,
  mergeWith,
  Rule,
  SchematicContext,
  SchematicsException,
  Tree,
} from "@angular-devkit/schematics";
import { copyPath } from "../utils/copy-path.fn";
import type { Schema } from "./schema";
import { SCOPE_IDENTIFIER } from "../utils/schema.model";

function copyBaseFiles(options: Schema): Rule {
  return mergeWith(
    copyPath<Schema>(
      options,
      "base",
      `${options.name}/projects/${options.appNameWithoutPrefix}`
    ),
    MergeStrategy.Overwrite
  );
}

function copyUnitTestFiles(options: Schema): Rule {
  return mergeWith(
    copyPath(options, "unit-testing", options.name),
    MergeStrategy.Overwrite
  );
}

function updatePackageJson(options: Schema): Rule {
  return (tree: Tree): Tree => {
    const path = `/${options.name}/package.json`;
    const file = tree.read(path);

    if (!file) {
      throw new SchematicsException("package.json not found.");
    }

    const json = JSON.parse(file.toString());

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

function updateVSCodeWorkspace(options: Schema): Rule {
  return (tree: Tree): Tree => {
    const path = `/${options.name}/.vscode/${options.name}.code-workspace`;
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

function updateAngularWorkspace(options: Schema): Rule {
  return (tree: Tree): Tree => {
    const path = `/${options.name}/angular.json`;
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
