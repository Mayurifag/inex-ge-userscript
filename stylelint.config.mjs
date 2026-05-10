export default {
  extends: ['stylelint-config-standard'],
  rules: {
    'selector-class-pattern': [
      '^[a-z][a-zA-Z0-9]*(?:-[a-zA-Z0-9]+)*$',
      { resolveNestedSelectors: true },
    ],
    'selector-id-pattern': '^[a-z][a-zA-Z0-9]*(?:-[a-zA-Z0-9]+)*$',
    'no-descending-specificity': null,
  },
};
