/**
 * Handles console output.
 */
'use strict';

var _ = require('underscore'),
    chalk = require('chalk'),

    indent,

    Reporter;

indent = function (level) {
    var tabs = [],
        i;
    for (i = 0; i < level; i++) {
        tabs.push('  ');
    }
    return tabs.join('');
};

Reporter = function (grunt) {
    this.grunt = grunt;
    this.indentLevel = 0;
};

_.extend(Reporter.prototype, {
    reportSuiteStarted: function (description) {
        this.indentLevel++;
        this.grunt.log.writeln(indent(this.indentLevel) + description);
    },

    reportSuiteDone: function (disabled) {
        if (disabled) {
            this.grunt.log.writeln(indent(++this.indentLevel) + chalk.yellow('Suite skipped'));
            this.indentLevel--;
        }
        this.indentLevel--;
        if (this.indentLevel === 0) {
            this.grunt.log.writeln('');
        }
    },

    reportSpec: function (description, skipped, passedExpectations, failedExpectations, display) {
        this.indentLevel++;

        if (skipped) {
            if (display === 'full') {
                this.grunt.log.writeln(
                    indent(this.indentLevel) +
                    chalk.yellow("SKIPPED: ") +
                    chalk.grey(description)
                );
            } else if (display === 'short') {
                this.grunt.log.write(chalk.yellow("*"));
            }
        }

        passedExpectations.forEach(function () {
            if (display === 'full') {
                this.grunt.log.writeln(
                    indent(this.indentLevel) +
                    chalk.green("PASS: ") +
                    chalk.gray(description)
                );
            } else if (display === 'short') {
                this.grunt.log.write(chalk.green("."));
            }
        }, this);

        failedExpectations.forEach(function (expectation) {
            if (display === 'full') {
                this.grunt.log.writeln(
                    indent(this.indentLevel) +
                    chalk.red("FAIL: ") +
                    chalk.gray(description)
                );

                this.grunt.log.writeln(
                    indent(this.indentLevel) +
                    chalk.red(expectation.message)
                );
            } else if (display === 'short') {
                this.grunt.log.write(chalk.red("X"));
            }
        }, this);

        this.indentLevel--;
    },

    reportFinish: function (stats) {
        var totalSpecsRan = stats.passedSpecs + stats.failedSpecs;
        this.grunt.log.writeln(chalk.cyan('Results: ' + stats.passedSpecs + '/' + totalSpecsRan + ' passed.'));
        if (stats.skippedSpecs > 0) {
            this.grunt.log.writeln(chalk.yellow(stats.skippedSpecs + ' spec(s) skipped.'));
        }
        if (stats.skippedSuites > 0) {
            this.grunt.log.writeln(chalk.yellow(stats.skippedSuites + ' suite(s) skipped.'));
        }
        if (stats.failedSpecs > 0) {
            this.grunt.log.error(chalk.red(stats.failedSpecs + ' failures'));
        }
    }
});

module.exports = Reporter;
