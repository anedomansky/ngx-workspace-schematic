import { describe, it, expect, beforeEach } from "vitest";
import {
  SchematicTestRunner,
  UnitTestTree,
} from "@angular-devkit/schematics/testing";

describe("application schematic", () => {
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
      "application",
      {
        name: "test",
        appName: "test-application",
      },
      workspaceTree
    );

    expect(tree.files).toContain("/test/jest.test-application.config.ts");
    expect(tree.files).toContain(
      "/test/projects/test-application/tsconfig.app.json"
    );
    expect(tree.files).toContain(
      "/test/projects/test-application/src/favicon.ico"
    );
    expect(tree.files).toContain(
      "/test/projects/test-application/src/index.html"
    );
    expect(tree.files).toContain("/test/projects/test-application/src/main.ts");
    expect(tree.files).toContain(
      "/test/projects/test-application/src/styles.scss"
    );
    expect(tree.files).toContain(
      "/test/projects/test-application/src/app/app.component.html"
    );
    expect(tree.files).toContain(
      "/test/projects/test-application/src/app/app.component.scss"
    );
    expect(tree.files).toContain(
      "/test/projects/test-application/src/app/app.component.spec.ts"
    );
    expect(tree.files).toContain(
      "/test/projects/test-application/src/app/app.component.ts"
    );
    expect(tree.files).toContain(
      "/test/projects/test-application/src/app/app.routes.ts"
    );
    expect(tree.files).toContain(
      "/test/projects/test-application/src/app/sample/sample.service.spec.ts"
    );
    expect(tree.files).toContain(
      "/test/projects/test-application/src/app/sample/sample.service.ts"
    );
    expect(tree.files).toContain(
      "/test/projects/test-application/src/assets/.gitkeep"
    );
  });

  it("should create all files (with scope)", async () => {
    const tree = await schematicRunner.runSchematic(
      "application",
      {
        name: "test",
        appName: "@test/test-application",
      },
      workspaceTree
    );

    expect(tree.files).toContain("/test/jest.test-application.config.ts");
    expect(tree.files).toContain(
      "/test/projects/test/test-application/tsconfig.app.json"
    );
    expect(tree.files).toContain(
      "/test/projects/test/test-application/src/favicon.ico"
    );
    expect(tree.files).toContain(
      "/test/projects/test/test-application/src/index.html"
    );
    expect(tree.files).toContain(
      "/test/projects/test/test-application/src/main.ts"
    );
    expect(tree.files).toContain(
      "/test/projects/test/test-application/src/styles.scss"
    );
    expect(tree.files).toContain(
      "/test/projects/test/test-application/src/app/app.component.html"
    );
    expect(tree.files).toContain(
      "/test/projects/test/test-application/src/app/app.component.scss"
    );
    expect(tree.files).toContain(
      "/test/projects/test/test-application/src/app/app.component.spec.ts"
    );
    expect(tree.files).toContain(
      "/test/projects/test/test-application/src/app/app.component.ts"
    );
    expect(tree.files).toContain(
      "/test/projects/test/test-application/src/app/app.routes.ts"
    );
    expect(tree.files).toContain(
      "/test/projects/test/test-application/src/app/sample/sample.service.spec.ts"
    );
    expect(tree.files).toContain(
      "/test/projects/test/test-application/src/app/sample/sample.service.ts"
    );
    expect(tree.files).toContain(
      "/test/projects/test/test-application/src/assets/.gitkeep"
    );
  });

  it("should add all scripts to package.json (no scope)", async () => {
    const tree = await schematicRunner.runSchematic(
      "application",
      {
        name: "test",
        appName: "test-application",
      },
      workspaceTree
    );

    const workspacePackageJson = JSON.parse(
      tree.readContent("/test/package.json")
    );

    const expectedScripts = {
      lint: "eslint ./projects",
      "lint:fix": "eslint ./projects --fix",
      test: "npm run test:esm -- --silent",
      "test:coverage": "npm run test:esm -- --silent --collectCoverage",
      "test:esm":
        "node --experimental-vm-modules --no-warnings ./node_modules/jest/bin/jest.js",
      "test:local": "npm run test:esm",
      "start:app:test-application": "ng serve test-application",
      "build:app:test-application": "ng build test-application",
      "test:app:test-application":
        "npm run test:esm -- -c=jest.test-application.config.ts --silent",
      "test:app:test-application:local":
        "npm run test:esm -- -c=jest.test-application.config.ts",
    };

    expect(workspacePackageJson.scripts).toStrictEqual(expectedScripts);
  });

  it("should add all scripts to package.json (with scope)", async () => {
    const tree = await schematicRunner.runSchematic(
      "application",
      {
        name: "test",
        appName: "@test/test-application",
      },
      workspaceTree
    );

    const workspacePackageJson = JSON.parse(
      tree.readContent("/test/package.json")
    );

    const expectedScripts = {
      lint: "eslint ./projects",
      "lint:fix": "eslint ./projects --fix",
      test: "npm run test:esm -- --silent",
      "test:coverage": "npm run test:esm -- --silent --collectCoverage",
      "test:esm":
        "node --experimental-vm-modules --no-warnings ./node_modules/jest/bin/jest.js",
      "test:local": "npm run test:esm",
      "start:app:test-application": "ng serve @test/test-application",
      "build:app:test-application": "ng build @test/test-application",
      "test:app:test-application":
        "npm run test:esm -- -c=jest.test-application.config.ts --silent",
      "test:app:test-application:local":
        "npm run test:esm -- -c=jest.test-application.config.ts",
    };

    expect(workspacePackageJson.scripts).toStrictEqual(expectedScripts);
  });

  it("should add folder to .code-workspace (no scope)", async () => {
    const tree = await schematicRunner.runSchematic(
      "application",
      {
        name: "test",
        appName: "test-application",
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
        name: "test-application",
        path: "../projects/test-application",
      },
    ];

    expect(workspaceFile.folders).toStrictEqual(expectedFolders);
  });

  it("should add folder to .code-workspace (with scope)", async () => {
    const tree = await schematicRunner.runSchematic(
      "application",
      {
        name: "test",
        appName: "@test/test-application",
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
        name: "test-application",
        path: "../projects/test/test-application",
      },
    ];

    expect(workspaceFile.folders).toStrictEqual(expectedFolders);
  });

  it("should add project to angular.json (no scope)", async () => {
    const tree = await schematicRunner.runSchematic(
      "application",
      {
        name: "test",
        appName: "test-application",
      },
      workspaceTree
    );

    const workspaceJSON = JSON.parse(tree.readContent("/test/angular.json"));

    const expectedProjects = {
      "test-application": {
        root: "projects/test-application",
        sourceRoot: "projects/test-application/src",
        prefix: "app",
        projectType: "application",
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
            builder: "@angular-devkit/build-angular:browser-esbuild",
            options: {
              outputPath: "dist/test-application",
              index: "projects/test-application/src/index.html",
              main: "projects/test-application/src/main.ts",
              polyfills: ["zone.js"],
              tsConfig: "projects/test-application/tsconfig.app.json",
              inlineStyleLanguage: "scss",
              assets: [
                "projects/test-application/src/favicon.ico",
                "projects/test-application/src/assets",
              ],
              styles: ["projects/test-application/src/styles.scss"],
              scripts: [],
            },
            configurations: {
              production: {
                budgets: [
                  {
                    type: "initial",
                    maximumWarning: "500kb",
                    maximumError: "1500kb",
                  },
                  {
                    type: "anyComponentStyle",
                    maximumWarning: "2kb",
                    maximumError: "4kb",
                  },
                ],
                outputHashing: "all",
                aot: true,
                buildOptimizer: true,
                sourceMap: false,
                namedChunks: false,
                optimization: true,
              },
              development: {
                buildOptimizer: false,
                optimization: false,
                extractLicenses: false,
                sourceMap: true,
                namedChunks: true,
              },
            },
            defaultConfiguration: "production",
          },
          serve: {
            builder: "@angular-devkit/build-angular:dev-server",
            configurations: {
              production: {
                buildTarget: "test-application:build:production",
              },
              development: {
                buildTarget: "test-application:build:development",
              },
            },
            defaultConfiguration: "development",
          },
        },
      },
    };

    expect(workspaceJSON.projects).toStrictEqual(expectedProjects);
  });

  it("should add project to angular.json (with scope)", async () => {
    const tree = await schematicRunner.runSchematic(
      "application",
      {
        name: "test",
        appName: "@test/test-application",
      },
      workspaceTree
    );

    const workspaceJSON = JSON.parse(tree.readContent("/test/angular.json"));

    const expectedProjects = {
      "@test/test-application": {
        root: "projects/test/test-application",
        sourceRoot: "projects/test/test-application/src",
        prefix: "app",
        projectType: "application",
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
            builder: "@angular-devkit/build-angular:browser-esbuild",
            options: {
              outputPath: "dist/test/test-application",
              index: "projects/test/test-application/src/index.html",
              main: "projects/test/test-application/src/main.ts",
              polyfills: ["zone.js"],
              tsConfig: "projects/test/test-application/tsconfig.app.json",
              inlineStyleLanguage: "scss",
              assets: [
                "projects/test/test-application/src/favicon.ico",
                "projects/test/test-application/src/assets",
              ],
              styles: ["projects/test/test-application/src/styles.scss"],
              scripts: [],
            },
            configurations: {
              production: {
                budgets: [
                  {
                    type: "initial",
                    maximumWarning: "500kb",
                    maximumError: "1500kb",
                  },
                  {
                    type: "anyComponentStyle",
                    maximumWarning: "2kb",
                    maximumError: "4kb",
                  },
                ],
                outputHashing: "all",
                aot: true,
                buildOptimizer: true,
                sourceMap: false,
                namedChunks: false,
                optimization: true,
              },
              development: {
                buildOptimizer: false,
                optimization: false,
                extractLicenses: false,
                sourceMap: true,
                namedChunks: true,
              },
            },
            defaultConfiguration: "production",
          },
          serve: {
            builder: "@angular-devkit/build-angular:dev-server",
            configurations: {
              production: {
                buildTarget: "@test/test-application:build:production",
              },
              development: {
                buildTarget: "@test/test-application:build:development",
              },
            },
            defaultConfiguration: "development",
          },
        },
      },
    };

    expect(workspaceJSON.projects).toStrictEqual(expectedProjects);
  });
});
