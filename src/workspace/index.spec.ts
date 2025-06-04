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
      "@angular/animations": "~19.2.10",
      "@angular/common": "~19.2.10",
      "@angular/compiler": "~19.2.10",
      "@angular/core": "~19.2.10",
      "@angular/forms": "~19.2.10",
      "@angular/platform-browser": "~19.2.10",
      "@angular/platform-browser-dynamic": "~19.2.10",
      "@angular/router": "~19.2.10",
      rxjs: "~7.8.2",
      tslib: "~2.8.1",
      "zone.js": "~0.15.0",
    };

    const expectedDevDependencies = {
      "@anedomansky/eslint-config": "1.2.0",
      "@angular/cli": "~19.2.12",
      "@angular/compiler-cli": "~19.2.10",
      "@angular-devkit/build-angular": "~19.2.12",
      "@jest/globals": "~29.7.0",
      "@testing-library/angular": "~17.3.7",
      "@testing-library/dom": "~10.4.0",
      "@testing-library/jest-dom": "~6.6.3",
      "@testing-library/user-event": "~14.6.1",
      "@types/jest": "~29.5.14",
      "@types/node": "~22.15.18",
      eslint: "~9.26.0",
      jest: "~29.7.0",
      "jest-environment-jsdom": "~29.7.0",
      "jest-preset-angular": "~14.5.5",
      "ng-packagr": "~19.2.2",
      prettier: "~3.5.3",
      stylelint: "~16.19.1",
      "stylelint-config-sass-guidelines": "~12.1.0",
      "stylelint-config-standard-scss": "~15.0.0",
      "stylelint-order": "~7.0.0",
      "ts-node": "~10.9.2",
      typescript: "~5.8.3",
      "typescript-eslint": "~8.32.1",
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
