import { Config } from "jest";

const config: Config = {
  preset: "jest-preset-angular",
  setupFilesAfterEnv: ["<rootDir>/setup-jest.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/src/.*/files/"],
  testEnvironment: "jest-environment-jsdom",
  reporters: ["default"],
  roots: ["<rootDir>/src"],
};

export default config;
