/**
 * grunt-jasmine-webpack
 */

'use strict';

var path = require('path'),
    fs = require('fs'),

    _ = require('underscore'),
    webpack = require('webpack'),
    minimatch = require('minimatch'),

    Reporter = require('./lib/Reporter'),

    jasmine = require('jasmine-core'),

    tempDir = '.grunt/grunt-jasmine-webpack';

module.exports = function(grunt) {

    var reporter = new Reporter(grunt);

    grunt.registerMultiTask('jasmine_webpack', 'A plugin to run webpack tests via jasmine', function() {
        var done = this.async(),
            phantomjs = require('grunt-lib-phantomjs').init(grunt),

            options = this.options({
                specRunnerDest: '_SpecRunner.html',
                keepRunner: false,
                norun: false,
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

        if (options.norun) {
            options.keepRunner = true;
        }

        // Webpack the test files.
        this.filesSrc.forEach(function(f) {
            var filename = path.basename(f, '.js');

            if (!testFilter || minimatch(f, testFilter, {matchBase: true})) {
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

            var totalSpecs = 0,
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
                // Run tests in phantomjs, if options.norun is false.
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
                    reporter.reportFinish(totalSpecs, failedSpecs);
                    grunt.verbose.writeln('Halting phantomjs');
                    phantomjs.halt();
                });

                phantomjs.on('jasmine.started', function () {
                    grunt.verbose.ok('Jasmine suite started');
                });

                phantomjs.on('jasmine.suiteStarted', function (suiteMetadata) {
                    reporter.reportSuiteStarted(suiteMetadata.description);
                });

                phantomjs.on('jasmine.suiteDone', function (suiteMetadata) {
                    reporter.reportSuiteDone();
                });

                phantomjs.on('jasmine.specStarted', function (specMetadata) {
                    totalSpecs++;
                });

                phantomjs.on('jasmine.specDone', function (specMetadata) {
                    reporter.reportSpec(
                        specMetadata.description,
                        specMetadata.passedExpectations,
                        specMetadata.failedExpectations
                    );

                    if (specMetadata.failedExpectations.length !== 0) {
                        failedSpecs++;
                    }
                });
            } else {
                done();
                return;
            }
        });
    });
};
