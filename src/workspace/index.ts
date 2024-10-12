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
import { copyPath } from "../utils/copy-path.fn";
import { Schema } from "./schema";

function executeSchematic(options: Schema): Rule {
  return externalSchematic("@schematics/angular", "ng-new", {
    name: options.name,
    version: "17.3.10",
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
      "test:esm":
        "node --experimental-vm-modules --no-warnings ./node_modules/jest/bin/jest.js",
      test: "npm run test:esm -- --silent",
      "test:local": "npm run test:esm",
      "test:coverage": "npm run test:esm -- --silent --collectCoverage",
      lint: "eslint ./projects --ext .ts --ext .html",
      "lint:fix": "eslint ./projects --ext .ts --ext .html --fix",
    };

    json.engines = {
      node: "^18.13.0 || >=20.9.0",
      npm: ">=9.0.0",
      yarn: ">= 4.0.0",
      pnpm: ">= 9.0.0",
    };

    json.dependencies["@angular/common"] = "^17.3.12";
    json.dependencies["@angular/compiler"] = "^17.3.12";
    json.dependencies["@angular/core"] = "^17.3.12";
    json.dependencies["@angular/forms"] = "^17.3.12";
    json.dependencies["@angular/platform-browser"] = "^17.3.12";
    json.dependencies["@angular/platform-browser-dynamic"] = "^17.3.12";
    json.dependencies["@angular/router"] = "^17.3.12";
    json.dependencies["rxjs"] = "^7.8.1";
    json.dependencies["tslib"] = "^2.7.0";
    json.dependencies["zone.js"] = "^0.15.0";

    json.devDependencies["@angular/cli"] = "^17.3.10";
    json.devDependencies["@angular/compiler-cli"] = "^17.3.12";
    json.devDependencies["@angular-devkit/build-angular"] = "^17.3.10";
    json.devDependencies["@angular-eslint/builder"] = "^17.5.3";
    json.devDependencies["@angular-eslint/eslint-plugin"] = "^17.5.3";
    json.devDependencies["@angular-eslint/eslint-plugin-template"] = "^17.5.3";
    json.devDependencies["@angular-eslint/template-parser"] = "^17.5.3";
    json.devDependencies["@types/node"] = "^20.14.8";
    json.devDependencies["@typescript-eslint/eslint-plugin"] = "^7.18.0";
    json.devDependencies["@typescript-eslint/parser"] = "^7.18.0";
    json.devDependencies["eslint"] = "^8.57.1";
    json.devDependencies["eslint-config-prettier"] = "^9.1.0";
    json.devDependencies["eslint-plugin-compat"] = "^6.0.1";
    json.devDependencies["eslint-plugin-import"] = "^2.31.0";
    json.devDependencies["eslint-plugin-jest"] = "^28.8.3";
    json.devDependencies["eslint-plugin-prettier"] = "^5.2.1";
    json.devDependencies["eslint-plugin-rxjs"] = "^5.0.3";
    json.devDependencies["eslint-plugin-rxjs-updated"] = "^1.0.8";
    json.devDependencies["eslint-plugin-rxjs-angular"] = "^2.0.1";
    json.devDependencies["eslint-plugin-simple-import-sort"] = "^12.1.1";
    json.devDependencies["eslint-plugin-testing-library"] = "^6.3.0";
    json.devDependencies["prettier"] = "^3.3.3";
    json.devDependencies["ng-packagr"] = "^17.3.0";
    json.devDependencies["typescript"] = "^5.4.5";

    // Delete Jasmin / Karma Tests
    delete json.devDependencies["@types/jasmine"];
    delete json.devDependencies["jasmine-core"];
    delete json.devDependencies["karma"];
    delete json.devDependencies["karma-chrome-launcher"];
    delete json.devDependencies["karma-coverage"];
    delete json.devDependencies["karma-jasmine"];
    delete json.devDependencies["karma-jasmine-html-reporter"];

    // Adds jest
    json.devDependencies["@types/jest"] = "^29.5.13";
    json.devDependencies["jest"] = "^29.7.0";
    json.devDependencies["jest-preset-angular"] = "^14.2.4";
    json.devDependencies["@testing-library/angular"] = "^17.3.1";
    json.devDependencies["@testing-library/jest-dom"] = "^6.5.0";
    json.devDependencies["@testing-library/user-event"] = "^14.5.2";
    json.devDependencies["ts-node"] = "^10.9.2";

    json.devDependencies["stylelint"] = "^16.9.0";
    json.devDependencies["stylelint-config-sass-guidelines"] = "^12.1.0";
    json.devDependencies["stylelint-config-standard-scss"] = "^13.1.0";
    json.devDependencies["stylelint-order"] = "^6.0.4";

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
