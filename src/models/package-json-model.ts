/**
 * Utility type for package.json files.
 */
export type PackageJSON = {
  scripts?: {
    [key: string]: string;
  };
  type?: "commonjs" | "module";
  dependencies: {
    [key: string]: string;
  };
  devDependencies: {
    [key: string]: string;
  };
  engines?: {
    [key: string]: string;
  };
};
