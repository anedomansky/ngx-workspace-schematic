import { SchematicTestRunner } from "@angular-devkit/schematics/testing";

describe("ng-new schematic", () => {
  const schematicRunner = new SchematicTestRunner(
    "@anedomansky/ngx-workspace-schematic",
    require.resolve("../collection.json")
  );

  it("should create a new project (complete)", async () => {
    const tree = await schematicRunner.runSchematic("ng-new", {
      name: "test",
      appName: "test-application",
      libraryName: "test-lib",
    });

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
                {
                  glob: "**/*",
                  input: "dist/test-lib/assets",
                  output: "assets",
                },
              ],
              styles: [
                "projects/test-application/src/styles.scss",
                "dist/test-lib/styles/index.scss",
              ],
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

    expect(workspaceJSON.projects["test-application"]).toStrictEqual(
      expectedProjects["test-application"]
    );

    expect(tree.files).toContain("/test/jest.test-application.config.ts");
    expect(tree.files).toContain("/test/jest.config.ts");
    expect(tree.files).toContain("/test/jest.test-lib.config.ts");
    expect(tree.files).toContain("/test/.vscode/test.code-workspace");
    expect(tree.files).toContain("/test/projects/test-lib/assets/.gitkeep");
    expect(tree.files).toContain(
      "/test/projects/test-lib/src/lib/test-lib.module.ts"
    );
    expect(tree.files).toContain(
      "/test/projects/test-application/src/app/app.routes.ts"
    );
  });

  it("should create a new project (complete with scope)", async () => {
    const tree = await schematicRunner.runSchematic("ng-new", {
      name: "test",
      appName: "@test/test-application",
      libraryName: "@test/test-lib",
    });

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
                {
                  glob: "**/*",
                  input: "dist/test/test-lib/assets",
                  output: "assets",
                },
              ],
              styles: [
                "projects/test/test-application/src/styles.scss",
                "dist/test/test-lib/styles/index.scss",
              ],
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

    expect(workspaceJSON.projects["@test/test-application"]).toStrictEqual(
      expectedProjects["@test/test-application"]
    );

    expect(tree.files).toContain("/test/jest.test-application.config.ts");
    expect(tree.files).toContain("/test/jest.config.ts");
    expect(tree.files).toContain("/test/jest.test-lib.config.ts");
    expect(tree.files).toContain("/test/.vscode/test.code-workspace");
    expect(tree.files).toContain(
      "/test/projects/test/test-lib/assets/.gitkeep"
    );
    expect(tree.files).toContain(
      "/test/projects/test/test-lib/src/lib/test-lib.module.ts"
    );
    expect(tree.files).toContain(
      "/test/projects/test/test-application/src/app/app.routes.ts"
    );
  });

  it("should create a new project (library)", async () => {
    const tree = await schematicRunner.runSchematic("ng-new", {
      name: "test",
      libraryName: "test-lib",
    });

    expect(tree.files).not.toContain("/test/jest.test-application.config.ts");
    expect(tree.files).toContain("/test/jest.config.ts");
    expect(tree.files).toContain("/test/jest.test-lib.config.ts");
    expect(tree.files).toContain("/test/.vscode/test.code-workspace");
    expect(tree.files).toContain("/test/projects/test-lib/assets/.gitkeep");
    expect(tree.files).toContain(
      "/test/projects/test-lib/src/lib/test-lib.module.ts"
    );
    expect(tree.files).not.toContain(
      "/test/projects/test-application/src/app/app.routes.ts"
    );
  });

  it("should create a new project (application)", async () => {
    const tree = await schematicRunner.runSchematic("ng-new", {
      name: "test",
      appName: "test-application",
    });

    expect(tree.files).toContain("/test/jest.test-application.config.ts");
    expect(tree.files).toContain("/test/jest.config.ts");
    expect(tree.files).not.toContain("/test/jest.test-lib.config.ts");
    expect(tree.files).toContain("/test/.vscode/test.code-workspace");
    expect(tree.files).not.toContain("/test/projects/test-lib/assets/.gitkeep");
    expect(tree.files).not.toContain(
      "/test/projects/test-lib/src/lib/test-lib.module.ts"
    );
    expect(tree.files).toContain(
      "/test/projects/test-application/src/app/app.routes.ts"
    );
  });

  it("should create a new project (only workspace)", async () => {
    const tree = await schematicRunner.runSchematic("ng-new", {
      name: "test",
    });

    expect(tree.files).not.toContain("/test/jest.test-application.config.ts");
    expect(tree.files).toContain("/test/jest.config.ts");
    expect(tree.files).not.toContain("/test/jest.test-lib.config.ts");
    expect(tree.files).toContain("/test/.vscode/test.code-workspace");
    expect(tree.files).not.toContain("/test/projects/test-lib/assets/.gitkeep");
    expect(tree.files).not.toContain(
      "/test/projects/test-lib/src/lib/test-lib.module.ts"
    );
    expect(tree.files).not.toContain(
      "/test/projects/test-application/src/app/app.routes.ts"
    );
  });
});
