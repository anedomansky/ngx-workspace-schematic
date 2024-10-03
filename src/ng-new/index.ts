import {
  chain,
  Rule,
  SchematicContext,
  strings,
  Tree,
} from "@angular-devkit/schematics";
import { NodePackageInstallTask } from "@angular-devkit/schematics/tasks";

import { generateAngularWorkspace } from "./generate-angular-workspace";
import { Schema } from "./schema";

export function ngNew(options: Schema): Rule {
  options.name = strings.dasherize(options.name);

  switch (options.type) {
    case "complete":
      options.appName = options.appName
        ? options.appName
        : `${options.name}-app`;
      options.libraryPackageName = `${
        options.libraryNamespace
      }/${strings.dasherize(options.libraryName)}`;
      break;
    case "application":
      options.appName = options.appName
        ? options.appName
        : `${options.name}-app`;
      break;
    case "library":
      options.libraryPackageName = `${
        options.libraryNamespace
      }/${strings.dasherize(options.libraryName)}`;
      break;
  }

  return (tree: Tree, context: SchematicContext) => {
    const rule = chain([generateAngularWorkspace(options)]);

    context.addTask(
      new NodePackageInstallTask({
        workingDirectory: `/${options.name}`,
        allowScripts: true,
      })
    );

    return rule(tree, context);
  };
}

// TODO: tests
// TODO: update README.md
// TODO: release 2.0.0
