import {
  chain,
  MergeStrategy,
  mergeWith,
  Rule,
  SchematicContext,
  SchematicsException,
  strings,
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
    copyPath(options, "unit-testing", options.name!),
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

function updateVSCodeWorkspace(options: Schema): Rule {}

function updateAngularWorkspace(options: Schema): Rule {}

export default function (options: Schema): Rule {
  if (!options.name) {
    throw new SchematicsException("Option (name) is required.");
  }

  options.name = strings.dasherize(options.name);

  if (!options.appName) {
    options.appName = `${options.name}-app`;
  } else {
    options.appName = strings.dasherize(options.appName);
  }

  return (tree: Tree, context: SchematicContext) => {
    const rule = chain([
      copyBaseFiles(options),
      copyUnitTestFiles(options),
      updatePackageJson(options),
    ]);

    return rule(tree, context);
  };
}
