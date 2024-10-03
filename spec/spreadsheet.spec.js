const { Spreadsheet, sumFunction, avgFunction, minFunction, maxFunction, calcFormula } = require('../index');

describe('Spreadsheet Formulas', () => {
    let spreadsheet;

    beforeEach(() => {
        spreadsheet = new Spreadsheet();
        // Set up test data
        spreadsheet.setCellValue('A1', 10);
        spreadsheet.setCellValue('A2', 20);
        spreadsheet.setCellValue('A3', 30);
        spreadsheet.setCellValue('B1', 5);
        spreadsheet.setCellValue('B2', 15);
        spreadsheet.setCellValue('B3', 25);
        spreadsheet.setCellValue('C1', 'text');
        spreadsheet.setCellValue('C2', null);
    });

    // what the above spreadsheet looks like:
    // +----+-----+-------+
    // | 10 |  5  |  text |
    // +----+-----+-------+
    // | 20 |  15 |       |
    // | 30 |  25 |       |
    // +----+-----+-------+

    describe('SUM Formula', () => {
        it('should correctly sum a range of numbers', () => {
            expect(sumFunction(spreadsheet, 'A1', 'A3')).toBe(60);
        });

        it('should return "Not Applicable" when summing a range with non-numeric values', () => {
            expect(sumFunction(spreadsheet, 'A1', 'C2')).toBe('Not Applicable');
        });

        it('should correctly sum a range with some valid numbers', () => {
            expect(sumFunction(spreadsheet, 'A1', 'B2')).toBe(50);
        });

        it('should return not applicable if at least one cell is not numeric', () => {
            expect(sumFunction(spreadsheet, 'A1', 'C2')).toBe('Not Applicable');
        });
    });

    describe('AVERAGE Formula', () => {
        it('should correctly calculate the average of a range of numbers', () => {
            expect(avgFunction(spreadsheet, 'A1', 'A3')).toBe(20);
        });

        it('should correctly calculate the average of a range of numbers', () => {
            expect(avgFunction(spreadsheet, 'A1', 'B3')).toBeCloseTo(17.5, 2);
        });

        it('should return "Not Applicable" when averaging a range with all non-numeric values', () => {
            expect(avgFunction(spreadsheet, 'C1', 'C2')).toBe('Not Applicable');
        });

        it('should correctly calculate the average of a range with some valid numbers', () => {
            expect(avgFunction(spreadsheet, 'A1', 'C2')).toBe('Not Applicable');
        });
    });

    describe('MIN Formula', () => {
        it('should correctly find the minimum in a range of numbers', () => {
            expect(minFunction(spreadsheet, 'A1', 'B3')).toBe(5);
        });

        it('should return "Not Applicable" when finding minimum in a range with all non-numeric values', () => {
            expect(minFunction(spreadsheet, 'C1', 'C2')).toBe('Not Applicable');
        });

        it('should correctly find the minimum in a range with some valid numbers', () => {
            expect(minFunction(spreadsheet, 'A1', 'C2')).toBe(5);
        });
    });

    describe('MAX Formula', () => {
        it('should correctly find the maximum in a range of numbers', () => {
            expect(maxFunction(spreadsheet, 'A1', 'B3')).toBe(30);
        });

        it('should return "Not Applicable" when finding maximum in a range with all non-numeric values', () => {
            expect(maxFunction(spreadsheet, 'C1', 'C2')).toBe('Not Applicable');
        });

        it('should correctly find the maximum in a range with some valid numbers', () => {
            expect(maxFunction(spreadsheet, 'A1', 'C2')).toBe(20);
        });
    });

    describe('calcFormula', () => {
        it('should correctly calculate SUM formula', () => {
            expect(calcFormula(spreadsheet, '=SUM(A1:A3)')).toBe(60);
        });

        it('should correctly calculate AVERAGE formula', () => {
            expect(calcFormula(spreadsheet, '=AVG(A1:A3)')).toBe(20);
        });

        it('should correctly calculate MIN formula', () => {
            expect(calcFormula(spreadsheet, '=MIN(A1:B3)')).toBe(5);
        });

        it('should correctly calculate MAX formula', () => {
            expect(calcFormula(spreadsheet, '=MAX(A1:B3)')).toBe(30);
        });

        it('should throw an error for unsupported formulas', () => {
            expect(() => calcFormula(spreadsheet, '=UNSUPPORTED(A1:A3)')).toThrowError('Unsupported Formula!');
        });
    });
});