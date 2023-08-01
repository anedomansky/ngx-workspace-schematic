import { normalize } from '@angular-devkit/core';
import {
  apply,
  chain,
  externalSchematic,
  MergeStrategy,
  mergeWith,
  move,
  Rule,
  SchematicContext,
  strings,
  template,
  Tree,
  url,
  applyTemplates,
} from '@angular-devkit/schematics';
import { Source } from '@angular-devkit/schematics/src/engine/interface';

import { Schema } from './schema';

function executeSchematic(options: Schema): Rule {
  return externalSchematic('@schematics/angular', 'ng-new', {
    name: options.name,
    version: '16.1.6',
    directory: options.name,
    routing: true,
    style: 'scss',
    createApplication: false,
    inlineStyle: false,
    inlineTemplate: false,
    skipInstall: true,
    skipGit: false,
  });
}

export function copyPath(
  options: Schema,
  path: string,
  pathToCopyTo: string
): Source {
  return apply(url(`./files/${path}`), [
    applyTemplates({
      ...options,
      ...strings,
    }),
    move(normalize(pathToCopyTo)),
  ]);
}

function copyBaseFiles(options: Schema): Rule {
  return mergeWith(
    copyPath(options, 'base-setup', options.name),
    MergeStrategy.Overwrite
  );
}

// function updatePackageJson(options: Schema): Rule {
//   return (tree: Tree): Tree => {
//     const path = `/${options.name}/package.json`;
//     const file = tree.read(path);
//     if (!file) {
//       return tree;
//     }

//     const json = JSON.parse(file.toString());

//     json.scripts = {
//       start: 'ng serve',
//       build: `ng build insuria-${options.name}`,
//       'build:library': `ng build @${options.libraryPackageName} --configuration=production`,
//       'build:library:watch': `ng build @${options.libraryPackageName} --configuration development --watch`,
//       test: 'npm run test:lib && npm run test:app',
//       'test:lib': 'jest --silent --config ./jest.lib.config.js',
//       'test:lib:local': 'jest --config ./jest.lib.config.js',
//       'test:app': 'jest --silent --config ./jest.app.config.js',
//       'test:app:local': 'jest --config ./jest.app.config.js',
//       'test:coverage':
//         'jest --silent --collectCoverage --config ./jest.lib.config.js',
//       lint: 'eslint . --ext .ts --ext .html',
//       'lint:fix': 'eslint . --ext .ts --ext .html --fix',
//       'build:complete':
//         'npm run lint:fix && npm run test:lib && npm run build:library && npm run test:app && npm run build',
//     };

//     json.dependencies['@angular/animations'] =
//       packageJson.dependencies['@angular/animations'];
//     json.dependencies['@angular/common'] =
//       packageJson.dependencies['@angular/common'];
//     json.dependencies['@angular/compiler'] =
//       packageJson.dependencies['@angular/compiler'];
//     json.dependencies['@angular/core'] =
//       packageJson.dependencies['@angular/core'];
//     json.dependencies['@angular/elements'] =
//       packageJson.dependencies['@angular/elements'];
//     json.dependencies['@angular/forms'] =
//       packageJson.dependencies['@angular/forms'];
//     json.dependencies['@angular/platform-browser'] =
//       packageJson.dependencies['@angular/platform-browser'];
//     json.dependencies['@angular/platform-browser-dynamic'] =
//       packageJson.dependencies['@angular/platform-browser-dynamic'];
//     json.dependencies['@angular/router'] =
//       packageJson.dependencies['@angular/router'];
//     json.dependencies['rxjs'] = packageJson.dependencies['rxjs'];
//     json.dependencies['tslib'] = packageJson.dependencies['tslib'];
//     json.dependencies['zone.js'] = packageJson.dependencies['zone.js'];

//     json.devDependencies['@angular/cli'] =
//       packageJson.devDependencies['@angular/cli'];
//     json.devDependencies['@angular/compiler-cli'] =
//       packageJson.devDependencies['@angular/compiler-cli'];
//     json.devDependencies['@openapitools/openapi-generator-cli'] =
//       packageJson.devDependencies['@openapitools/openapi-generator-cli'];
//     json.devDependencies['ng-packagr'] =
//       packageJson.devDependencies['ng-packagr'];
//     json.devDependencies['typescript'] =
//       packageJson.devDependencies['typescript'];

//     // Delete Jasmin / Karma Tests
//     delete json.devDependencies['@types/jasmine'];
//     delete json.devDependencies['jasmine-core'];
//     delete json.devDependencies['karma'];
//     delete json.devDependencies['karma-chrome-launcher'];
//     delete json.devDependencies['karma-coverage'];
//     delete json.devDependencies['karma-jasmine'];
//     delete json.devDependencies['karma-jasmine-html-reporter'];

//     // Adds jest
//     json.devDependencies['@types/jest'] =
//       packageJson.devDependencies['@types/jest'];
//     json.devDependencies['jest'] = packageJson.devDependencies['jest'];
//     json.devDependencies['jest-preset-angular'] =
//       packageJson.devDependencies['jest-preset-angular'];

//     json.devDependencies['stylelint'] =
//       packageJson.devDependencies['stylelint'];
//     json.devDependencies['stylelint-config-prettier'] =
//       packageJson.devDependencies['stylelint-config-prettier'];
//     json.devDependencies['stylelint-config-sass-guidelines'] =
//       packageJson.devDependencies['stylelint-config-sass-guidelines'];
//     json.devDependencies['stylelint-config-standard'] =
//       packageJson.devDependencies['stylelint-config-standard'];
//     json.devDependencies['stylelint-order'] =
//       packageJson.devDependencies['stylelint-order'];
//     json.devDependencies['stylelint-scss'] =
//       packageJson.devDependencies['stylelint-scss'];

//     tree.overwrite(path, JSON.stringify(json, null, 2));
//     return tree;
//   };
// }

export function generateAngularWorkspace(options: Schema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const rule = chain([
      executeSchematic(options),
      // updatePackageJson(options),
      copyBaseFiles(options),
      mergeWith(
        copyPath(
          options,
          'library',
          `${options.name}/projects/${strings.dasherize(
            options.libraryPackageName
          )}`
        ),
        MergeStrategy.Overwrite
      ),
      mergeWith(
        copyPath(
          options,
          'app',
          `${options.name}/projects/${strings.dasherize(options.name)}-app`
        ),
        MergeStrategy.Overwrite
      ),
    ]);
    return rule(tree, context);
  };
}
