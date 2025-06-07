# ngx-workspace-schematic

[![npm version](https://badge.fury.io/js/@anedomansky%2Fngx-workspace-schematic.svg)](https://badge.fury.io/js/@anedomansky%2Fngx-workspace-schematic)

An angular schematic for creating complete workspaces.

## Requirements

You'll need the current [NodeJS](https://nodejs.org/en) installed.
In addition to that, you'll need the correct `@angular/cli` version installed:

`npm install -g @angular/cli@X`

| ngx-workspace-schematic | @angular/cli |
| ----------------------- | ------- |
| 1.X.X                   | 16.X      |
| 2.X.X                   | 17.X      |
| 3.X.X                   | 18.X      |
| 4.X.X                   | 19.X      |

## Features

- generate a complete Angular workspace consisting of one library and an accompanying application
- the generated Angular workspace comes with pre-configured code quality tools like [ESLint](https://eslint.org/), [Prettier](https://prettier.io/) and [Stylelint](https://stylelint.io/)
- the standard testing tools are replaced by [Jest](https://jestjs.io/)

## Installation

`npm install -g @anedomansky/ngx-workspace-schematic`

## Usage

You can use the Angular CLI command `ng new` with the following options:

`ng new --collection @anedomansky/ngx-workspace-schematic`

The command will ask you for the name of the workspace, the name for your app and finally for the name of your library.

## Version compatibility

| ngx-workspace-schematic | Angular |
| ----------------------- | ------- |
| 1.X.X                   | 16      |
| 2.X.X                   | 17      |
| 3.X.X                   | 18      |
| 4.X.X                   | 19      |
