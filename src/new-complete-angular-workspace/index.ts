import {
  chain,
  Rule,
  SchematicContext,
  strings,
  Tree,
} from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

import { generateAngularWorkspace } from './generate-angular-workspace';
import { Schema } from './schema';

export function newCompleteWorkspace(options: Schema): Rule {
  const name = strings.dasherize(options.name);

  if (!options.libraryPrefix) {
    options.libraryPackageName = strings.dasherize(options.libraryName);
  } else {
    options.libraryPackageName = `${options.libraryPrefix}/${strings.dasherize(
      options.libraryName
    )}`;
  }

  return (tree: Tree, context: SchematicContext) => {
    const rule = chain([generateAngularWorkspace(options)]);

    context.addTask(
      new NodePackageInstallTask({
        workingDirectory: `/${name}`,
        allowScripts: true,
      })
    );

    return rule(tree, context) as Rule;
  };
}
