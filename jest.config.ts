module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom', // CRITICAL: This mocks a browser for React
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1', // Adjust if your code is inside a /src folder
    },
    transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
            tsconfig: 'tsconfig.json',
        }],
        '^.+\\.(js|jsx)$': ['babel-jest', {
            presets: ['next/babel']
        }],
    },
    transformIgnorePatterns: [
        '/node_modules/(?!lucide-react)',
    ],
};