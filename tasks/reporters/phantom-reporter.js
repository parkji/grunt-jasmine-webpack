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

        PhantomReporter = {
            jasmineStarted: function () {
                sendMessage('jasmine.started');
            },

            jasmineDone: function () {
                sendMessage('jasmine.done');
            },

            suiteStarted: function (suiteMetadata) {
                sendMessage('jasmine.suiteStarted', suiteMetadata);
            },

            suiteDone: function (suiteMetadata) {
                sendMessage('jasmine.suiteDone', suiteMetadata);
            },

            specStarted: function (specMetadata) {
                sendMessage('jasmine.specStarted', specMetadata);
            },

            specDone: function (specMetadata) {
                sendMessage('jasmine.specDone', specMetadata);
            }
        };

    jasmine.getEnv().addReporter(PhantomReporter);
}());
