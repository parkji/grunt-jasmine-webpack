/* eslint-env jasmine */
describe('First example', function () {
    xdescribe('skipped suite', function () {});

    describe('filter me', function () {
        it('should filter', function () {
            expect(true).toBe(true);
        });
        it('should fail', function () {
            expect(true).toBe(false);
        });
    });

    describe('truthyness', function () {
        it('should be true for true (deliberately failing)', function () {
            // Deliberately failing.
            expect(true).toBe(false);
        });
        it('should be true for string', function () {
            expect('this is true').toBeTruthy();
        });

        it('should be true for string', function () {
            expect('this is true').toBeTruthy();
        });

        xit('skipped spec', function () {});
    });
});
