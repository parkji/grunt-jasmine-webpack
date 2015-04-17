/**
 * grunt-jasmine-webpack
 */

'use strict';

var _ = require('underscore'),
    jasmine = require('jasmine-core'),
    path = require('path'),

    tempDir = '.grunt/grunt-jasmine-webpack';

module.exports = function(grunt) {

    grunt.registerMultiTask('jasmine_webpack', 'A plugin to run webpack tests via jasmine', function() {
        var options = this.options({
                specRunnerDest: '_SpecRunner.html',
                styles: [],
                specs: [],
                helpers: [],
                vendor: [],
                polyfills: []
            }),

            outdir = path.dirname(options.specRunnerDest);

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

        // Iterate over all specified file groups.
        //this.testFiles.forEach(function(f) {
        //    // Concat specified files.
        //    var src = f.src.filter(function(filepath) {
        //        // Warn on and remove invalid source files (if nonull was set).
        //        if (!grunt.file.exists(filepath)) {
        //            grunt.log.warn('Source file "' + filepath + '" not found.');
        //            return false;
        //        } else {
        //            return true;
        //        }
        //    }).map(function(filepath) {
        //        // Read file source.
        //        return grunt.file.read(filepath);
        //    }).join(grunt.util.normalizelf(options.separator));

        //    // Handle options.
        //    src += options.punctuation;

        //    // Print a success message.
        //    grunt.log.writeln('File "' + f.dest + '" created.');
        //});

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
                    specs: options.spec,
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
        grunt.log.writeln('File "' + options.specRunnerDest + '" created');
    });

};
