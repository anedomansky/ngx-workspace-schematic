import { describe, it, expect, beforeEach } from "vitest";
import {
  SchematicTestRunner,
  UnitTestTree,
} from "@angular-devkit/schematics/testing";

describe("library schematic", () => {
  const schematicRunner = new SchematicTestRunner(
    "@anedomansky/ngx-workspace-schematic",
    require.resolve("../collection.json")
  );

  let workspaceTree: UnitTestTree;

  beforeEach(async () => {
    workspaceTree = await schematicRunner.runSchematic("workspace", {
      name: "test",
    });
  });

  it("should create all files (no scope)", async () => {
    const tree = await schematicRunner.runSchematic(
      "library",
      {
        name: "test",
        libraryName: "test-lib",
      },
      workspaceTree
    );

    expect(tree.files).toContain("/test/jest.test-lib.config.ts");
    expect(tree.files).toContain("/test/projects/test-lib/.eslintrc.js");
    expect(tree.files).toContain("/test/projects/test-lib/ng-package.json");
    expect(tree.files).toContain("/test/projects/test-lib/package.json");
    expect(tree.files).toContain("/test/projects/test-lib/tsconfig.lib.json");
    expect(tree.files).toContain(
      "/test/projects/test-lib/tsconfig.lib.prod.json"
    );
    expect(tree.files).toContain("/test/projects/test-lib/assets/.gitkeep");
    expect(tree.files).toContain("/test/projects/test-lib/src/public-api.ts");
    expect(tree.files).toContain(
      "/test/projects/test-lib/src/lib/test-lib.module.ts"
    );
    expect(tree.files).toContain(
      "/test/projects/test-lib/src/lib/config/test-lib-config.ts"
    );
    expect(tree.files).toContain(
      "/test/projects/test-lib/src/lib/core/services/sample/sample.config.ts"
    );
    expect(tree.files).toContain(
      "/test/projects/test-lib/src/lib/core/services/sample/sample.service.spec.ts"
    );
    expect(tree.files).toContain(
      "/test/projects/test-lib/src/lib/core/services/sample/sample.service.ts"
    );
    expect(tree.files).toContain(
      "/test/projects/test-lib/src/lib/sample/sample.component.html"
    );
    expect(tree.files).toContain(
      "/test/projects/test-lib/src/lib/sample/sample.component.scss"
    );
    expect(tree.files).toContain(
      "/test/projects/test-lib/src/lib/sample/sample.component.spec.ts"
    );
    expect(tree.files).toContain(
      "/test/projects/test-lib/src/lib/sample/sample.component.ts"
    );
    expect(tree.files).toContain(
      "/test/projects/test-lib/src/lib/sample/sample.routes.ts"
    );
    expect(tree.files).toContain("/test/projects/test-lib/styles/index.scss");
  });

  it("should create all files (with scope)", async () => {
    const tree = await schematicRunner.runSchematic(
      "library",
      {
        name: "test",
        libraryName: "@test/test-lib",
      },
      workspaceTree
    );

    expect(tree.files).toContain("/test/jest.test-lib.config.ts");
    expect(tree.files).toContain("/test/projects/test/test-lib/.eslintrc.js");
    expect(tree.files).toContain(
      "/test/projects/test/test-lib/ng-package.json"
    );
    expect(tree.files).toContain("/test/projects/test/test-lib/package.json");
    expect(tree.files).toContain(
      "/test/projects/test/test-lib/tsconfig.lib.json"
    );
    expect(tree.files).toContain(
      "/test/projects/test/test-lib/tsconfig.lib.prod.json"
    );
    expect(tree.files).toContain(
      "/test/projects/test/test-lib/assets/.gitkeep"
    );
    expect(tree.files).toContain(
      "/test/projects/test/test-lib/src/public-api.ts"
    );
    expect(tree.files).toContain(
      "/test/projects/test/test-lib/src/lib/test-lib.module.ts"
    );
    expect(tree.files).toContain(
      "/test/projects/test/test-lib/src/lib/config/test-lib-config.ts"
    );
    expect(tree.files).toContain(
      "/test/projects/test/test-lib/src/lib/core/services/sample/sample.config.ts"
    );
    expect(tree.files).toContain(
      "/test/projects/test/test-lib/src/lib/core/services/sample/sample.service.spec.ts"
    );
    expect(tree.files).toContain(
      "/test/projects/test/test-lib/src/lib/core/services/sample/sample.service.ts"
    );
    expect(tree.files).toContain(
      "/test/projects/test/test-lib/src/lib/sample/sample.component.html"
    );
    expect(tree.files).toContain(
      "/test/projects/test/test-lib/src/lib/sample/sample.component.scss"
    );
    expect(tree.files).toContain(
      "/test/projects/test/test-lib/src/lib/sample/sample.component.spec.ts"
    );
    expect(tree.files).toContain(
      "/test/projects/test/test-lib/src/lib/sample/sample.component.ts"
    );
    expect(tree.files).toContain(
      "/test/projects/test/test-lib/src/lib/sample/sample.routes.ts"
    );
    expect(tree.files).toContain(
      "/test/projects/test/test-lib/styles/index.scss"
    );
  });

  it("should add all scripts to package.json (no scope)", async () => {
    const tree = await schematicRunner.runSchematic(
      "library",
      {
        name: "test",
        libraryName: "test-lib",
      },
      workspaceTree
    );

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
      "build:lib:test-lib": "ng build test-lib --configuration=production",
      "build:lib:test-lib:watch":
        "ng build test-lib --configuration development --watch",
      "test:lib:test-lib":
        "npm run test:esm -- -c=jest.test-lib.config.ts --silent",
      "test:lib:test-lib:local":
        "npm run test:esm -- -c=jest.test-lib.config.ts",
    };

    expect(workspacePackageJson.scripts).toStrictEqual(expectedScripts);
  });

  it("should add all scripts to package.json (with scope)", async () => {
    const tree = await schematicRunner.runSchematic(
      "library",
      {
        name: "test",
        libraryName: "@test/test-lib",
      },
      workspaceTree
    );

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
      "build:lib:test-lib":
        "ng build @test/test-lib --configuration=production",
      "build:lib:test-lib:watch":
        "ng build @test/test-lib --configuration development --watch",
      "test:lib:test-lib":
        "npm run test:esm -- -c=jest.test-lib.config.ts --silent",
      "test:lib:test-lib:local":
        "npm run test:esm -- -c=jest.test-lib.config.ts",
    };

    expect(workspacePackageJson.scripts).toStrictEqual(expectedScripts);
  });

  it("should add folder to .code-workspace (no scope)", async () => {
    const tree = await schematicRunner.runSchematic(
      "library",
      {
        name: "test",
        libraryName: "test-lib",
      },
      workspaceTree
    );

    const workspaceFile = JSON.parse(
      tree.readContent("/test/.vscode/test.code-workspace")
    );

    const expectedFolders = [
      {
        name: "ROOT",
        path: "../",
      },
      {
        name: "test-lib",
        path: "../projects/test-lib",
      },
    ];

    expect(workspaceFile.folders).toStrictEqual(expectedFolders);
  });

  it("should add folder to .code-workspace (with scope)", async () => {
    const tree = await schematicRunner.runSchematic(
      "library",
      {
        name: "test",
        libraryName: "@test/test-lib",
      },
      workspaceTree
    );

    const workspaceFile = JSON.parse(
      tree.readContent("/test/.vscode/test.code-workspace")
    );

    const expectedFolders = [
      {
        name: "ROOT",
        path: "../",
      },
      {
        name: "test-lib",
        path: "../projects/test/test-lib",
      },
    ];

    expect(workspaceFile.folders).toStrictEqual(expectedFolders);
  });

  it("should add project to angular.json (no scope)", async () => {
    const tree = await schematicRunner.runSchematic(
      "library",
      {
        name: "test",
        libraryName: "test-lib",
      },
      workspaceTree
    );

    const workspaceJSON = JSON.parse(tree.readContent("/test/angular.json"));

    const expectedProjects = {
      "test-lib": {
        root: "projects/test-lib",
        sourceRoot: "projects/test-lib/src",
        prefix: "lib",
        projectType: "library",
        schematics: {
          "@schematics/angular:component": {
            style: "scss",
            changeDetection: "OnPush",
            standalone: true,
          },
          "@schematics/angular:directive": {
            standalone: true,
          },
        },
        architect: {
          build: {
            builder: "@angular-devkit/build-angular:ng-packagr",
            options: {
              project: "projects/test-lib/ng-package.json",
            },
            configurations: {
              production: {
                tsConfig: "projects/test-lib/tsconfig.lib.prod.json",
              },
              development: {
                tsConfig: "projects/test-lib/tsconfig.lib.json",
              },
            },
            defaultConfiguration: "production",
          },
        },
      },
    };

    expect(workspaceJSON.projects).toStrictEqual(expectedProjects);
  });

  it("should add project to angular.json (with scope)", async () => {
    const tree = await schematicRunner.runSchematic(
      "library",
      {
        name: "test",
        libraryName: "@test/test-lib",
      },
      workspaceTree
    );

    const workspaceJSON = JSON.parse(tree.readContent("/test/angular.json"));

    const expectedProjects = {
      "@test/test-lib": {
        root: "projects/test/test-lib",
        sourceRoot: "projects/test/test-lib/src",
        prefix: "lib",
        projectType: "library",
        schematics: {
          "@schematics/angular:component": {
            style: "scss",
            changeDetection: "OnPush",
            standalone: true,
          },
          "@schematics/angular:directive": {
            standalone: true,
          },
        },
        architect: {
          build: {
            builder: "@angular-devkit/build-angular:ng-packagr",
            options: {
              project: "projects/test/test-lib/ng-package.json",
            },
            configurations: {
              production: {
                tsConfig: "projects/test/test-lib/tsconfig.lib.prod.json",
              },
              development: {
                tsConfig: "projects/test/test-lib/tsconfig.lib.json",
              },
            },
            defaultConfiguration: "production",
          },
        },
      },
    };

    expect(workspaceJSON.projects).toStrictEqual(expectedProjects);
  });

  it("should add path to tsconfig.json (no scope)", async () => {
    const tree = await schematicRunner.runSchematic(
      "library",
      {
        name: "test",
        libraryName: "test-lib",
      },
      workspaceTree
    );

    const tsconfigJSON = JSON.parse(tree.readContent("/test/tsconfig.json"));

    const expectedPaths = {
      "test-lib": ["dist/test-lib"],
    };

    expect(tsconfigJSON.compilerOptions.paths).toStrictEqual(expectedPaths);
  });

  it("should add path to tsconfig.json (with scope)", async () => {
    const tree = await schematicRunner.runSchematic(
      "library",
      {
        name: "test",
        libraryName: "@test/test-lib",
      },
      workspaceTree
    );

    const tsconfigJSON = JSON.parse(tree.readContent("/test/tsconfig.json"));

    const expectedPaths = {
      "@test/test-lib": ["dist/test/test-lib"],
    };

    expect(tsconfigJSON.compilerOptions.paths).toStrictEqual(expectedPaths);
  });

  it("should add moduleNameMapper to jest.config.ts (no scope)", async () => {
    const tree = await schematicRunner.runSchematic(
      "library",
      {
        name: "test",
        libraryName: "test-lib",
      },
      workspaceTree
    );

    const unitTestConfig = tree.readContent("/test/jest.config.ts");

    expect(unitTestConfig).toContain(
      "'^test-lib': '<rootDir>/dist/test-lib/fesm2022/test-lib.mjs'"
    );
  });

  it("should add moduleNameMapper to jest.config.ts (with scope)", async () => {
    const tree = await schematicRunner.runSchematic(
      "library",
      {
        name: "test",
        libraryName: "@test/test-lib",
      },
      workspaceTree
    );

    const unitTestConfig = tree.readContent("/test/jest.config.ts");

    expect(unitTestConfig).toContain(
      "'^@test/test-lib': '<rootDir>/dist/test/test-lib/fesm2022/test-test-lib.mjs'"
    );
  });
});
