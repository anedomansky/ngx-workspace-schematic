export type Schema = {
  name: string;
  appName: string;
  appNameWithoutScope?: string;
  appNameWithoutPrefix?: string;
  appNameHasScope?: boolean;
  libraryName?: string;
  libraryNameWithoutScope?: string;
  libraryNameWithoutPrefix?: string;
  libraryNameHasScope?: boolean;
};
