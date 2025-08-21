import { describe, it, expect } from 'vitest';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';

describe('ng-new schematic', () => {
  const schematicRunner = new SchematicTestRunner(
    '@anedomansky/ngx-workspace-schematic',
    require.resolve('../collection.json'),
  );

  it('should create a new project (complete)', async () => {
    const tree = await schematicRunner.runSchematic('ng-new', {
      name: 'test',
      appName: 'test-application',
      libraryName: 'test-lib',
    });

    const workspaceJSON = JSON.parse(tree.readContent('/test/angular.json'));

    const expectedProjects = {
      'test-application': {
        root: 'projects/test-application',
        sourceRoot: 'projects/test-application/src',
        prefix: 'app',
        projectType: 'application',
        schematics: {
          '@schematics/angular:component': {
            style: 'scss',
            changeDetection: 'OnPush',
          },
        },
        architect: {
          build: {
            builder: '@angular/build:application',
            options: {
              outputPath: 'dist/test-application',
              browser: 'projects/test-application/src/main.ts',
              tsConfig: 'projects/test-application/tsconfig.app.prod.json',
              inlineStyleLanguage: 'scss',
              assets: [
                {
                  glob: '**/*',
                  input: 'projects/test-application/public',
                },
                {
                  glob: '**/*',
                  input: 'dist/test-lib/assets',
                  output: 'assets',
                },
              ],
              styles: [
                'projects/test-application/src/styles.scss',
                'dist/test-lib/styles/index.scss',
              ],
            },
            configurations: {
              production: {
                budgets: [
                  {
                    type: 'initial',
                    maximumWarning: '500kb',
                    maximumError: '1MB',
                  },
                  {
                    type: 'anyComponentStyle',
                    maximumWarning: '4kb',
                    maximumError: '8kb',
                  },
                ],
                outputHashing: 'all',
              },
              development: {
                optimization: false,
                extractLicenses: false,
                sourceMap: true,
              },
            },
            defaultConfiguration: 'production',
          },
          serve: {
            builder: '@angular/build:dev-server',
            configurations: {
              production: {
                buildTarget: 'test-application:build:production',
              },
              development: {
                buildTarget: 'test-application:build:development',
              },
            },
            defaultConfiguration: 'development',
          },
        },
      },
    };

    expect(workspaceJSON.projects['test-application']).toStrictEqual(
      expectedProjects['test-application'],
    );

    expect(tree.files).toContain('/test/jest.test-application.config.ts');
    expect(tree.files).toContain('/test/jest.config.ts');
    expect(tree.files).toContain('/test/jest.test-lib.config.ts');
    expect(tree.files).toContain('/test/.vscode/test.code-workspace');
    expect(tree.files).toContain('/test/.npmrc');
    expect(tree.files).toContain('/test/projects/test-lib/assets/.gitkeep');
    expect(tree.files).toContain(
      '/test/projects/test-application/src/app/app.routes.ts',
    );
  });

  it('should create a new project (complete with scope)', async () => {
    const tree = await schematicRunner.runSchematic('ng-new', {
      name: 'test',
      appName: '@test/test-application',
      libraryName: '@test/test-lib',
    });

    const workspaceJSON = JSON.parse(tree.readContent('/test/angular.json'));

    const expectedProjects = {
      '@test/test-application': {
        root: 'projects/test/test-application',
        sourceRoot: 'projects/test/test-application/src',
        prefix: 'app',
        projectType: 'application',
        schematics: {
          '@schematics/angular:component': {
            style: 'scss',
            changeDetection: 'OnPush',
          },
        },
        architect: {
          build: {
            builder: '@angular/build:application',
            options: {
              outputPath: 'dist/test/test-application',
              browser: 'projects/test/test-application/src/main.ts',
              tsConfig: 'projects/test/test-application/tsconfig.app.prod.json',
              inlineStyleLanguage: 'scss',
              assets: [
                {
                  glob: '**/*',
                  input: 'projects/test/test-application/public',
                },
                {
                  glob: '**/*',
                  input: 'dist/test/test-lib/assets',
                  output: 'assets',
                },
              ],
              styles: [
                'projects/test/test-application/src/styles.scss',
                'dist/test/test-lib/styles/index.scss',
              ],
            },
            configurations: {
              production: {
                budgets: [
                  {
                    type: 'initial',
                    maximumWarning: '500kb',
                    maximumError: '1MB',
                  },
                  {
                    type: 'anyComponentStyle',
                    maximumWarning: '4kb',
                    maximumError: '8kb',
                  },
                ],
                outputHashing: 'all',
              },
              development: {
                optimization: false,
                extractLicenses: false,
                sourceMap: true,
              },
            },
            defaultConfiguration: 'production',
          },
          serve: {
            builder: '@angular/build:dev-server',
            configurations: {
              production: {
                buildTarget: '@test/test-application:build:production',
              },
              development: {
                buildTarget: '@test/test-application:build:development',
              },
            },
            defaultConfiguration: 'development',
          },
        },
      },
    };

    expect(workspaceJSON.projects['@test/test-application']).toStrictEqual(
      expectedProjects['@test/test-application'],
    );

    expect(tree.files).toContain('/test/jest.test-application.config.ts');
    expect(tree.files).toContain('/test/jest.config.ts');
    expect(tree.files).toContain('/test/jest.test-lib.config.ts');
    expect(tree.files).toContain('/test/.vscode/test.code-workspace');
    expect(tree.files).toContain('/test/.npmrc');
    expect(tree.files).toContain(
      '/test/projects/test/test-lib/assets/.gitkeep',
    );
    expect(tree.files).toContain(
      '/test/projects/test/test-application/src/app/app.routes.ts',
    );
  });

  it('should create a new project (library)', async () => {
    const tree = await schematicRunner.runSchematic('ng-new', {
      name: 'test',
      libraryName: 'test-lib',
    });

    expect(tree.files).not.toContain('/test/jest.test-application.config.ts');
    expect(tree.files).toContain('/test/jest.config.ts');
    expect(tree.files).toContain('/test/jest.test-lib.config.ts');
    expect(tree.files).toContain('/test/.vscode/test.code-workspace');
    expect(tree.files).toContain('/test/projects/test-lib/assets/.gitkeep');
    expect(tree.files).not.toContain(
      '/test/projects/test-application/src/app/app.routes.ts',
    );
  });

  it('should create a new project (application)', async () => {
    const tree = await schematicRunner.runSchematic('ng-new', {
      name: 'test',
      appName: 'test-application',
    });

    expect(tree.files).toContain('/test/jest.test-application.config.ts');
    expect(tree.files).toContain('/test/jest.config.ts');
    expect(tree.files).not.toContain('/test/jest.test-lib.config.ts');
    expect(tree.files).toContain('/test/.vscode/test.code-workspace');
    expect(tree.files).not.toContain('/test/projects/test-lib/assets/.gitkeep');
    expect(tree.files).not.toContain(
      '/test/projects/test-lib/src/lib/test-lib.module.ts',
    );
    expect(tree.files).toContain(
      '/test/projects/test-application/src/app/app.routes.ts',
    );
  });

  it('should create a new project (only workspace)', async () => {
    const tree = await schematicRunner.runSchematic('ng-new', {
      name: 'test',
    });

    expect(tree.files).not.toContain('/test/jest.test-application.config.ts');
    expect(tree.files).toContain('/test/jest.config.ts');
    expect(tree.files).not.toContain('/test/jest.test-lib.config.ts');
    expect(tree.files).toContain('/test/.vscode/test.code-workspace');
    expect(tree.files).not.toContain('/test/projects/test-lib/assets/.gitkeep');
    expect(tree.files).not.toContain(
      '/test/projects/test-lib/src/lib/test-lib.module.ts',
    );
    expect(tree.files).not.toContain(
      '/test/projects/test-application/src/app/app.routes.ts',
    );
  });
});
