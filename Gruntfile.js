/*
 * grunt-jasmine-webpack
 * https://github.com/ben/grunt-jasmine-webpack
 *
 * Copyright (c) 2015 Ben Parker
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        jshint: {
            all: [
                'Gruntfile.js',
                'tasks/**/*.js'
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        },

        // Before generating any new files, remove any previously-created files.
        clean: {
            tests: ['.grunt']
        },

        jasmine_webpack: {
            options: {
                webpack: {
                    resolve: {
                        root: './'
                    }
                }
            },
            src: 'example/**/*.js'
        }
    });

    // Actually load this plugin's task(s).
    grunt.loadTasks('tasks');

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('example', ['clean', 'jasmine_webpack']);

    // By default, lint and run all tests.
    grunt.registerTask('default', ['jshint']);
};
