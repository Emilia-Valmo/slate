const { jest: lernaAliases } = require('lerna-alias')

module.exports = {
    transform: {
        "^.+\\.tsx?$": "ts-jest"
    },
    testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
    globals: {
        "ts-jest": {
            "diagnostics": false
        }
    },
    moduleNameMapper: lernaAliases({ mainFields: ['source', 'module', 'main'] }),
    moduleFileExtensions: [
        "ts",
        "tsx",
        "js",
        "jsx",
        "json",
        "node"
    ]
};
