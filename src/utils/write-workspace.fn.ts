import { Tree } from "@angular-devkit/schematics";
import { TreeWorkspaceHost } from "./TreeWorkspaceHost";
import { WorkspaceDefinition } from "@angular-devkit/core/src/workspace";
import { workspaces } from "@angular-devkit/core";

export async function writeWorkspace(
  tree: Tree,
  workspace: WorkspaceDefinition,
  path?: string
): Promise<void> {
  const host = new TreeWorkspaceHost(tree);

  return workspaces.writeWorkspace(workspace, host, path);
}
