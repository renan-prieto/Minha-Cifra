/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/test/setup.ts"],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/api-node/",
    "/dist/",
    "/.expo/",
  ],
  collectCoverageFrom: [
    "src/contexts/**/*.{ts,tsx}",
    "src/models/**/*.{ts,tsx}",
    "src/repositories/**/*.{ts,tsx}",
    "src/utils/**/*.{ts,tsx}",
    "src/viewmodels/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
  ],
  coverageReporters: ["text", "lcov"],
};
