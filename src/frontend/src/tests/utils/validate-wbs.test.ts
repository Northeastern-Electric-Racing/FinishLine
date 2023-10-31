import { wbsNumComparator } from 'shared';
import '@testing-library/jest-dom/extend-expect';

describe('wbsNumComparator', () => {
  it('should correctly compare two WBS Numbers', () => {
    expect(wbsNumComparator('1.1.3', '1.3.4')).toBe(-1);
    expect(wbsNumComparator('1.2.1', '1.2.1')).toBe(0);
    expect(wbsNumComparator('1.3.4', '1.1.3')).toBe(1);
    expect(wbsNumComparator('2.3.4', '1.1.3')).toBe(1);
    expect(wbsNumComparator('1.3.4', '2.1.3')).toBe(-1);
  });
});
