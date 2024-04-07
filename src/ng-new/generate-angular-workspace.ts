import { normalize } from "@angular-devkit/core";
import {
  MergeStrategy,
  Rule,
  SchematicContext,
  Tree,
  apply,
  applyTemplates,
  chain,
  externalSchematic,
  mergeWith,
  move,
  strings,
  url,
} from "@angular-devkit/schematics";
import { Source } from "@angular-devkit/schematics/src/engine/interface";

import { Schema } from "./schema";

function executeSchematic(options: Schema): Rule {
  return externalSchematic("@schematics/angular", "ng-new", {
    name: options.name,
    version: "16.1.6",
    directory: options.name,
    routing: true,
    style: "scss",
    createApplication: false,
    inlineStyle: false,
    inlineTemplate: false,
    skipInstall: true,
    skipGit: false,
  });
}

export function copyPath(
  options: Schema,
  path: string,
  pathToCopyTo: string
): Source {
  return apply(url(`./files/${path}`), [
    applyTemplates({
      ...options,
      ...strings,
    }),
    move(normalize(pathToCopyTo)),
  ]);
}

function copyBaseFiles(options: Schema): Rule {
  return mergeWith(
    copyPath(options, "base-setup", options.name),
    MergeStrategy.Overwrite
  );
}

function updatePackageJson(options: Schema): Rule {
  return (tree: Tree): Tree => {
    const path = `/${options.name}/package.json`;
    const file = tree.read(path);
    if (!file) {
      return tree;
    }

    const json = JSON.parse(file.toString());

    json.scripts = {
      start: "ng serve",
      build: `ng build ${options.appName}`,
      "build:library": `ng build @${options.libraryPackageName} --configuration=production`,
      "build:library:watch": `ng build @${options.libraryPackageName} --configuration development --watch`,
      test: "npm run test:lib && npm run test:app",
      "test:lib": "jest --silent --config ./jest.lib.config.ts",
      "test:lib:local": "jest --config ./jest.lib.config.ts",
      "test:app": "jest --silent --config ./jest.app.config.ts",
      "test:app:local": "jest --config ./jest.app.config.ts",
      "test:coverage":
        "jest --silent --collectCoverage --config ./jest.lib.config.ts",
      lint: "eslint . --ext .ts --ext .html",
      "lint:fix": "eslint . --ext .ts --ext .html --fix",
      "build:complete":
        "npm run lint:fix && npm run test:lib && npm run build:library && npm run test:app && npm run build",
    };

    json.dependencies["@angular/animations"] = "~16.2.12";
    json.dependencies["@angular/common"] = "~16.2.12";
    json.dependencies["@angular/compiler"] = "~16.2.12";
    json.dependencies["@angular/core"] = "~16.2.12";
    json.dependencies["@angular/forms"] = "~16.2.12";
    json.dependencies["@angular/platform-browser"] = "~16.2.12";
    json.dependencies["@angular/platform-browser-dynamic"] = "~16.2.12";
    json.dependencies["@angular/router"] = "~16.2.12";
    json.dependencies["rxjs"] = "~7.8.1";
    json.dependencies["tslib"] = "~2.6.2";
    json.dependencies["zone.js"] = "~0.13.1";

    json.devDependencies["@angular/cli"] = "~16.2.10";
    json.devDependencies["@angular/compiler-cli"] = "~16.2.12";
    json.devDependencies["@angular-devkit/build-angular"] = "~16.2.10";
    json.devDependencies["@angular-eslint/builder"] = "~16.3.1";
    json.devDependencies["@angular-eslint/eslint-plugin"] = "~16.3.1";
    json.devDependencies["@angular-eslint/eslint-plugin-template"] = "~16.3.1";
    json.devDependencies["@angular-eslint/template-parser"] = "~16.3.1";
    json.devDependencies["@types/node"] = "~20.10.5";
    json.devDependencies["@typescript-eslint/eslint-plugin"] = "~6.15.0";
    json.devDependencies["@typescript-eslint/parser"] = "~6.15.0";
    json.devDependencies["eslint"] = "~8.56.0";
    json.devDependencies["eslint-config-prettier"] = "~9.1.0";
    json.devDependencies["eslint-plugin-import"] = "~2.29.1";
    json.devDependencies["eslint-plugin-prettier"] = "~5.0.1";
    json.devDependencies["eslint-plugin-rxjs"] = "~5.0.3";
    json.devDependencies["eslint-plugin-rxjs-angular"] = "~2.0.1";
    json.devDependencies["eslint-plugin-simple-import-sort"] = "~10.0.0";
    json.devDependencies["prettier"] = "~3.1.1";
    json.devDependencies["ng-packagr"] = "~16.2.3";
    json.devDependencies["typescript"] = "~5.1.6";

    // Delete Jasmin / Karma Tests
    delete json.devDependencies["@types/jasmine"];
    delete json.devDependencies["jasmine-core"];
    delete json.devDependencies["karma"];
    delete json.devDependencies["karma-chrome-launcher"];
    delete json.devDependencies["karma-coverage"];
    delete json.devDependencies["karma-jasmine"];
    delete json.devDependencies["karma-jasmine-html-reporter"];

    // Adds jest
    json.devDependencies["@types/jest"] = "~29.5.11";
    json.devDependencies["jest"] = "~29.7.0";
    json.devDependencies["jest-preset-angular"] = "~13.1.4";
    json.devDependencies["ts-node"] = "~10.9.2";

    json.devDependencies["stylelint"] = "~14.16.1";
    json.devDependencies["stylelint-config-prettier"] = "~9.0.5";
    json.devDependencies["stylelint-config-sass-guidelines"] = "~9.0.1";
    json.devDependencies["stylelint-config-standard"] = "~29.0.0";
    json.devDependencies["stylelint-order"] = "~6.0.3";
    json.devDependencies["stylelint-scss"] = "~5.2.1";

    tree.overwrite(path, JSON.stringify(json, null, 2));
    return tree;
  };
}

export function generateAngularWorkspace(options: Schema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const rule = chain([
      executeSchematic(options),
      copyBaseFiles(options),
      updatePackageJson(options),
      mergeWith(
        copyPath(
          options,
          "library",
          `${options.name}/projects/${strings.dasherize(
            options.libraryPackageName
          )}`
        ),
        MergeStrategy.Overwrite
      ),
      mergeWith(
        copyPath(
          options,
          "app",
          `${options.name}/projects/${strings.dasherize(options.appName)}`
        ),
        MergeStrategy.Overwrite
      ),
    ]);
    return rule(tree, context);
  };
}
