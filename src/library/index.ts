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
      `${options.name}/projects/${options.libraryName.replace("@", "")}`
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
      [`build:library:${options.libraryNameWithoutScope}`]: `ng build ${options.libraryName} --configuration=production`,
      [`build:library:${options.libraryNameWithoutScope}:watch`]: `ng build ${options.libraryName} --configuration development --watch`,
      [`test:lib:${options.libraryNameWithoutScope}`]: `npm run test:esm -- -c=jest.${options.libraryNameWithoutScope}.config.ts --silent`,
      [`test:lib:${options.libraryNameWithoutScope}:local`]: `npm run test:esm -- -c=jest.${options.libraryNameWithoutScope}.config.ts`,
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

    const libraryName = options.libraryName.replace("@", "");

    json.folders = [
      ...json.folders,
      {
        name: libraryName,
        path: `../projects/${libraryName}`,
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

    const libraryName = options.libraryName.replace("@", "");

    json.projects = {
      ...json.projects,
      [options.libraryName]: {
        root: normalize(`projects/${libraryName}`),
        sourceRoot: normalize(`projects/${libraryName}/src`),
        prefix: "lib",
        projectType: "library",
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
        targets: {
          build: {
            builder: "@angular-devkit/build-angular:ng-packagr",
            options: {
              project: `projects/${libraryName}/ng-packagr.json`,
            },
            configurations: {
              production: {
                tsConfig: `projects/${libraryName}/tsconfig.lib.prod.json`,
              },
              development: {
                tsConfig: `projects/${libraryName}/tsconfig.lib.json`,
              },
            },
            defaultConfiguration: "production",
          },
        },
      },
    };

    tree.overwrite(path, JSON.stringify(json, null, 2));

    return tree;
  };
}

function updateTsconfig(options: Schema): Rule {
  return (tree: Tree): Tree => {
    const path = `/${options.name}/tsconfig.json`;
    const file = tree.read(path);
    if (!file) {
      throw new SchematicsException("tsconfig.json not found.");
    }

    const json = JSON.parse(file.toString());

    const libraryName = options.libraryName.replace("@", "");

    json.compilerOptions = {
      ...json.compilerOptions,
      paths: {
        ...json.compilerOptions.paths,
        [options.libraryName]: [`dist/${libraryName}`],
      },
    };

    tree.overwrite(path, JSON.stringify(json, null, 2));

    return tree;
  };
}

export default function (options: Schema): Rule {
  options.libraryName = dasherize(options.libraryName);

  const libraryNameWithoutScope = options.libraryName
    .replace("@", "")
    .slice(options.libraryName.indexOf("/") + 1);

  options.libraryNameWithoutScope = libraryNameWithoutScope;

  return (tree: Tree, context: SchematicContext) => {
    const rule = chain([
      copyBaseFiles(options),
      copyUnitTestFiles(options),
      updatePackageJson(options),
      updateVSCodeWorkspace(options),
      updateAngularWorkspace(options),
      updateTsconfig(options),
    ]);

    return rule(tree, context);
  };
}
