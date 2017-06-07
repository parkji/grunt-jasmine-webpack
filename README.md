# grunt-jasmine-webpack

> Build and run jasmine specs using webpack

Heavily inspired by the excellent [grunt-contrib-jasmine](https://github.com/gruntjs/grunt-contrib-jasmine).

## Getting started

This plugin requires Grunt `>=0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-jasmine-webpack --save-dev
```
Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```shell
grunt.loadNpmTasks('grunt-jasmine-webpack');
```

## Jasmine Webpack task

Task targets, files and options may be specified according to the grunt [Configuring tasks](http://gruntjs.com/configuring-tasks) guide.

### Options

#### specRunnerDest

Type: `String`

The location and file name of the spec runner generated. Defaults to `./_SpecRunner.html`.

#### keepRunner

Type: `Boolean`

Whether or not to keep the spec runner file once the process has finished. Defaults to `false`.

This is useful if you need to see any output from the console. You can open the spec runner file in a browser.

#### norun

Type: `Boolean`

Whether or not to run the tests in phantomjs after the webpack build. If this is `true`, `options.keepRunner` will be set to `true` as well. This is useful for combining with (grunt-contrib-connect)[https://github.com/gruntjs/grunt-contrib-connect] to run the tests in a browser.

Defaults to `false`.

#### helpers

Type: `Array<String>`

Helper files to include in the spec runner.

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

#### styles

Type: `Array<String>`

CSS stylesheets to include in the spec runner.

#### template

Type: `String`

Template file to use to run the tests. This will be compiled using `_.template()`. Defaults to `grunt-jasmine-webpack/tasks/templates/SpecRunner.tmpl`.

#### templateOptions

Type: `Object`

Any extra options that should be passed to the template file. Note that if no template file is given these will be ignored.

#### display

Type: `String`

    * `full` Displays full test description and results
    * `short` Displays short characters to represent test results
    * `none` Does not display any test results

Defaults to `'full'`

#### summary

Type: `Boolean`

Will display a count of all passed, failed, and skipped tests

Defaults to `true`

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
            vendor: ['path/to/vendor/file.js'],
            styles: ['path/to/css/styles.css']
        },
        src: './src/js/test/**/*.test.js'
    }
}
```

### Filtering

It's possible to filter by test files & within that suites & specs. To do that use the `--filter` option when running the task. E.g.

```shell
> # Filter by test file(s)
> grunt jasmine_webpack --filter="MyTestFile*"
> # Filter by suite
> grunt jasmine_webpack --filter="MyTestFile*:my suite"
> # Filter by spec
> grunt jasmine_webpack --filter="MyTestFile*:my suite:my spec"
```

## Development

`npm run lint` will run `ESLint` and should be run before submitting a pull request.

## TODO

* Unit tests
* ~~Figure out why phantomjs doesn't exit cleanly all the time~~ - Fixed in v0.2.1.

## Release History

* 2017-06-07    v1.0.0    Merged #21 - enables support for webpack 2. **This is a breaking change and therefore a major version bump**.
* 2017-04-14    v0.10.0   Merged #20 - support for console output from tests
* 2017-02-03    v0.9.0    Merges #19 & fixes #18
* 2016-08-04    v0.8.0    Merges #17 & adds example for short display.
* 2016-05-24    v0.7.0    Merges #13 & adds coffee script examples.
* 2016-02-19    v0.6.0    Bump grunt-lib-phantomjs version
* 2016-01-29    v0.5.0    Allows custom templates to be used
* 2016-01-27    v0.4.0    Adds support for filtering suites & specs. Increments jasmine and webpack versions.
* 2015-11-22    v0.3.0    Adds logging for skipped specs & suites. Use eslint instead of jshint. Upgrade dependencies.
* 2015-11-02    v0.2.2    Fixes bug where task fails if webpack build fails.
* 2015-10-19    v0.2.1    Fixes bug with phantomjs not exiting cleanly.
* 2015-06-24    v0.2.0    Adds norun option and npm installation instructions to README.
* 2015-06-20    v0.1.0    Initial release.
