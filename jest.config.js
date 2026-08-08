/** @type {import('jest').Config} */
module.exports = {
  collectCoverage: false,
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/__tests__/**",
    "!src/e2e/**",
    "!src/**/index.ts",
  ],
  coverageDirectory: "<rootDir>/coverage",
  coverageReporters: ["text", "lcov", "html"],
  projects: [
    {
      displayName: "unit",
      preset: "jest-expo",
      setupFiles: ["<rootDir>/jest.env.ts"],
      setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
      },
      testMatch: ["<rootDir>/src/**/__tests__/unit/**/*.(test|spec).(ts|tsx)"],
      testPathIgnorePatterns: ["/node_modules/", "/.expo/", "/src/e2e/"],
      transformIgnorePatterns: [
        "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@stomp/stompjs)",
      ],
    },
    {
      displayName: "integration",
      preset: "jest-expo",
      setupFiles: ["<rootDir>/jest.env.ts"],
      setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
      },
      testMatch: [
        "<rootDir>/src/**/__tests__/integration/**/*.(test|spec).(ts|tsx)",
      ],
      testPathIgnorePatterns: ["/node_modules/", "/.expo/", "/src/e2e/"],
      transformIgnorePatterns: [
        "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@stomp/stompjs)",
      ],
    },
  ],
};