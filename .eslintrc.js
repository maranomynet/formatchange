module.exports = require('@hugsmidjan/hxmstyle')({
  // Place your project-specific additions or overrides here
  // using standard ESLint config syntax...

  // extendsFirst: [], // extended BEFORE the hxmstyle rules
  // extends: [], // added after the hxmstyle rules
  env: {
    node: true,
    browser: true,
    es2020: true,
  },
});
