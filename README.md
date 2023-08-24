# ngx-workspace-schematic

[![npm version](https://badge.fury.io/js/@anedomansky%2Fngx-workspace-schematic.svg)](https://badge.fury.io/js/@anedomansky%2Fngx-workspace-schematic)

An angular schematic for creating complete workspaces.

## Features

- generate a complete Angular workspace consisting of one library and an accompanying application
- the generated Angular workspace comes with pre-configured code quality tools like [ESLint](https://eslint.org/), [Prettier](https://prettier.io/) and [Stylelint](https://stylelint.io/)
- the standard testing tools are replaced by [Jest](https://jestjs.io/)

## Installation

`npm install -g @anedomansky/ngx-workspace-schematic`

## Usage

You can use the Angular CLI command `ng new` with the following options:

`ng new --collection @anedomansky/ngx-workspace-schematic`

The command will ask you for the name of the workspace, the namespace for your initial library and finally for the name of your initial library.
