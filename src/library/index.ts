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
import { Schema } from "./schema";
import { copyPath } from "src/utils/copy-path.fn";

function copyBaseFiles(options: Schema): Rule {
  return mergeWith(
    copyPath<Schema>(
      options,
      "base",
      `${options.name}/projects/${options.libraryPackageName}`
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
      [`build:library:${options.libraryName}`]: `ng build @${options.libraryPackageName} --configuration=production`,
      [`build:library:${options.libraryName}:watch`]: `ng build @${options.libraryPackageName} --configuration development --watch`,
      [`test:lib:${options.libraryName}`]: `npm run test:esm -- -c=jest.${options.libraryName}.config.ts --silent`,
      [`test:lib:${options.libraryName}:local`]: `npm run test:esm -- -c=jest.${options.libraryName}.config.ts`,
    };

    tree.overwrite(path, JSON.stringify(json, null, 2));

    return tree;
  };
}

function updateVSCodeWorkspace(options: Schema): Rule {}
function updateAngularWorkspace(options: Schema): Rule {}
function updateTsconfig(options: Schema): Rule {}

export default function (options: Schema): Rule {
  if (!options.name) {
    throw new SchematicsException("Option (name) is required.");
  }

  if (!options.libraryName) {
    throw new SchematicsException("Option (libraryName) is required.");
  }

  options.libraryName = strings.dasherize(options.libraryName);

  if (!options.libraryNamespace) {
    options.libraryPackageName = options.libraryName;
  } else {
    options.libraryNamespace = strings.dasherize(options.libraryNamespace);
    options.libraryPackageName = `${options.libraryNamespace.replace(
      "@",
      ""
    )}/${options.libraryName}`;
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
