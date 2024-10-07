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
import { copyPath } from "../utils/copy-path.fn";

function copyBaseFiles(options: Schema): Rule {
  return mergeWith(
    copyPath<Schema>(
      options,
      "base",
      `${options.name!}/projects/${options.appName}`
    ),
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

    switch (options.type) {
      case "complete":
        json.scripts = {
          [`start:app:${dasherize(options.appName)}`]: `ng serve ${dasherize(
            options.appName
          )}`,
          [`build:app:${dasherize(options.appName)}`]: `ng build ${dasherize(
            options.appName
          )}`,
          [`build:library:${dasherize(
            options.libraryName
          )}`]: `ng build @${options.libraryPackageName} --configuration=production`,
          [`build:library:${dasherize(
            options.libraryName
          )}:watch`]: `ng build @${options.libraryPackageName} --configuration development --watch`,
          "test:esm":
            "node --experimental-vm-modules --no-warnings ./node_modules/jest/bin/jest.js",
          test: "npm run test:esm -- --silent",
          "test:local": "npm run test:esm",
          [`test:lib:${dasherize(
            options.libraryName
          )}`]: `npm run test:esm -- -c=jest.${dasherize(
            options.libraryName
          )}.config.ts --silent`,
          [`test:lib:${dasherize(
            options.libraryName
          )}:local`]: `npm run test:esm -- -c=jest.${dasherize(
            options.libraryName
          )}.config.ts`,
          [`test:app:${dasherize(
            options.appName
          )}`]: `npm run test:esm -- -c=jest.${dasherize(
            options.appName
          )}.config.ts --silent`,
          [`test:app:${dasherize(
            options.appName
          )}:local`]: `npm run test:esm -- -c=jest.${dasherize(
            options.appName
          )}.config.ts`,
          "test:coverage": "npm run test:esm -- --silent --collectCoverage",
          lint: "eslint ./projects --ext .ts --ext .html",
          "lint:fix": "eslint ./projects --ext .ts --ext .html --fix",
        };
        break;
      case "application":
        json.scripts = {
          [`start:app:${dasherize(options.appName)}`]: `ng serve ${dasherize(
            options.appName
          )}`,
          [`build:app:${dasherize(options.appName)}`]: `ng build ${dasherize(
            options.appName
          )}`,
          "test:esm":
            "node --experimental-vm-modules --no-warnings ./node_modules/jest/bin/jest.js",
          test: "npm run test:esm -- --silent",
          "test:local": "npm run test:esm",
          [`test:app:${dasherize(
            options.appName
          )}`]: `npm run test:esm -- -c=jest.${dasherize(
            options.appName
          )}.config.ts --silent`,
          [`test:app:${dasherize(
            options.appName
          )}:local`]: `npm run test:esm -- -c=jest.${dasherize(
            options.appName
          )}.config.ts`,
          "test:coverage": "npm run test:esm -- --silent --collectCoverage",
          lint: "eslint ./projects --ext .ts --ext .html",
          "lint:fix": "eslint ./projects --ext .ts --ext .html --fix",
        };
        break;
      case "library":
        json.scripts = {
          [`build:library:${dasherize(
            options.libraryName
          )}`]: `ng build @${options.libraryPackageName} --configuration=production`,
          [`build:library:${dasherize(
            options.libraryName
          )}:watch`]: `ng build @${options.libraryPackageName} --configuration development --watch`,
          "test:esm":
            "node --experimental-vm-modules --no-warnings ./node_modules/jest/bin/jest.js",
          test: "npm run test:esm -- --silent",
          "test:local": "npm run test:esm",
          [`test:lib:${dasherize(
            options.libraryName
          )}`]: `npm run test:esm -- -c=jest.${dasherize(
            options.libraryName
          )}.config.ts --silent`,
          [`test:lib:${dasherize(
            options.libraryName
          )}:local`]: `npm run test:esm -- -c=jest.${dasherize(
            options.libraryName
          )}.config.ts`,
          "test:coverage": "npm run test:esm -- --silent --collectCoverage",
          lint: "eslint ./projects --ext .ts --ext .html",
          "lint:fix": "eslint ./projects --ext .ts --ext .html --fix",
        };
        break;
    }

    tree.overwrite(path, JSON.stringify(json, null, 2));

    return tree;
  };
}

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
    const rule = chain([copyBaseFiles(options), updatePackageJson(options)]);

    return rule(tree, context);
  };
}
