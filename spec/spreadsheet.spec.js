const { Spreadsheet, sumFormula, avgFunction, minFunction, maxFunction, calcFormula } = require('../index');

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

  describe('SUM Formula', () => {
    it('should correctly sum a range of numbers', () => {
      expect(sumFormula('A1', 'A3')).toBe(60);
    });

    it('should return "Not Applicable" when summing a range with non-numeric values', () => {
      expect(sumFormula('A1', 'C2')).toBe('Not Applicable');
    });

    it('should correctly sum a range with some valid numbers', () => {
      expect(sumFormula('A1', 'B2')).toBe(50);
    });
  });

  describe('AVERAGE Formula', () => {
    it('should correctly calculate the average of a range of numbers', () => {
      expect(avgFunction('A1', 'A3')).toBe(20);
    });

    it('should return "Not Applicable" when averaging a range with all non-numeric values', () => {
      expect(avgFunction('C1', 'C2')).toBe('Not Applicable');
    });

    it('should correctly calculate the average of a range with some valid numbers', () => {
      expect(avgFunction('A1', 'C2')).toBeCloseTo(16.67, 2);
    });
  });

  describe('MIN Formula', () => {
    it('should correctly find the minimum in a range of numbers', () => {
      expect(minFunction('A1', 'B3')).toBe(5);
    });

    it('should return "Not Applicable" when finding minimum in a range with all non-numeric values', () => {
      expect(minFunction('C1', 'C2')).toBe('Not Applicable');
    });

    it('should correctly find the minimum in a range with some valid numbers', () => {
      expect(minFunction('A1', 'C2')).toBe(5);
    });
  });

  describe('MAX Formula', () => {
    it('should correctly find the maximum in a range of numbers', () => {
      expect(maxFunction('A1', 'B3')).toBe(30);
    });

    it('should return "Not Applicable" when finding maximum in a range with all non-numeric values', () => {
      expect(maxFunction('C1', 'C2')).toBe('Not Applicable');
    });

    it('should correctly find the maximum in a range with some valid numbers', () => {
      expect(maxFunction('A1', 'C2')).toBe(30);
    });
  });

  describe('calcFormula', () => {
    it('should correctly calculate SUM formula', () => {
      expect(calcFormula('=SUM(A1:A3)')).toBe(60);
    });

    it('should correctly calculate AVERAGE formula', () => {
      expect(calcFormula('=AVG(A1:A3)')).toBe(20);
    });

    it('should correctly calculate MIN formula', () => {
      expect(calcFormula('=MIN(A1:B3)')).toBe(5);
    });

    it('should correctly calculate MAX formula', () => {
      expect(calcFormula('=MAX(A1:B3)')).toBe(30);
    });

    it('should throw an error for unsupported formulas', () => {
      expect(() => calcFormula('=UNSUPPORTED(A1:A3)')).toThrow('Unsupported Formula!');
    });
  });
});