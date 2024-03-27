import { createListChanges } from '../../src/utils/changes.utils';

describe('CreateRulesChangesJson', () => {
  test('createRulesChangesJson with empty old + new lists', () => {
    const rulesChanges = createListChanges('test', [], [], 1, 2, 3);
    expect(rulesChanges.changes.length).toEqual(0);
  });

  test('createRulesChangesJson with empty new list and non-empty old list', () => {
    const rules = ['rule1', 'rule2', 'rule3'];
    const rulesChanges = createListChanges(
      'test',
      rules.map((str) => {
        return {
          element: str,
          comparator: str,
          displayValue: str
        };
      }),
      [],
      1,
      2,
      3
    );
    expect(rulesChanges.changes.length).toEqual(3);
    rulesChanges.changes.forEach((r, i) => {
      expect(r.changeRequestId).toEqual(1);
      expect(r.implementerId).toEqual(2);
      expect(r.wbsElementId).toEqual(3);
      expect(r.detail).toEqual(`Removed test "${rules[i]}"`);
    });
  });

  test('createRulesChangesJson with empty old list and non-empty new list', () => {
    const rules = ['rule1', 'rule2', 'rule3'];
    const rulesChanges = createListChanges(
      'test',
      [],
      rules.map((str) => {
        return {
          element: str,
          comparator: str,
          displayValue: str
        };
      }),
      1,
      2,
      3
    );
    expect(rulesChanges.changes.length).toEqual(3);
    rulesChanges.changes.forEach((r, i) => {
      expect(r.changeRequestId).toEqual(1);
      expect(r.implementerId).toEqual(2);
      expect(r.wbsElementId).toEqual(3);
      expect(r.detail).toEqual(`Added new test "${rules[i]}"`);
    });
  });

  test('createRulesChangesJson with non-empty old list and non-empty new list', () => {
    const oldRules = ['rule1', 'rule2', 'rule3'];
    const newRules = ['rule4', 'rule5', 'rule6'];
    const rulesChanges = createListChanges(
      'test',
      oldRules.map((str) => {
        return {
          element: str,
          comparator: str,
          displayValue: str
        };
      }),
      newRules.map((str) => {
        return {
          element: str,
          comparator: str,
          displayValue: str
        };
      }),
      1,
      2,
      3
    );
    expect(rulesChanges.changes.length).toEqual(6);
    rulesChanges.changes.slice(0, 3).forEach((r, i) => {
      expect(r.changeRequestId).toEqual(1);
      expect(r.implementerId).toEqual(2);
      expect(r.wbsElementId).toEqual(3);
      expect(r.detail).toEqual(`Removed test "${oldRules[i]}"`);
    });
    rulesChanges.changes.slice(3).forEach((r, i) => {
      expect(r.changeRequestId).toEqual(1);
      expect(r.implementerId).toEqual(2);
      expect(r.wbsElementId).toEqual(3);
      expect(r.detail).toEqual(`Added new test "${newRules[i]}"`);
    });
  });
});
