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
      `${options.name}/projects/${options.libraryNameWithoutPrefix}`
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
      [`build:lib:${options.libraryNameWithoutScope}`]: `ng build ${options.libraryName} --configuration=production`,
      [`build:lib:${options.libraryNameWithoutScope}:watch`]: `ng build ${options.libraryName} --configuration development --watch`,
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
      [options.libraryName]: {
        root: normalize(`projects/${options.libraryNameWithoutPrefix}`),
        sourceRoot: normalize(
          `projects/${options.libraryNameWithoutPrefix}/src`
        ),
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
        architect: {
          build: {
            builder: "@angular-devkit/build-angular:ng-packagr",
            options: {
              project: `projects/${options.libraryNameWithoutPrefix}/ng-package.json`,
            },
            configurations: {
              production: {
                tsConfig: `projects/${options.libraryNameWithoutPrefix}/tsconfig.lib.prod.json`,
              },
              development: {
                tsConfig: `projects/${options.libraryNameWithoutPrefix}/tsconfig.lib.json`,
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

    json.compilerOptions = {
      ...json.compilerOptions,
      paths: {
        ...json.compilerOptions.paths,
        [options.libraryName]: [`dist/${options.libraryNameWithoutPrefix}`],
      },
    };

    tree.overwrite(path, JSON.stringify(json, null, 2));

    return tree;
  };
}

function updateUnitTestConfig(options: Schema): Rule {
  return (tree: Tree): Tree => {
    const path = `/${options.name}/jest.config.ts`;

    const file = tree.readText(path);

    if (!file) {
      throw new SchematicsException("jest.config.ts not found.");
    }

    const libraryScope = options.libraryName.substring(
      options.libraryName.indexOf(SCOPE_IDENTIFIER) + 1 > -1
        ? options.libraryName.indexOf(SCOPE_IDENTIFIER) + 1
        : 0,
      options.libraryName.indexOf("/")
    );
    const newEntry = `'^${options.libraryName}': '<rootDir>/dist/${
      options.libraryNameWithoutPrefix
    }/fesm2022/${options.libraryNameHasScope ? libraryScope + "-" : ""}${
      options.libraryNameWithoutScope
    }.mjs',`;

    const updatedFile = file.replace(/moduleNameMapper:\s*{[^}]*}/, (match) => {
      // Remove the closing brace and add the new entry
      const updatedMapper = match.replace(/}$/, `  ${newEntry}\n  }`);
      return updatedMapper;
    });

    tree.overwrite(path, updatedFile);

    return tree;
  };
}

export default function (options: Schema): Rule {
  options.libraryName = dasherize(options.libraryName);

  options.libraryNameHasScope =
    options.libraryName.startsWith(SCOPE_IDENTIFIER);

  const libraryNameWithoutPrefix = options.libraryName.replace(
    SCOPE_IDENTIFIER,
    ""
  );
  const libraryNameWithoutScope = libraryNameWithoutPrefix.slice(
    options.libraryName.indexOf("/") > -1 ? options.libraryName.indexOf("/") : 0
  );

  options.libraryNameWithoutPrefix = libraryNameWithoutPrefix;
  options.libraryNameWithoutScope = libraryNameWithoutScope;

  if (options.appName) {
    options.appName = dasherize(options.appName);

    const appNameWithoutPrefix = options.appName.replace(SCOPE_IDENTIFIER, "");
    const appNameWithoutScope = appNameWithoutPrefix.slice(
      options.appName.indexOf("/") > -1 ? options.appName.indexOf("/") : 0
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
