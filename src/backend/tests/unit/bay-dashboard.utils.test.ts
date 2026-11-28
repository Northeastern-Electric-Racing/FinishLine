import { BayDashboardTier } from 'shared';
import { getTier } from '../../src/utils/bay-dashboard.utils.js';

describe('getTier', () => {
  it.each([
    [0, BayDashboardTier.S],
    [1, BayDashboardTier.S],
    [2, BayDashboardTier.A],
    [3, BayDashboardTier.A],
    [4, BayDashboardTier.B],
    [5, BayDashboardTier.B],
    [6, BayDashboardTier.D],
    [9, BayDashboardTier.D],
    [10, BayDashboardTier.F],
    [25, BayDashboardTier.F]
  ])('gives a team with %i overdue work packages tier %s', (overdueCount, tier) => {
    expect(getTier(overdueCount)).toBe(tier);
  });
});
