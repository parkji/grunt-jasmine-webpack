/**
 * grunt-jasmine-webpack
 */
 /* globals __dirname*/

'use strict';

var path = require('path'),
    fs = require('fs'),

    _ = require('underscore'),
    webpack = require('webpack'),
    minimatch = require('minimatch'),
    chalk = require('chalk'),

    Reporter = require('./lib/Reporter'),

    jasmine = require('jasmine-core'),

    tempDir = '.grunt/grunt-jasmine-webpack';

module.exports = function (grunt) {

    var reporter = new Reporter(grunt);

    grunt.registerMultiTask('jasmine_webpack', 'A plugin to run webpack tests via jasmine', function () {
        var done = this.async(),
            phantomjs = require('grunt-lib-phantomjs').init(grunt),

            options = this.options({
                specRunnerDest: '_SpecRunner.html',
                template: path.join(__dirname, '/templates/SpecRunner.tmpl'),
                templateOptions: {},
                keepRunner: false,
                norun: false,
                styles: [],
                helpers: [],
                vendor: [],
                polyfills: [],
                display: 'full',
                summary: true
            }),

            filter = grunt.option('filter'),
            fileFilter,
            suiteFilter,
            specFilter,

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

        if (filter) {
            filter = filter.split(':');
            fileFilter = filter[0];
            suiteFilter = filter[1];
            specFilter = filter[2];
        }

        if (options.norun) {
            options.keepRunner = true;
        }

        // Webpack the test files.
        this.filesSrc.forEach(function (f) {
            var filename = path.basename(f, '.js');

            // Filter out any spec files that don't match the filter.
            if (!fileFilter || minimatch(f, fileFilter, {matchBase: true})) {
                specFiles.push(
                    path.relative(outdir, path.join(tempDir + '/specs', filename + ".js"))
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
                done(false);
                return;
            }

            var totalSpecs = 0,
                passedSpecs = 0,
                failedSpecs = 0,
                skippedSpecs = 0,

                skippedSuites = 0,

                ignoreSuite = false,
                ignoreSpec = false;

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
                path.join(__dirname, '/reporters/phantom-reporter.js'),
                path.join(tempDir, 'reporter.js')
            );

            grunt.file.write(
                options.specRunnerDest,
                _.template(grunt.file.read(options.template))({
                    options: options.templateOptions,
                    css: jasmine.files.cssFiles.map(function (cssFile) {
                        return path.relative(outdir, path.join(tempDir, cssFile));
                    }).concat(options.styles.map(function (f) {
                        var basename = path.basename(f);
                        return path.relative(outdir, path.join(tempDir, basename));
                    })),
                    scripts: {
                        specs: specFiles,

                        jasmine: jasmine.files.jsFiles.map(function (jsFile) {
                            return path.relative(outdir, path.join(tempDir, jsFile));
                        }),
                        boot: jasmine.files.bootFiles.map(function (bootFile) {
                            return path.relative(outdir, path.join(tempDir, bootFile));
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

            if (!options.norun) {

                phantomjs.on('fail.load', function (url) {
                    phantomjs.halt();
                    grunt.log.error('PhantomJS unable to load URL ' + url);
                    done(false);
                });

                phantomjs.on('fail.timeout', function () {
                    phantomjs.halt();
                    grunt.log.error('PhantomJS timed out.');
                    done(false);
                });

                // Run tests in phantomjs, if options.norun is false.
                phantomjs.spawn(options.specRunnerDest, {
                    done: function () {
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
                    if (totalSpecs === 0) {
                        grunt.log.error('No tests found for filter "' + filter.join(':') + '"');
                        done(false);
                    }

                    if (options.display === 'short') {
                        grunt.log.writeln();
                    }

                    if (options.summary) {
                        reporter.reportFinish({
                            totalSpecs: totalSpecs,
                            passedSpecs: passedSpecs,
                            failedSpecs: failedSpecs,
                            skippedSpecs: skippedSpecs,
                            skippedSuites: skippedSuites
                        });
                    }
                    grunt.verbose.writeln('Halting phantomjs');
                    phantomjs.halt();
                });

                phantomjs.on('jasmine.started', function () {
                    grunt.verbose.ok('Jasmine suite started');
                });

                phantomjs.on('jasmine.suiteStarted', function (suiteMetadata) {
                    if (!suiteFilter || suiteMetadata.description === suiteFilter) {
                        if (options.display === 'full') {
                            reporter.reportSuiteStarted(suiteMetadata.description);
                        }
                    } else {
                        ignoreSuite = true;
                    }
                });

                phantomjs.on('jasmine.suiteDone', function (suiteMetadata) {
                    if (!ignoreSuite) {
                        var disabled = suiteMetadata.status === 'disabled';

                        if (options.display === 'full') {
                            reporter.reportSuiteDone(disabled);
                        }

                        if (disabled) {
                            skippedSuites++;
                        }
                    } else {
                        ignoreSuite = false;
                    }
                });

                phantomjs.on('jasmine.specStarted', function (specMetadata) {
                    if (!ignoreSuite && (!specFilter || specFilter === specMetadata.description)) {
                        totalSpecs++;
                    } else {
                        ignoreSpec = true;
                    }
                });

                phantomjs.on('jasmine.specDone', function (specMetadata) {
                    if (!ignoreSuite && !ignoreSpec) {
                        var skipped = specMetadata.status === 'pending';

                        if (options.display !== 'none') {
                            reporter.reportSpec(
                                specMetadata.description,
                                skipped,
                                specMetadata.passedExpectations,
                                specMetadata.failedExpectations,
                                options.display
                            );
                        }

                        if (specMetadata.failedExpectations.length !== 0) {
                            failedSpecs++;
                        } else if (skipped) {
                            skippedSpecs++;
                        } else {
                            passedSpecs++;
                        }
                    } else {
                        ignoreSpec = false;
                    }
                });

                phantomjs.on('console', function (msg) {
                    if (options.display === 'full') {
                        grunt.log.writeln('\n' + chalk.yellow('log: ') + msg);
                    }
                });
            } else {
                done();
                return;
            }
        });
    });
};
