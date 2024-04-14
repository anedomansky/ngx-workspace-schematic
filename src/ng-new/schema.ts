export type Schema = {
  name: string;
} & (CompleteWorkspace | ApplicationWorkspace | LibraryWorkspace);

export type CompleteWorkspace = {
  type: "complete";
  appName: string;
  libraryName: string;
  libraryPrefix: string;
  libraryPackageName: string;
};

export type ApplicationWorkspace = {
  type: "application";
  appName: string;
};

export type LibraryWorkspace = {
  type: "library";
  libraryName: string;
  libraryPrefix: string;
  libraryPackageName: string;
};
