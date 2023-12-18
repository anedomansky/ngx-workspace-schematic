module.exports = {
  "root": true,
  "ignorePatterns": ["dist/**/*", "coverage/**/*", "src/gen/**/*"],
  "overrides": [
    {
      "files": [
        "*.ts"
      ],
      "parser": "@typescript-eslint/parser",
      "plugins": [
        "@typescript-eslint",
        "simple-import-sort",
        "import",
        "prettier",
        "rxjs",
        "rxjs-angular"
      ],
      "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@angular-eslint/recommended",
        "plugin:@angular-eslint/template/process-inline-templates",
        "plugin:prettier/recommended",
        "plugin:rxjs/recommended"
      ],
      "rules": {
        "lines-between-class-members": ["warn", "always"],
        "rxjs/no-ignored-observable": "error",
        "rxjs/no-sharereplay": "off",
        "rxjs/throw-error": "error",
        "simple-import-sort/imports": "error",
        "simple-import-sort/exports": "error",
        "import/first": "error",
        "import/newline-after-import": "error",
        "import/no-duplicates": "error",
        "@angular-eslint/component-class-suffix": [
          "error",
          {
            "suffixes": [
              "Component"
            ]
          }
        ],
        "@typescript-eslint/await-thenable": "error",
        "@typescript-eslint/explicit-module-boundary-types": "error",
        "prettier/prettier": ["error", {
          "singleQuote": true,
          "useTabs": false,
          "tabWidth": 2,
          "semi": true,
          "bracketSpacing": true,
          "endOfLine": "auto"
        }]
      }
    },
    {
      "files": [
        "*.html"
      ],
      "plugins": [
        "prettier"
      ],
      "extends": [
        "plugin:@angular-eslint/template/recommended",
        "plugin:prettier/recommended"
      ],
      "rules": {
        "prettier/prettier": ["error", {
          "singleQuote": true,
          "useTabs": false,
          "tabWidth": 2,
          "semi": true,
          "bracketSpacing": true,
          "endOfLine": "auto",
          "parser": "angular"
        }]
      }
    }
  ],
  parserOptions: {
    project: "./tsconfig.json",
  },
}
