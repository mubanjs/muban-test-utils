module.exports = {
  // preset: 'ts-jest',
  preset: 'ts-jest/presets/js-with-babel',
  testEnvironment: 'jsdom',
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!lodash-es|@muban)'],
  // setupFilesAfterEnv: ['<rootDir>/test-utils/setupTests.js'],

  // added "(?<!types.)" as a negative lookbehind to the default pattern
  // to exclude .types.test.ts patterns from being picked up by jest
  testRegex: '(/__tests__/.*|(\\.|/)(?<!types.)(test|spec))\\.[jt]sx?$',
};
