describe('First example', function () {
    xdescribe('skipped suite', function () {});

    describe('truthyness', function () {
        it('should be true for true', function () {
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
