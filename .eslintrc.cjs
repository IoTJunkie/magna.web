const rulesDirPlugin = require('eslint-plugin-rulesdir');
rulesDirPlugin.RULES_DIR = 'eslint-rules';

const config = {
  // Parser setup for TypeScript
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    sourceType: 'module',
    ecmaVersion: 2020, // 📅 Targeting ECMAScript 2020
  },

  // 🔌 Adding plugins for TypeScript, custom rules, import handling, and React
  plugins: [
    '@typescript-eslint', // TypeScript-specific rules 🧩
    'rulesdir', // Custom rules for specific project needs 🤖
    'import', // Rules for managing import statements 📤
    'react', // React-specific linting rules 🌟
    'tailwindcss', // Tailwind-specific linting rules 🎨
  ],

  extends: ['next/core-web-vitals', 'prettier', 'plugin:tailwindcss/recommended'],
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }, // 🚫 Ignore vars/args starting with _
    ],

    'rulesdir/tailwind-convert-px-to-rem': 'warn',
    'rulesdir/string-px-to-rem-converter': 'warn',
    'rulesdir/jsx-style-rem-units': 'warn',
    'rulesdir/no-conditional-classnames': 'warn',
    'react/display-name': ['error', { ignoreTranspilerName: false, checkContextObjects: true }], // 🔍 Enforce display name in React components

    // 📜 Enforcing single quotes in JSX
    'jsx-quotes': ['error', 'prefer-single'], // 🏹 Enforce single quotes in JSX
    // 📌 Enforce single quotes for consistency
    quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: false }], // 🏷️ Single quotes for consistency

    'import/first': 'error', // 🥇 Import statements should be at the top
    'import/newline-after-import': 'error', // 📄 Newline after import section for readability
    'import/no-duplicates': 'error', // 🚫 Prevent duplicate imports

    // 🔄 Sorting named imports alphabetically
    'sort-imports': [
      'error',
      {
        ignoreCase: true,
        ignoreDeclarationSort: true, // 🤝 To avoid conflicts with `import/order`
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
        allowSeparatedGroups: false, // 🛑 Disallow separate groups
      },
    ],

    // 🎈 Disabled rules that are no longer needed in Next.js...

    'react/react-in-jsx-scope': 'off', // React is globally available in Next.js
    'react/prop-types': 'off', // TypeScript interfaces cover prop types
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'no-console': 'off', // 📣 Allow console statements - at least for now.
    eqeqeq: ['error', 'always'],
    curly: 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react/no-array-index-key': 'warn',
    'jsx-a11y/accessible-emoji': 'warn',
    'jsx-a11y/anchor-is-valid': 'error',
    'jsx-a11y/no-static-element-interactions': 'off',
    'react/jsx-no-bind': 'off', // 🚫 No binding in JSX 👁️👁️👉 TODO: Enable this later
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    'space-infix-ops': 'error',
    'no-duplicate-imports': 'error',
    'no-use-before-define': ['error', { functions: false, classes: true }],

    'tailwindcss/no-custom-classname': 'off',
    'tailwindcss/classnames-order': 'warn',
    'tailwindcss/no-contradicting-classname': 'warn',
  },
};

module.exports = config;
