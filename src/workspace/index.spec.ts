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
      "@angular/animations": "20.1.4",
      "@angular/common": "20.1.4",
      "@angular/compiler": "20.1.4",
      "@angular/core": "20.1.4",
      "@angular/forms": "20.1.4",
      "@angular/platform-browser": "20.1.4",
      "@angular/platform-browser-dynamic": "20.1.4",
      "@angular/router": "20.1.4",
      rxjs: "7.8.2",
      tslib: "2.8.1",
      "zone.js": "0.15.1",
    };

    const expectedDevDependencies = {
      "@anedomansky/eslint-config": "1.3.0",
      "@anedomansky/stylelint-config": "1.0.0",
      "@angular/build": "20.1.4",
      "@angular/cli": "20.1.4",
      "@angular/compiler-cli": "20.1.4",
      "@jest/globals": "30.0.5",
      "@testing-library/angular": "17.4.0",
      "@testing-library/dom": "10.4.1",
      "@testing-library/jest-dom": "6.6.4",
      "@testing-library/user-event": "14.6.1",
      "@types/jest": "30.0.0",
      "@types/node": "24.1.0",
      eslint: "9.32.0",
      jest: "30.0.5",
      "jest-environment-jsdom": "30.0.5",
      "jest-preset-angular": "15.0.0",
      "ng-packagr": "20.1.0",
      prettier: "3.6.2",
      stylelint: "16.23.0",
      "ts-node": "10.9.2",
      typescript: "5.8.3",
      "typescript-eslint": "8.38.0",
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
