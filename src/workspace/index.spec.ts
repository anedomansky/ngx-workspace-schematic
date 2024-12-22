import { describe, it, expect } from "vitest";
import { SchematicTestRunner } from "@angular-devkit/schematics/testing";

describe("workspace schematic", () => {
  const schematicRunner = new SchematicTestRunner(
    "@anedomansky/ngx-workspace-schematic",
    require.resolve("../collection.json")
  );

  it("should create all files", async () => {
    const tree = await schematicRunner.runSchematic("workspace", {
      name: "test",
    });

    expect(tree.files).toContain("/.vscode/test.code-workspace");
    expect(tree.files).toContain("/.vscode/extensions.json");
    expect(tree.files).toContain("/eslint.config.mjs");
    expect(tree.files).toContain("/.gitignore");
    expect(tree.files).toContain("/.stylelintrc.json");
    expect(tree.files).toContain("/angular.json");
    expect(tree.files).toContain("/jest-global-mocks.ts");
    expect(tree.files).toContain("/jest.config.ts");
    expect(tree.files).toContain("/README.md");
    expect(tree.files).toContain("/setup-jest.ts");
    expect(tree.files).toContain("/tsconfig.json");
    expect(tree.files).toContain("/tsconfig.spec.json");
    expect(tree.files).toContain("/.npmrc");
  });

  it("should add all dependencies to package.json", async () => {
    const tree = await schematicRunner.runSchematic("workspace", {
      name: "test",
    });

    const expectedDependencies = {
      "@angular/animations": "~18.2.13",
      "@angular/common": "~18.2.13",
      "@angular/compiler": "~18.2.13",
      "@angular/core": "~18.2.13",
      "@angular/forms": "~18.2.13",
      "@angular/platform-browser": "~18.2.13",
      "@angular/platform-browser-dynamic": "~18.2.13",
      "@angular/router": "~18.2.13",
      rxjs: "~7.8.1",
      tslib: "~2.8.1",
      "zone.js": "~0.14.10",
    };

    const expectedDevDependencies = {
      "@angular/cli": "~18.2.12",
      "@angular/compiler-cli": "~18.2.13",
      "@angular-devkit/build-angular": "~18.2.12",
      "@jest/globals": "~29.7.0",
      "@testing-library/angular": "~17.3.2",
      "@testing-library/dom": "~10.4.0",
      "@testing-library/jest-dom": "~6.6.3",
      "@testing-library/user-event": "~14.5.2",
      "@types/jest": "~29.5.14",
      "@types/node": "~22.9.0",
      "angular-eslint": "~18.4.1",
      eslint: "~9.15.0",
      "eslint-config-prettier": "~9.1.0",
      "eslint-import-resolver-typescript": "~3.6.3",
      "eslint-plugin-compat": "~6.0.1",
      "eslint-plugin-import": "~2.31.0",
      "eslint-plugin-jest": "~28.9.0",
      "eslint-plugin-prettier": "~5.2.1",
      "eslint-plugin-simple-import-sort": "~12.1.1",
      "eslint-plugin-testing-library": "~6.4.0",
      "eslint-plugin-unused-imports": "~4.1.4",
      jest: "~29.7.0",
      "jest-environment-jsdom": "~29.7.0",
      "jest-preset-angular": "~14.3.1",
      "ng-packagr": "~18.2.1",
      prettier: "~3.3.3",
      stylelint: "~16.10.0",
      "stylelint-config-sass-guidelines": "~12.1.0",
      "stylelint-config-standard-scss": "~13.1.0",
      "stylelint-order": "~6.0.4",
      "ts-node": "~10.9.2",
      typescript: "~5.5.4",
      "typescript-eslint": "~8.15.0",
    };

    const workspacePackageJson = JSON.parse(tree.readContent("/package.json"));

    expect(workspacePackageJson.dependencies).toStrictEqual(
      expectedDependencies
    );

    expect(workspacePackageJson.devDependencies).toStrictEqual(
      expectedDevDependencies
    );
  });

  it("should add all scripts to package.json", async () => {
    const tree = await schematicRunner.runSchematic("workspace", {
      name: "test",
    });

    const workspacePackageJson = JSON.parse(tree.readContent("/package.json"));

    const expectedScripts = {
      lint: "eslint ./projects",
      "lint:fix": "eslint ./projects --fix",
      test: "npm run test:esm -- --silent",
      "test:coverage": "npm run test:esm -- --silent --collectCoverage",
      "test:esm":
        "node --experimental-vm-modules --no-warnings ./node_modules/jest/bin/jest.js",
      "test:local": "npm run test:esm",
    };

    expect(workspacePackageJson.scripts).toStrictEqual(expectedScripts);
  });

  it("should add correct engines to package.json", async () => {
    const tree = await schematicRunner.runSchematic("workspace", {
      name: "test",
    });

    const workspacePackageJson = JSON.parse(tree.readContent("/package.json"));

    const expectedEngines = {
      node: "^18.19.1 || ^20.11.1 || ^22.0.0",
    };

    expect(workspacePackageJson.engines).toStrictEqual(expectedEngines);
  });

  it("should set correct type in package.json", async () => {
    const tree = await schematicRunner.runSchematic("workspace", {
      name: "test",
    });

    const workspacePackageJson = JSON.parse(tree.readContent("/package.json"));

    expect(workspacePackageJson.type).toBe("module");
  });
});
