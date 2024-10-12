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
import { copyPath } from "src/utils/copy-path.fn";
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

    const libraryNameWithoutScope = options.libraryName
      .replace("@", "")
      .slice(options.libraryName.indexOf("/") + 1);

    json.scripts = {
      ...json.scripts,
      [`build:library:${libraryNameWithoutScope}`]: `ng build ${options.libraryName} --configuration=production`,
      [`build:library:${libraryNameWithoutScope}:watch`]: `ng build ${options.libraryName} --configuration development --watch`,
      [`test:lib:${libraryNameWithoutScope}`]: `npm run test:esm -- -c=jest.${libraryNameWithoutScope}.config.ts --silent`,
      [`test:lib:${libraryNameWithoutScope}:local`]: `npm run test:esm -- -c=jest.${libraryNameWithoutScope}.config.ts`,
    };

    tree.overwrite(path, JSON.stringify(json, null, 2));

    return tree;
  };
}

// TODO: implement the following functions
function updateVSCodeWorkspace(options: Schema): Rule {
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

function updateAngularWorkspace(options: Schema): Rule {
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

function updateTsconfig(options: Schema): Rule {
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

export default function (options: Schema): Rule {
  options.libraryName = dasherize(options.libraryName);

  return (tree: Tree, context: SchematicContext) => {
    const rule = chain([
      copyBaseFiles(options),
      copyUnitTestFiles(options),
      updatePackageJson(options),
    ]);

    return rule(tree, context);
  };
}
