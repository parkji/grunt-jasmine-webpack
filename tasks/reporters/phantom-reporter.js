/* globals window,alert,jasmine */
'use strict';

(function () {
    var sendMessage = function sendMessage () {
            var args = [].slice.call(arguments);

            /* eslint-disable */
            if (window._phantom) {
                alert(JSON.stringify(args));
            }
            /* eslint-enable */
        },

        PhantomReporter = function () {
            this.started = false;
            this.finished = false;
            this.suites = [];
            this.results = {};
        };

    PhantomReporter.prototype.jasmineStarted = function () {
        this.started = true;
        sendMessage('jasmine.started');
    };

    PhantomReporter.prototype.jasmineDone = function () {
        this.finished = true;
        sendMessage('jasmine.done');
    };

    PhantomReporter.prototype.suiteStarted = function (suiteMetadata) {
        sendMessage('jasmine.suiteStarted', suiteMetadata);
    };

    PhantomReporter.prototype.suiteDone = function (suiteMetadata) {
        sendMessage('jasmine.suiteDone', suiteMetadata);
    };

    PhantomReporter.prototype.specStarted = function (specMetadata) {
        sendMessage('jasmine.specStarted', specMetadata);
    };

    PhantomReporter.prototype.specDone = function (specMetadata) {
        sendMessage('jasmine.specDone', specMetadata);
    };

    jasmine.getEnv().addReporter(new PhantomReporter());
}());
