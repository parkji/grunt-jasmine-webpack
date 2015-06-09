# grunt-jasmine-webpack

> Build and run jasmine specs using webpack

## Getting started

This plugin requires Grunt `>=0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

## Jasmine Webpack task

Task targets, files and options may be specified according to the grunt [Configuring tasks](http://gruntjs.com/configuring-tasks) guide.

### Options

#### specRunnerDest

Type: `String`

The location and file name of the spec runner generated. Defaults to `./_SpecRunner.html`.

#### keepRunner

Type: `Boolean`

Whether or not to keep the spec runner file once the process has finished. Defaults to `false`.

#### vendor

Type: `Array<String>`

Vendor files to include in the spec runner.

#### polyfills

Type: `Array<String>`

Polyfill files to include in the spec runner.

#### webpack

Type: `Object`

Config for webpack, defaults:

```javascript
{
    devtool: 'eval',
    output: {
        path: '.grunt/grunt-jasmine-webpack/specs',
        filename: '[name].js',
        libraryTarget: 'var'
    }
}
```

### Usage examples

```javascript
jasmine_webpack: {
    main: {
        options: {
            specRunnerDest: '_test/SpecRunner.html',
            webpack: {
                module: {
                    loaders: [{ test: /\.jsx$/, 'jsx' }]
                },
                resolve: {
                    modulesDirectories: ['_test/js']
                }
            },
            keepRunner: true,
            vendor: ['path/top/vendor/file.js']
        },
        src: './src/js/test/**/*.test.js'
    }
}
```
    
