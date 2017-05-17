describe "First example", ->
    xdescribe 'skipped suite', ->

    describe 'filter me', ->
        it 'should filter', ->
            expect(true).toBe true

        it 'should fail', ->
            expect(true).toBe false

    describe 'truthyness', ->
        it 'should be true for true (deliberately failing)', ->
            # Deliberately failing
            expect(true).toBe false

        it 'should be true for string', ->
            expect('this is true').toBeTruthy()

        it 'should be true for string', ->
            expect('this is true').toBeTruthy()

        xit 'skipped spec', ->
