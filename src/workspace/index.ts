import {
  chain,
  externalSchematic,
  MergeStrategy,
  mergeWith,
  Rule,
  SchematicContext,
  SchematicsException,
  Tree,
} from "@angular-devkit/schematics";
import { copyPath } from "../utils/copy-path.fn.js";
import type { Schema } from "./schema";

function executeSchematic(options: Schema): Rule {
  return externalSchematic("@schematics/angular", "ng-new", {
    name: options.name,
    version: "18.2.10",
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

function copyBaseFiles(options: Schema): Rule {
  return mergeWith(
    copyPath<Schema>(options, "", options.name),
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
      lint: "eslint ./projects --ext .ts --ext .html",
      "lint:fix": "eslint ./projects --ext .ts --ext .html --fix",
      test: "npm run test:esm -- --silent",
      "test:coverage": "npm run test:esm -- --silent --collectCoverage",
      "test:esm":
        "node --experimental-vm-modules --no-warnings ./node_modules/jest/bin/jest.js",
      "test:local": "npm run test:esm",
    };

    json.engines = {
      node: "^18.19.1 || ^20.11.1 || ^22.0.0",
    };

    json.dependencies["@angular/animations"] = "~18.2.10";
    json.dependencies["@angular/common"] = "~18.2.10";
    json.dependencies["@angular/compiler"] = "~18.2.10";
    json.dependencies["@angular/core"] = "~18.2.10";
    json.dependencies["@angular/forms"] = "~18.2.10";
    json.dependencies["@angular/platform-browser"] = "~18.2.10";
    json.dependencies["@angular/platform-browser-dynamic"] = "~18.2.10";
    json.dependencies["@angular/router"] = "~18.2.10";
    json.dependencies["rxjs"] = "~7.8.1";
    json.dependencies["tslib"] = "~2.8.0";
    json.dependencies["zone.js"] = "~0.14.10";

    json.devDependencies["@angular/cli"] = "~18.2.11";
    json.devDependencies["@angular/compiler-cli"] = "~18.2.10";
    json.devDependencies["@angular-devkit/build-angular"] = "~18.2.11";
    json.devDependencies["@jest/globals"] = "~29.7.0";
    json.devDependencies["@testing-library/angular"] = "~17.3.1";
    json.devDependencies["@testing-library/dom"] = "~10.4.0";
    json.devDependencies["@testing-library/jest-dom"] = "~6.6.2";
    json.devDependencies["@testing-library/user-event"] = "~14.5.2";
    json.devDependencies["@types/jest"] = "~29.5.14";
    json.devDependencies["@types/node"] = "~22.8.4";
    json.devDependencies["angular-eslint"] = "~18.4.0";
    json.devDependencies["eslint"] = "~9.13.0";
    json.devDependencies["eslint-config-prettier"] = "~9.1.0";
    json.devDependencies["eslint-import-resolver-typescript"] = "~3.6.3";
    json.devDependencies["eslint-plugin-compat"] = "~6.0.1";
    json.devDependencies["eslint-plugin-import"] = "~2.31.0";
    json.devDependencies["eslint-plugin-jest"] = "~28.8.3";
    json.devDependencies["eslint-plugin-prettier"] = "~5.2.1";
    json.devDependencies["eslint-plugin-simple-import-sort"] = "~12.1.1";
    json.devDependencies["eslint-plugin-testing-library"] = "~6.4.0";
    json.devDependencies["eslint-plugin-unused-imports"] = "~4.1.4";
    json.devDependencies["jest"] = "~29.7.0";
    json.devDependencies["jest-environment-jsdom"] = "~29.7.0";
    json.devDependencies["jest-preset-angular"] = "~14.2.4";
    json.devDependencies["ng-packagr"] = "~18.2.1";
    json.devDependencies["prettier"] = "~3.3.3";
    json.devDependencies["stylelint"] = "~16.10.0";
    json.devDependencies["stylelint-config-sass-guidelines"] = "~12.1.0";
    json.devDependencies["stylelint-config-standard-scss"] = "~13.1.0";
    json.devDependencies["stylelint-order"] = "~6.0.4";
    json.devDependencies["ts-node"] = "~10.9.2";
    json.devDependencies["typescript"] = "~5.5.4";
    json.devDependencies["typescript-eslint"] = "~8.12.2";

    // Delete Jasmin / Karma Tests
    delete json.devDependencies["@types/jasmine"];
    delete json.devDependencies["jasmine-core"];
    delete json.devDependencies["karma"];
    delete json.devDependencies["karma-chrome-launcher"];
    delete json.devDependencies["karma-coverage"];
    delete json.devDependencies["karma-jasmine"];
    delete json.devDependencies["karma-jasmine-html-reporter"];

    tree.overwrite(path, JSON.stringify(json, null, 2));

    return tree;
  };
}

export default function (options: Schema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const rule = chain([
      executeSchematic(options),
      copyBaseFiles(options),
      updatePackageJson(options),
    ]);

    return rule(tree, context);
  };
}
