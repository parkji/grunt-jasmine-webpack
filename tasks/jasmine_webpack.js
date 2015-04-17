/**
 * grunt-jasmine-webpack
 */

'use strict';

var path = require('path'),
    fs = require('fs'),

    _ = require('underscore'),
    rimraf = require('rimraf'),
    webpack = require('webpack'),

    jasmine = require('jasmine-core'),

    tempDir = '.grunt/grunt-jasmine-webpack';

module.exports = function(grunt) {

    grunt.registerMultiTask('jasmine_webpack', 'A plugin to run webpack tests via jasmine', function() {
        var done = this.async(),

            options = this.options({
                specRunnerDest: '_SpecRunner.html',
                keepRunner: false,
                styles: [],
                specs: [],
                helpers: [],
                vendor: [],
                polyfills: []
            }),

            outdir = path.dirname(options.specRunnerDest),

            webpackConfig = _.defaults(options.webpack || {}, {
                devtool: 'eval',
                output: {
                    path: tempDir + '/specs',
                    filename: '[name].js',
                    libraryTarget: 'var'
                }
            }),

            entries = {},
            specFiles = [];

        // Webpack the test files.
        this.filesSrc.forEach(function(f) {
            var filename = path.basename(f, '.js');
            specFiles.push(
                path.relative(outdir, path.join(tempDir + '/specs', path.basename(f)))
            );
            entries[filename] = f;
        });

        webpackConfig.entry = entries;

        webpack(webpackConfig, function (err, stats) {
            if (stats.hasErrors()) {
                grunt.log.writeln("Got error when building webpack files: " + stats.toJson().errors);
                done();
                return;
            }

            // Copy Jasmine files into temp dir.
            [].concat(
                jasmine.files.cssFiles,
                jasmine.files.jsFiles,
                jasmine.files.bootFiles
            ).forEach(function (file) {
                grunt.file.copy(
                    path.join(jasmine.files.path, file),
                    path.join(tempDir, file)
                );
            });

            grunt.file.write(
                options.specRunnerDest,
                _.template(grunt.file.read(__dirname + '/templates/SpecRunner.tmpl'))({
                    css: jasmine.files.cssFiles.map(function (cssFile) {
                        return path.relative(outdir, path.join(tempDir, cssFile));
                    }),
                    scripts: {
                        polyfills: options.polyfills,
                        jasmine: jasmine.files.jsFiles.map(function (jsFile) {
                            return path.relative(outdir, path.join(tempDir, jsFile));
                        }),
                        specs: specFiles,
                        helpers: options.helpers,
                        vendor: options.vendor,
                        src: options.src,
                        boot: jasmine.files.bootFiles.map(function (bootFile) {
                            return path.relative(outdir, path.join(tempDir, bootFile));
                        }),
                        reporters: []
                    }
                })
            );

            // RUN TESTS HERE.

            // Clean up.
            if (!options.keepRunner) {
                fs.unlink(options.specRunnerDest);
                rimraf.sync(tempDir);
            }

            done();
        });
    });

};
