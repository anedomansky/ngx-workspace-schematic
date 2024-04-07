import { Tree } from "@angular-devkit/schematics";
import {
  SchematicTestRunner,
  UnitTestTree,
} from "@angular-devkit/schematics/testing";
import library from "@schematics/angular/library/index";

describe("ng-new schematic", () => {
  const schematicRunner = new SchematicTestRunner(
    "@anedomansky/ngx-workspace-schematic",
    require.resolve("../collection.json")
  );

  let appTree: UnitTestTree;

  beforeEach(() => {
    appTree = new UnitTestTree(Tree.empty());
  });

  it("should create a new project", async () => {
    const tree = await schematicRunner.runSchematic(
      "ng-new",
      {
        libraryName: "test-lib",
        libraryPrefix: "namespace",
        name: "test",
      },
      appTree
    );

    const packageJson = JSON.parse(tree.readContent("/test/package.json"));

    // Check that all files were created
    expect(tree.files).toContain("/test/angular.json");
    expect(tree.files).toContain("/test/package.json");
    expect(tree.files).toContain("/test/README.md");
    expect(tree.files).toContain("/test/tsconfig.json");
    expect(tree.files).toContain("/test/.editorconfig");
    expect(tree.files).toContain("/test/.gitignore");
    expect(tree.files).toContain("/test/.eslintrc.js");
    expect(tree.files).toContain("/test/.stylelintrc.json");
    expect(tree.files).toContain("/test/jest.app.config.ts");
    expect(tree.files).toContain("/test/jest.config.ts");
    expect(tree.files).toContain("/test/jest.lib.config.ts");
    expect(tree.files).toContain("/test/setup-jest.ts");
    expect(tree.files).toContain("/test/tsconfig.spec.json");
    expect(tree.files).toContain("/test/.vscode/extensions.json");
    expect(tree.files).toContain("/test/.vscode/launch.json");
    expect(tree.files).toContain("/test/.vscode/tasks.json");
    expect(tree.files).toContain("/test/.vscode/test.code-workspace");
    expect(tree.files).toContain(
      "/test/projects/namespace/test-lib/.eslintrc.js"
    );
    expect(tree.files).toContain(
      "/test/projects/namespace/test-lib/ng-package.json"
    );
    expect(tree.files).toContain(
      "/test/projects/namespace/test-lib/package.json"
    );
    expect(tree.files).toContain(
      "/test/projects/namespace/test-lib/tsconfig.lib.json"
    );
    expect(tree.files).toContain(
      "/test/projects/namespace/test-lib/tsconfig.lib.prod.json"
    );
    expect(tree.files).toContain(
      "/test/projects/namespace/test-lib/tsconfig.spec.json"
    );
    expect(tree.files).toContain(
      "/test/projects/namespace/test-lib/.vscode/settings.json"
    );
    expect(tree.files).toContain(
      "/test/projects/namespace/test-lib/src/public-api.ts"
    );
    expect(tree.files).toContain(
      "/test/projects/namespace/test-lib/src/lib/test-lib.module.ts"
    );
    expect(tree.files).toContain(
      "/test/projects/namespace/test-lib/src/lib/config/test-lib-config.ts"
    );
    expect(tree.files).toContain(
      "/test/projects/namespace/test-lib/src/lib/core/services/sample/sample.config.ts"
    );
    expect(tree.files).toContain(
      "/test/projects/namespace/test-lib/src/lib/core/services/sample/sample.service.spec.ts"
    );
    expect(tree.files).toContain(
      "/test/projects/namespace/test-lib/src/lib/core/services/sample/sample.service.ts"
    );
    expect(tree.files).toContain(
      "/test/projects/namespace/test-lib/src/lib/sample/sample.component.html"
    );
    expect(tree.files).toContain(
      "/test/projects/namespace/test-lib/src/lib/sample/sample.component.scss"
    );
    expect(tree.files).toContain(
      "/test/projects/namespace/test-lib/src/lib/sample/sample.component.spec.ts"
    );
    expect(tree.files).toContain(
      "/test/projects/namespace/test-lib/src/lib/sample/sample.component.ts"
    );
    expect(tree.files).toContain(
      "/test/projects/namespace/test-lib/src/lib/sample/sample.routes.ts"
    );
    expect(tree.files).toContain(
      "/test/projects/namespace/test-lib/styles/index.scss"
    );
    expect(tree.files).toContain("/test/projects/test-app/.eslintrc.js");
    expect(tree.files).toContain("/test/projects/test-app/tsconfig.app.json");
    expect(tree.files).toContain("/test/projects/test-app/tsconfig.spec.json");
    expect(tree.files).toContain(
      "/test/projects/test-app/.vscode/settings.json"
    );
    expect(tree.files).toContain("/test/projects/test-app/src/favicon.ico");
    expect(tree.files).toContain("/test/projects/test-app/src/index.html");
    expect(tree.files).toContain("/test/projects/test-app/src/main.ts");
    expect(tree.files).toContain("/test/projects/test-app/src/styles.scss");
    expect(tree.files).toContain(
      "/test/projects/test-app/src/app/test-app.component.html"
    );
    expect(tree.files).toContain(
      "/test/projects/test-app/src/app/test-app.component.scss"
    );
    expect(tree.files).toContain(
      "/test/projects/test-app/src/app/test-app.component.spec.ts"
    );
    expect(tree.files).toContain(
      "/test/projects/test-app/src/app/test-app.component.ts"
    );
    expect(tree.files).toContain(
      "/test/projects/test-app/src/app/test-app.routes.ts"
    );
    expect(tree.files).toContain(
      "/test/projects/test-app/src/app/sample/sample.service.spec.ts"
    );
    expect(tree.files).toContain(
      "/test/projects/test-app/src/app/sample/sample.service.ts"
    );

    // Check that all depencencies were added
    expect(packageJson.dependencies["@angular/animations"]).toBeDefined();
    expect(packageJson.dependencies["@angular/common"]).toBeDefined();
    expect(packageJson.dependencies["@angular/compiler"]).toBeDefined();
    expect(packageJson.dependencies["@angular/core"]).toBeDefined();
    expect(packageJson.dependencies["@angular/forms"]).toBeDefined();
    expect(packageJson.dependencies["@angular/platform-browser"]).toBeDefined();
    expect(
      packageJson.dependencies["@angular/platform-browser-dynamic"]
    ).toBeDefined();
    expect(packageJson.dependencies["@angular/router"]).toBeDefined();
    expect(packageJson.dependencies["rxjs"]).toBeDefined();
    expect(packageJson.dependencies["tslib"]).toBeDefined();
    expect(packageJson.dependencies["zone.js"]).toBeDefined();

    expect(packageJson.devDependencies["@angular/cli"]).toBeDefined();
    expect(packageJson.devDependencies["@angular/compiler-cli"]).toBeDefined();
    expect(packageJson.devDependencies["ng-packagr"]).toBeDefined();
    expect(packageJson.devDependencies["typescript"]).toBeDefined();
    expect(packageJson.devDependencies["jest"]).toBeDefined();
    expect(packageJson.devDependencies["jest-preset-angular"]).toBeDefined();
    expect(
      packageJson.devDependencies["@testing-library/angular"]
    ).toBeDefined();
    expect(
      packageJson.devDependencies["@testing-library/jest-dom"]
    ).toBeDefined();
    expect(
      packageJson.devDependencies["@testing-library/user-event"]
    ).toBeDefined();
    expect(packageJson.devDependencies["@types/jest"]).toBeDefined();
    expect(packageJson.devDependencies["ts-node"]).toBeDefined();

    // Check that all scripts were added
    expect(packageJson.scripts["start"]).toBe("ng serve");
    expect(packageJson.scripts["build"]).toBe("ng build test-app");
    expect(packageJson.scripts["build:library"]).toBe(
      "ng build @namespace/test-lib --configuration=production"
    );
    expect(packageJson.scripts["build:library:watch"]).toBe(
      "ng build @namespace/test-lib --configuration development --watch"
    );
    expect(packageJson.scripts["test"]).toBe(
      "npm run test:lib && npm run test:app"
    );
    expect(packageJson.scripts["test:lib"]).toBe(
      "jest --silent --config ./jest.lib.config.ts"
    );
    expect(packageJson.scripts["test:lib:local"]).toBe(
      "jest --config ./jest.lib.config.ts"
    );
    expect(packageJson.scripts["test:app"]).toBe(
      "jest --silent --config ./jest.app.config.ts"
    );
    expect(packageJson.scripts["test:app:local"]).toBe(
      "jest --config ./jest.app.config.ts"
    );
    expect(packageJson.scripts["test:coverage"]).toBe(
      "jest --silent --collectCoverage --config ./jest.lib.config.ts"
    );
    expect(packageJson.scripts["lint"]).toBe("eslint . --ext .ts --ext .html");
    expect(packageJson.scripts["lint:fix"]).toBe(
      "eslint . --ext .ts --ext .html --fix"
    );
    expect(packageJson.scripts["build:complete"]).toBe(
      "npm run lint:fix && npm run test:lib && npm run build:library && npm run test:app && npm run build"
    );
  });
});
