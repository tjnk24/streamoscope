import typescriptEslint from '@typescript-eslint/eslint-plugin';
import _import from 'eslint-plugin-import';
import eslintComments from 'eslint-plugin-eslint-comments';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import {fixupPluginRules} from '@eslint/compat';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import js from '@eslint/js';
import {FlatCompat} from '@eslint/eslintrc';
import stylistic from '@stylistic/eslint-plugin'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

const importColumnRule = {
    meta: {type: 'layout', fixable: 'whitespace', schema: []},
    create: context => ({
        ImportDeclaration: node => {
            const specifiers = node.specifiers.filter(specifier => specifier.type === 'ImportSpecifier');

            if (specifiers.length < 3) {
                return;
            }

            specifiers.slice(1).forEach((specifier, index) => {
                const previous = specifiers[index];

                if (previous.loc.end.line === specifier.loc.start.line) {
                    context.report({
                        node: specifier,
                        message: 'Put each of 3 or more imported names on its own line',
                        fix: fixer => fixer.replaceTextRange([previous.range[1] + 1, specifier.range[0]], '\n    '),
                    });
                }
            });
        },
    }),
};

export default [
    ...compat.extends(
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "plugin:jsx-a11y/recommended",
    ),
    {
        ignores: [
            'build',
            'release',
            '.test-stand',
            'config',
            'eslint.config.mjs',
        ],
    },
    {
        plugins: {
            "@typescript-eslint": typescriptEslint,
            import: fixupPluginRules(_import),
            "eslint-comments": eslintComments,
            react,
            "react-hooks": fixupPluginRules(reactHooks),
            '@stylistic': stylistic,
            streamoscope: {
                rules: {'import-column': importColumnRule},
            },
        },

        languageOptions: {
            globals: {
                ...globals.node,
            },

            parser: tsParser,
            ecmaVersion: 2018,
            sourceType: "module",

            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },

                warnOnUnsupportedTypeScriptVersion: false,
                project: ["./tsconfig.json", "./tsconfig.node.json"],
            },
        },

        settings: {
            "import/parsers": {
                "@typescript-eslint/parser": [".ts", ".tsx"],
            },

            react: {
                version: "detect",
            },
        },

        rules: {
            "arrow-parens": ["error", "as-needed"],
            camelcase: 0,
            "class-methods-use-this": 0,
            "consistent-return": 0,

            "comma-dangle": ["warn", {
                arrays: "always-multiline",
                objects: "always-multiline",
                imports: "always-multiline",
                exports: "always-multiline",
                functions: "always-multiline",
            }],

            quotes: ["error", "single"],
            "jsx-quotes": ["error", "prefer-double"],
            "import/no-extraneous-dependencies": 0,

            "import/newline-after-import": ["error", {
                count: 1,
            }],

            "max-len": ["error", {
                code: 150,
                tabWidth: 4,
                ignoreComments: true,
                ignoreTrailingComments: true,
                ignoreUrls: true,
                ignoreStrings: true,
                ignoreTemplateLiterals: true,
            }],

            "max-params": 0,
            "space-in-parens": ["error", "never"],
            "array-bracket-spacing": ["error", "never"],
            "space-before-blocks": ["error", "always"],

            "keyword-spacing": ["error", {
                before: true,
                after: true,
            }],

            semi: ["error", "always"],
            "eol-last": ["error", "always"],
            "no-cond-assign": ["error", "except-parens"],
            "no-implicit-coercion": 0,
            "no-else-return": 0,
            "no-extra-boolean-cast": 0,
            "no-nested-ternary": 0,
            "no-plusplus": 0,
            "no-prototype-builtins": 0,
            "no-return-await": 0,
            "no-underscore-dangle": 0,
            "no-unused-vars": 0,
            'no-unused-expressions': 0,
            "no-use-before-define": 0,
            "no-useless-escape": 0,
            "no-mixed-operators": "error",
            "prefer-rest-params": 0,
            "object-curly-spacing": ["error", "never"],
            "operator-linebreak": 0,

            "space-before-function-paren": ["error", {
                anonymous: "always",
                named: "never",
                asyncArrow: "always",
            }],

            "no-console": "error",
            "no-process-exit": "error",

            "no-multiple-empty-lines": ["error", {
                max: 1,
            }],

            "no-multi-spaces": "error",

            "no-restricted-imports": ["error", {
                patterns: [{
                    group: ["__pages/*"],
                    message: "Usage of import from __pages directory allowed only for appRoutes.tsx and index.tsx.",
                }],

                paths: [
                    {
                        name: "lodash",
                        message: "Use \"import utilName from 'lodash/utilName'\" instead.",
                    },
                    {
                        name: "react",
                        importNames: ["default"],
                        message: "Don't import global React to \"tsx\" files."
                    },
                    {
                        name: "antd/lib",
                        message: "Please use import from 'antd'",
                    },
                    {
                        name: "@ant-design/icons/lib",
                        message: "Please use import from '@ant-design/icons'",
                    },
                ],
            }],

            "object-curly-newline": ["error", {
                ImportDeclaration: {
                    multiline: true,
                    minProperties: 3,
                },
                ObjectPattern: {
                    minProperties: 5,
                    consistent: false,
                },
            }],

            "streamoscope/import-column": "error",
            eqeqeq: "error",
            "@typescript-eslint/no-angle-bracket-type-assertion": 0,
            "@typescript-eslint/camelcase": 0,
            "@typescript-eslint/no-unnecessary-type-assertion": 0,
            "@typescript-eslint/no-explicit-any": 0,
            "@typescript-eslint/explicit-function-return-type": 0,
            "@typescript-eslint/no-unsafe-argument": 0,
            "@typescript-eslint/no-var-requires": 0,
            "@typescript-eslint/no-misused-promises": 0,
            "@typescript-eslint/no-this-alias": 0,
            "@typescript-eslint/unbound-method": 0,
            "@typescript-eslint/await-thenable": 0,
            "@typescript-eslint/prefer-regexp-exec": 0,
            "@typescript-eslint/no-non-null-assertion": 0,
            "@typescript-eslint/ban-ts-ignore": 0,
            "@typescript-eslint/prefer-promise-reject-errors": 0,
            "@typescript-eslint/no-unused-expressions": ['error', {
                allowTernary: true,
                allowShortCircuit: true,

            }],
            "@typescript-eslint/no-unused-vars": ['error', {
                vars: 'all',
                args: 'all',
                varsIgnorePattern: '^_',
                argsIgnorePattern: '^_',
                ignoreRestSiblings: true,
                caughtErrors: 'none',
            }],

            "@stylistic/member-delimiter-style": ["error", {
                multiline: {
                    delimiter: "semi",
                    requireLast: true,
                },

                singleline: {
                    delimiter: "semi",
                    requireLast: false,
                },
            }],

            "@stylistic/indent": ["error", 4, {
                ignoredNodes: ["TSTypeParameterInstantiation"],
                SwitchCase: 1,
            }],

            "@typescript-eslint/no-unsafe-assignment": 0,
            "@typescript-eslint/no-unsafe-call": 0,
            "@typescript-eslint/no-unsafe-return": 0,
            "@typescript-eslint/no-unsafe-member-access": 0,
            "ascii/valid-name": 0,
            "react/jsx-boolean-value": 2,
            "react/jsx-no-useless-fragment": 2,
            "react/jsx-wrap-multilines": "error",
            "react/jsx-no-bind": 0,
            "react/jsx-uses-react": 0,
            "react/jsx-uses-vars": "error",
            "react/display-name": 0,
            "react/react-in-jsx-scope": 0,
            "react/prop-types": 0,
            "react/no-children-prop": 0,

            "react/jsx-curly-spacing": ["error", {
                when: "never",
            }],

            "react/jsx-tag-spacing": ["warn", {
                closingSlash: "never",
                beforeSelfClosing: "never",
                afterOpening: "never",
                beforeClosing: "never",
            }],

            "react/jsx-newline": ["error", {
                prevent: false,
            }],

            "react/jsx-max-props-per-line": ["error", {
                maximum: 2,
            }],

            "react/jsx-curly-brace-presence": "error",
            "import/no-anonymous-default-export": 0,
            "react-hooks/rules-of-hooks": 2,
            "react-hooks/exhaustive-deps": 2,

            "import/order": ["warn", {
                groups: [["builtin", "external"], "internal", "parent", "sibling", "index"],

                pathGroups: [{
                    pattern: "*__*",
                    group: "internal",
                }, {
                    pattern: "*__*/**",
                    group: "internal",
                }, {
                    pattern: "*__components/**",
                    group: "internal",
                    position: "before",
                }, {
                    pattern: "*__pages/**",
                    group: "internal",
                    position: "before",
                }, {
                    pattern: "./*.{scss,css}",
                    group: "index",
                }, {
                    pattern: "*assets/**",
                    group: "index",
                }, {
                    pattern: "www/**",
                    group: "index",
                }],

                pathGroupsExcludedImportTypes: ["internal"],

                alphabetize: {
                    order: "asc",
                    caseInsensitive: true,
                },

                "newlines-between": "always",
            }],
        },
},
    {
        files: ["**/*.ts", "**/*.tsx", "**/*.js"],

        rules: {
            "@typescript-eslint/explicit-module-boundary-types": ["off"],
            "@typescript-eslint/restrict-template-expressions": 0,
            "@typescript-eslint/no-base-to-string": "off",
            "@typescript-eslint/no-unsafe-enum-comparison": 0,
        },
    },
    {
        files: ["scripts/**/*.ts"],

        rules: {
            "no-console": 0,
        },
    },
];
