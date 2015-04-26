/**
 * Handles console output.
 */
'use strict';

var _ = require('underscore'),
    chalk = require('chalk'),

    indent,

    Reporter;

indent = function indent(level) {
    var tabs = [];
    for (var i = 0; i < level; i++) {
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

    reportSuiteDone: function () {
        this.indentLevel--;
        if (this.indentLevel === 0) {
            this.grunt.log.writeln('');
        }
    },

    reportSpec: function (description, passedExpectations, failedExpectations) {
        this.indentLevel++;

        passedExpectations.forEach(function (expectation) {
            this.grunt.log.writeln(
                indent(this.indentLevel) +
                chalk.green("PASS: ") +
                chalk.gray(description)
            );
        }, this);

        failedExpectations.forEach(function (expectation) {
            this.grunt.log.writeln(
                indent(this.indentLevel) +
                chalk.red("FAIL: ") +
                chalk.gray(description)
            );

            this.grunt.log.writeln(
                indent(this.indentLevel) +
                chalk.red(expectation.message)
            );
        }, this);

        this.indentLevel--;
    },

    reportFinish: function (totalSpecs, failedSpecs) {
        this.grunt.log.writeln(chalk.cyan('Results: ' + (totalSpecs - failedSpecs) + '/' + totalSpecs + ' passed.'));
        if (failedSpecs > 0) {
            this.grunt.log.error(chalk.red(failedSpecs + ' failures'));
        }
    }
});

module.exports = Reporter;
