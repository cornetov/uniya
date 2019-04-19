module.exports = {
    preset: "ts-jest/presets/js-with-ts",
    testEnvironment: "node",
    verbose: true,
    moduleFileExtensions: ["ts", "tsx", "js"],
    transform: {
        "^.+\\.(ts|tsx)$": "ts-jest"
    },
    testMatch: ["**/__tests__/*.(ts|tsx)"],
    testPathIgnorePatterns: ["./.next/", "./node_modules/", ".d.ts"],
    globals: {
        "ts-jest": {
            tsConfig: "tsconfig.json"
        }
    }
};