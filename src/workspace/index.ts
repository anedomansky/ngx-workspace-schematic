import {
  chain,
  externalSchematic,
  MergeStrategy,
  mergeWith,
  type Rule,
  type SchematicContext,
  SchematicsException,
  type Tree,
} from "@angular-devkit/schematics";
import { copyPath } from "../utils/copy-path.fn.js";
import type { Schema } from "./schema";
import type { PackageJSON } from "../models/package-json-model.js";

/**
 * Executes an Angular schematic to create a new workspace.
 *
 * @param options - The schema options for the schematic.
 * @returns A `Rule` that applies the schematic.
 *
 * @remarks
 * This function uses the `externalSchematic` function to invoke the `ng-new` schematic
 * from the `@schematics/angular` collection. The schematic is configured to create a new
 * Angular workspace with the specified options.
 */
function executeSchematic(options: Schema): Rule {
  return externalSchematic("@schematics/angular", "ng-new", {
    name: options.name,
    version: "18.2.12",
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

/**
 * Copies the base files to the specified destination.
 *
 * @param options - The schema options that define the source and destination paths.
 * @returns A `Rule` that merges the copied files with the existing files, using the overwrite strategy.
 */
function copyBaseFiles(options: Schema): Rule {
  return mergeWith(
    copyPath<Schema>(options, "", null),
    MergeStrategy.Overwrite
  );
}

/**
 * Updates the `package.json` file in the Angular workspace with specific configurations.
 *
 * This function performs the following updates:
 * - Sets the `type` to `"module"`.
 * - Adds and updates various npm scripts.
 * - Specifies the required Node.js engine versions.
 * - Adds and updates `dependencies` and `devDependencies` for Angular, ESLint, Jest, and other tools.
 * - Removes Jasmine and Karma related `devDependencies`.
 *
 * @param options - The schema options for the rule.
 * @returns A `Rule` that updates the `package.json` file in the Angular workspace.
 * @throws `SchematicsException` if the `package.json` file is not found.
 */
function updatePackageJson(options: Schema): Rule {
  return (tree: Tree): Tree => {
    const path = "package.json";
    const file = tree.read(path);

    if (!file) {
      throw new SchematicsException("package.json not found.");
    }

    const json = JSON.parse(file.toString()) as PackageJSON;

    json.type = "module";

    json.scripts = {
      lint: "eslint ./projects",
      "lint:fix": "eslint ./projects --fix",
      test: "npm run test:esm -- --silent",
      "test:coverage": "npm run test:esm -- --silent --collectCoverage",
      "test:esm":
        "node --experimental-vm-modules --no-warnings ./node_modules/jest/bin/jest.js",
      "test:local": "npm run test:esm",
    };

    json.engines = {
      node: "^18.19.1 || ^20.11.1 || ^22.0.0",
    };

    json.dependencies["@angular/animations"] = "~18.2.13";
    json.dependencies["@angular/common"] = "~18.2.13";
    json.dependencies["@angular/compiler"] = "~18.2.13";
    json.dependencies["@angular/core"] = "~18.2.13";
    json.dependencies["@angular/forms"] = "~18.2.13";
    json.dependencies["@angular/platform-browser"] = "~18.2.13";
    json.dependencies["@angular/platform-browser-dynamic"] = "~18.2.13";
    json.dependencies["@angular/router"] = "~18.2.13";
    json.dependencies["rxjs"] = "~7.8.1";
    json.dependencies["tslib"] = "~2.8.1";
    json.dependencies["zone.js"] = "~0.14.10";

    json.devDependencies["@angular/cli"] = "~18.2.12";
    json.devDependencies["@angular/compiler-cli"] = "~18.2.13";
    json.devDependencies["@angular-devkit/build-angular"] = "~18.2.12";
    json.devDependencies["@jest/globals"] = "~29.7.0";
    json.devDependencies["@testing-library/angular"] = "~17.3.2";
    json.devDependencies["@testing-library/dom"] = "~10.4.0";
    json.devDependencies["@testing-library/jest-dom"] = "~6.6.3";
    json.devDependencies["@testing-library/user-event"] = "~14.5.2";
    json.devDependencies["@types/jest"] = "~29.5.14";
    json.devDependencies["@types/node"] = "~22.9.0";
    json.devDependencies["angular-eslint"] = "~18.4.1";
    json.devDependencies["eslint"] = "~9.15.0";
    json.devDependencies["eslint-config-prettier"] = "~9.1.0";
    json.devDependencies["eslint-import-resolver-typescript"] = "~3.6.3";
    json.devDependencies["eslint-plugin-compat"] = "~6.0.1";
    json.devDependencies["eslint-plugin-import"] = "~2.31.0";
    json.devDependencies["eslint-plugin-jest"] = "~28.9.0";
    json.devDependencies["eslint-plugin-prettier"] = "~5.2.1";
    json.devDependencies["eslint-plugin-simple-import-sort"] = "~12.1.1";
    json.devDependencies["eslint-plugin-testing-library"] = "~6.4.0";
    json.devDependencies["eslint-plugin-unused-imports"] = "~4.1.4";
    json.devDependencies["jest"] = "~29.7.0";
    json.devDependencies["jest-environment-jsdom"] = "~29.7.0";
    json.devDependencies["jest-preset-angular"] = "~14.3.1";
    json.devDependencies["ng-packagr"] = "~18.2.1";
    json.devDependencies["prettier"] = "~3.3.3";
    json.devDependencies["stylelint"] = "~16.10.0";
    json.devDependencies["stylelint-config-sass-guidelines"] = "~12.1.0";
    json.devDependencies["stylelint-config-standard-scss"] = "~13.1.0";
    json.devDependencies["stylelint-order"] = "~6.0.4";
    json.devDependencies["ts-node"] = "~10.9.2";
    json.devDependencies["typescript"] = "~5.5.4";
    json.devDependencies["typescript-eslint"] = "~8.15.0";

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

/**
 * Schematic for creating new Angular workspaces.
 *
 * @param options - The options provided to the schematic.
 * @returns A Rule that applies the schematic.
 */
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
