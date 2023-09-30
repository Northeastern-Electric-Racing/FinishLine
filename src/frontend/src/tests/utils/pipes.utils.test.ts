import { datePipe, dateUndefinedPipe } from '../../utils/pipes';

describe('dateUndefinedPipe', () => {
  const date1 = new Date('2022-01-01T00:00:00Z');

  it('produces placeholder for undefined', () => {
    const hyphensRegex = /^-+$/; // any number of hyphens

    expect(dateUndefinedPipe(undefined)).toMatch(hyphensRegex);
    expect(dateUndefinedPipe(date1)).not.toMatch(hyphensRegex);
  });

  it('formats date using datePipe', () => {
    expect(dateUndefinedPipe(date1)).toEqual(datePipe(date1));
  });
});
