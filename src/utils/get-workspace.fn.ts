import { WorkspaceDefinition } from "@angular-devkit/core/src/workspace";
import { TreeWorkspaceHost } from "./TreeWorkspaceHost";
import { Tree } from "@angular-devkit/schematics";
import { workspaces } from "@angular-devkit/core";

export async function getWorkspace(tree: Tree): Promise<WorkspaceDefinition> {
  const host = new TreeWorkspaceHost(tree);

  const { workspace } = await workspaces.readWorkspace("/angular.json", host);

  return workspace;
}
