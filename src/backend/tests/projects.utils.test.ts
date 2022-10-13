import { createRulesChangesJson } from '../src/utils/projects.utils';

describe('CreateRulesChangesJson', () => {
  test('createRulesChangesJson with empty old + new lists', () => {
    const rulesChanges = createRulesChangesJson('test', [], [], 1, 2, 3);
    expect(rulesChanges.length).toEqual(0);
  });

  test('createRulesChangesJson with empty new list and non-empty old list', () => {
    const rules = ['rule1', 'rule2', 'rule3'];
    const rulesChanges = createRulesChangesJson('test', rules, [], 1, 2, 3);
    expect(rulesChanges.length).toEqual(3);
    rulesChanges.forEach((r, i) => {
      expect(r.changeRequestId).toEqual(1);
      expect(r.implementerId).toEqual(2);
      expect(r.wbsElementId).toEqual(3);
      expect(r.detail).toEqual(`Removed test "${rules[i]}"`);
    });
  });

  test('createRulesChangesJson with empty old list and non-empty new list', () => {
    const rules = ['rule1', 'rule2', 'rule3'];
    const rulesChanges = createRulesChangesJson('test', [], rules, 1, 2, 3);
    expect(rulesChanges.length).toEqual(3);
    rulesChanges.forEach((r, i) => {
      expect(r.changeRequestId).toEqual(1);
      expect(r.implementerId).toEqual(2);
      expect(r.wbsElementId).toEqual(3);
      expect(r.detail).toEqual(`Added new test "${rules[i]}"`);
    });
  });

  test('createRulesChangesJson with non-empty old list and non-empty new list', () => {
    const oldRules = ['rule1', 'rule2', 'rule3'];
    const newRules = ['rule4', 'rule5', 'rule6'];
    const rulesChanges = createRulesChangesJson('test', oldRules, newRules, 1, 2, 3);
    expect(rulesChanges.length).toEqual(6);
    rulesChanges.slice(0, 3).forEach((r, i) => {
      expect(r.changeRequestId).toEqual(1);
      expect(r.implementerId).toEqual(2);
      expect(r.wbsElementId).toEqual(3);
      expect(r.detail).toEqual(`Removed test "${oldRules[i]}"`);
    });
    rulesChanges.slice(3).forEach((r, i) => {
      expect(r.changeRequestId).toEqual(1);
      expect(r.implementerId).toEqual(2);
      expect(r.wbsElementId).toEqual(3);
      expect(r.detail).toEqual(`Added new test "${newRules[i]}"`);
    });
  });
});
