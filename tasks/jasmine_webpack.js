/**
 * grunt-jasmine-webpack
 */

'use strict';

var path = require('path'),
    fs = require('fs'),

    _ = require('underscore'),
    chalk = require('chalk'),
    webpack = require('webpack'),

    jasmine = require('jasmine-core'),

    tempDir = '.grunt/grunt-jasmine-webpack';

module.exports = function(grunt) {

    var getTabs = function getTabs(indentLevel) {
            var ret = [];
            for (var i = 0; i < indentLevel; i++) {
                ret.push('  ');
            }

            return ret.join('');
        },

        fileContainsFilter = function (file, filter) {
            var dirRegex = new RegExp(/^\//);

            if (dirRegex.test(filter)) {
                if (file.indexOf(filter) >= 0) {
                    return true;
                }
            } else {
                if (path.basename(file, '.js').indexOf(filter) >= 0) {
                    return true;
                }
            }

            return false;
        };

    grunt.registerMultiTask('jasmine_webpack', 'A plugin to run webpack tests via jasmine', function() {
        var done = this.async(),
            phantomjs = require('grunt-lib-phantomjs').init(grunt),

            options = this.options({
                specRunnerDest: '_SpecRunner.html',
                keepRunner: false,
                styles: [],
                helpers: [],
                vendor: [],
                polyfills: []
            }),

            testFilter = grunt.option('filter'),

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

            if (!testFilter || fileContainsFilter(f, testFilter)) {
                specFiles.push(
                    path.relative(outdir, path.join(tempDir + '/specs', path.basename(f)))
                );
                entries[filename] = f;
            }
        });

        if (specFiles.length === 0) {
            grunt.log.error('No tests found');
            done(false);
        }

        webpackConfig.entry = entries;

        webpack(webpackConfig, function (err, stats) {
            if (stats.hasErrors()) {
                grunt.log.writeln("Got error when building webpack files: " + stats.toJson().errors);
                done();
                return;
            }

            var indentLevel = 0,
                totalSpecs = 0,
                failedSpecs = 0;

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

            [].concat(
                options.styles,
                options.helpers,
                options.vendor,
                options.polyfills
            ).forEach(function (file) {
                var basename = path.basename(file);
                grunt.file.copy(
                    file,
                    path.join(tempDir, basename)
                );
            });

            grunt.file.copy(
                __dirname + '/reporters/phantom-reporter.js',
                path.join(tempDir, 'reporter.js')
            );

            grunt.file.write(
                options.specRunnerDest,
                _.template(grunt.file.read(__dirname + '/templates/SpecRunner.tmpl'))({
                    css: jasmine.files.cssFiles.map(function (cssFile) {
                        return path.relative(outdir, path.join(tempDir, cssFile));
                    }),
                    scripts: {
                        specs: specFiles,

                        jasmine: jasmine.files.jsFiles.map(function (jsFile) {
                            return path.relative(outdir, path.join(tempDir, jsFile));
                        }),
                        boot: jasmine.files.bootFiles.map(function (bootFile) {
                            return path.relative(outdir, path.join(tempDir, bootFile));
                        }),

                        styles: options.styles.map(function (f) {
                            var basename = path.basename(f);
                            return path.relative(outdir, path.join(tempDir, basename));
                        }),
                        helpers: options.helpers.map(function (f) {
                            var basename = path.basename(f);
                            return path.relative(outdir, path.join(tempDir, basename));
                        }),
                        vendor: options.vendor.map(function (f) {
                            var basename = path.basename(f);
                            return path.relative(outdir, path.join(tempDir, basename));
                        }),
                        polyfills: options.polyfills.map(function (f) {
                            var basename = path.basename(f);
                            return path.relative(outdir, path.join(tempDir, basename));
                        }),

                        reporters: [path.relative(outdir, path.join(tempDir, 'reporter.js'))]
                    }
                })
            );

            // RUN TESTS HERE.
            phantomjs.spawn(options.specRunnerDest, {
                done: function (err) {
                    // Clean up.
                    if (!options.keepRunner) {
                        // Bit of a faff here, but basically I coudn't get rimraf
                        // to work without causing phantom to crash, so here
                        // we find and remove all files and dirs we've created.
                        var subdirs = [];
                        fs.unlinkSync(options.specRunnerDest);
                        grunt.file.recurse(tempDir, function (filepath, rootdir, subdir) {
                            fs.unlinkSync(filepath);
                            if (subdir) {
                                subdirs.push(path.join(rootdir, subdir));
                            }
                        });
                        subdirs.forEach(function (dir) {
                            try {
                                fs.rmdirSync(dir);
                            } catch (e) {}
                        });
                        fs.rmdirSync(tempDir);

                        // Try to remove .grunt as well, but there could be other things in there.
                        try {
                            fs.rmdirSync('.grunt');
                        } catch (e) {}
                    }
                    done(failedSpecs <= 0);
                }
            });

            phantomjs.on('jasmine.done', function () {
                grunt.log.writeln(chalk.cyan('Results: ' + (totalSpecs - failedSpecs) + '/' + totalSpecs + ' passed.'));
                if (failedSpecs > 0) {
                    grunt.log.error(chalk.red(failedSpecs + ' failures'));
                }
                grunt.log.writeln('');
                phantomjs.halt();
            });

            phantomjs.on('jasmine.started', function () {
                grunt.log.ok('Jasmine suite started');
            });

            phantomjs.on('jasmine.suiteStarted', function (suiteMetadata) {
                // Increment indent level.
                indentLevel++;
                grunt.log.writeln(getTabs(indentLevel) + suiteMetadata.description);
            });

            phantomjs.on('jasmine.suiteDone', function (suiteMetadata) {
                indentLevel--;
                if (indentLevel < 2) {
                    grunt.log.writeln('');
                }
            });

            phantomjs.on('jasmine.specStarted', function (specMetadata) {
                indentLevel++;
                totalSpecs++;
            });

            phantomjs.on('jasmine.specDone', function (specMetadata) {
                specMetadata.passedExpectations.forEach(function (expectation) {
                    grunt.log.writeln(
                        getTabs(indentLevel) +
                        chalk.green("PASS: ") +
                        chalk.gray(specMetadata.description)
                    );
                });

                specMetadata.failedExpectations.forEach(function (expectation) {
                    grunt.log.writeln(
                        getTabs(indentLevel) +
                        chalk.red("FAIL: ") +
                        chalk.gray(specMetadata.description)
                    );

                    grunt.log.writeln(
                        getTabs(indentLevel) +
                        chalk.red(expectation.message)
                    );
                });

                if (specMetadata.failedExpectations.length !== 0) {
                    failedSpecs++;
                }

                indentLevel--;
            });
        });
    });
};
