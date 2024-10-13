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
import { Schema } from "./schema";

function copyBaseFiles(options: Schema): Rule {
  return mergeWith(
    copyPath<Schema>(
      options,
      "base",
      `${options.name}/projects/${options.appName}`
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
      [`start:app:${options.appName}`]: `ng serve ${options.appName}`,
      [`build:app:${options.appName}`]: `ng build ${options.appName}`,
      [`test:app:${options.appName}`]: `npm run test:esm -- -c=jest.${options.appName}.config.ts --silent`,
      [`test:app:${options.appName}:local`]: `npm run test:esm -- -c=jest.${options.appName}.config.ts`,
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
        name: options.appName,
        path: `../projects/${options.appName}`,
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
        root: normalize(`projects/${options.appName}`),
        sourceRoot: normalize(`projects/${options.appName}/src`),
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
              outputPath: `dist/${options.appName}`,
              index: `projects/${options.appName}/src/index.html`,
              main: `projects/${options.appName}/src/main.ts`,
              polyfills: ["zone.js"],
              tsConfig: `projects/${options.appName}/tsconfig.app.json`,
              inlineStyleLanguage: "scss",
              assets: [
                `projects/${options.appName}/src/favicon.ico`,
                `projects/${options.appName}/src/assets`,
              ],
              styles: [`projects/${options.appName}/src/styles.scss`],
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
          "extract-i18n": {
            builder: "@angular-devkit/build-angular:extract-i18n",
            options: {
              buildTarget: `${options.appName}:build`,
            },
          },
        },
      },
    };

    tree.overwrite(path, JSON.stringify(json, null, 2));

    return tree;
  };
}

export default function (options: Schema): Rule {
  if (!options.appName) {
    options.appName = `${options.name}-app`;
  } else {
    options.appName = dasherize(options.appName);
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
