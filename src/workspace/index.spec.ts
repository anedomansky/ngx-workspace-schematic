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

    expect(tree.files).toContain("/test/.vscode/test.code-workspace");
    expect(tree.files).toContain("/test/.vscode/extensions.json");
    expect(tree.files).toContain("/test/.eslintrc.js");
    expect(tree.files).toContain("/test/.gitignore");
    expect(tree.files).toContain("/test/.stylelintrc.json");
    expect(tree.files).toContain("/test/angular.json");
    expect(tree.files).toContain("/test/jest-global-mocks.ts");
    expect(tree.files).toContain("/test/jest.config.ts");
    expect(tree.files).toContain("/test/README.md");
    expect(tree.files).toContain("/test/setup-jest.ts");
    expect(tree.files).toContain("/test/tsconfig.json");
    expect(tree.files).toContain("/test/tsconfig.spec.json");
  });

  it("should add all dependencies to package.json", async () => {
    const tree = await schematicRunner.runSchematic("workspace", {
      name: "test",
    });

    const expectedDependencies = {
      "@angular/animations": "~17.3.12",
      "@angular/common": "~17.3.12",
      "@angular/compiler": "~17.3.12",
      "@angular/core": "~17.3.12",
      "@angular/forms": "~17.3.12",
      "@angular/platform-browser": "~17.3.12",
      "@angular/platform-browser-dynamic": "~17.3.12",
      "@angular/router": "~17.3.12",
      rxjs: "~7.8.1",
      tslib: "~2.7.0",
      "zone.js": "~0.14.0",
    };

    const expectedDevDependencies = {
      "@angular/cli": "~17.3.10",
      "@angular/compiler-cli": "~17.3.12",
      "@angular-devkit/build-angular": "~17.3.10",
      "@angular-eslint/builder": "~17.5.3",
      "@angular-eslint/eslint-plugin": "~17.5.3",
      "@angular-eslint/eslint-plugin-template": "~17.5.3",
      "@angular-eslint/template-parser": "~17.5.3",
      "@jest/globals": "~29.7.0",
      "@testing-library/angular": "~17.3.1",
      "@testing-library/jest-dom": "~6.5.0",
      "@testing-library/user-event": "~14.5.2",
      "@types/jest": "~29.5.13",
      "@types/node": "~20.14.8",
      "@typescript-eslint/eslint-plugin": "~7.18.0",
      "@typescript-eslint/parser": "~7.18.0",
      eslint: "~8.57.1",
      "eslint-config-prettier": "~9.1.0",
      "eslint-plugin-compat": "~6.0.1",
      "eslint-plugin-import": "~2.31.0",
      "eslint-plugin-jest": "~28.8.3",
      "eslint-plugin-prettier": "~5.2.1",
      "eslint-plugin-simple-import-sort": "~12.1.1",
      "eslint-plugin-testing-library": "~6.3.0",
      "eslint-plugin-unused-imports": "~3.2.0",
      jest: "~29.7.0",
      "jest-environment-jsdom": "~29.7.0",
      "jest-preset-angular": "~14.2.4",
      "ng-packagr": "~17.3.0",
      prettier: "~3.3.3",
      stylelint: "~16.9.0",
      "stylelint-config-sass-guidelines": "~12.1.0",
      "stylelint-config-standard-scss": "~13.1.0",
      "stylelint-order": "~6.0.4",
      "ts-node": "~10.9.2",
      typescript: "~5.4.5",
    };

    const workspacePackageJson = JSON.parse(
      tree.readContent("/test/package.json")
    );

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

    const workspacePackageJson = JSON.parse(
      tree.readContent("/test/package.json")
    );

    const expectedScripts = {
      lint: "eslint ./projects --ext .ts --ext .html",
      "lint:fix": "eslint ./projects --ext .ts --ext .html --fix",
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

    const workspacePackageJson = JSON.parse(
      tree.readContent("/test/package.json")
    );

    const expectedEngines = {
      node: "^18.13.0 || >=20.9.0",
      npm: ">=9.0.0",
      yarn: ">= 4.0.0",
      pnpm: ">= 9.0.0",
    };

    expect(workspacePackageJson.engines).toStrictEqual(expectedEngines);
  });
});
