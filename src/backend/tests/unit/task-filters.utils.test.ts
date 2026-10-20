import { deserializeTaskFilters, emptyTaskFilters, serializeTaskFilters, TaskFilterFields } from 'shared';
import { getFrontendBaseUrl, globalTasksUrl } from '../../src/utils/urls.utils.js';

describe('Task Filters Util Tests', () => {
  const filters: TaskFilterFields = {
    carNumbers: [1, 2],
    projectWbsNums: [
      { carNumber: 1, projectNumber: 2, workPackageNumber: 0 },
      { carNumber: 1, projectNumber: 5, workPackageNumber: 0 }
    ],
    workPackageWbsNums: [{ carNumber: 1, projectNumber: 2, workPackageNumber: 3 }],
    memberIds: ['user-1', 'user-2'],
    teamIds: ['team-1'],
    labelIds: ['label-1'],
    search: 'brakes & rotors'
  };

  describe('serializeTaskFilters / deserializeTaskFilters', () => {
    it('round trips every filter field', () => {
      expect(deserializeTaskFilters(serializeTaskFilters(filters))).toEqual(filters);
    });

    it('serializes empty filters to an empty query string', () => {
      expect(serializeTaskFilters(emptyTaskFilters)).toBe('');
    });

    it('preserves non-filter params and replaces stale filter params', () => {
      const params = new URLSearchParams(
        serializeTaskFilters({ ...emptyTaskFilters, teamIds: ['team-2'] }, 'task=abc&teams=old&cars=9')
      );
      expect(params.get('task')).toBe('abc');
      expect(params.get('teams')).toBe('team-2');
      expect(params.has('cars')).toBe(false);
    });

    it('drops invalid wbs numbers and car numbers', () => {
      const parsed = deserializeTaskFilters('cars=1,abc&projects=1.2.0,not-a-wbs');
      expect(parsed.carNumbers).toEqual([1]);
      expect(parsed.projectWbsNums).toEqual([{ carNumber: 1, projectNumber: 2, workPackageNumber: 0 }]);
    });
  });

  describe('globalTasksUrl', () => {
    it('links to the global task board filtered by project', () => {
      const url = globalTasksUrl({ projectWbsNums: filters.projectWbsNums });
      expect(url).toBe(`${getFrontendBaseUrl()}/tasks?projects=1.2.0%2C1.5.0`);
      expect(deserializeTaskFilters(new URL(url).search).projectWbsNums).toEqual(filters.projectWbsNums);
    });

    it('links to the unfiltered board when no filters are given', () => {
      expect(globalTasksUrl({})).toBe(`${getFrontendBaseUrl()}/tasks`);
    });
  });
});
