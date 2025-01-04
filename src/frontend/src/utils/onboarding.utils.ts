import { Checklist } from 'shared';

export const sortGroupNames = (groupedChecklists: Record<string, Checklist[]>): Record<string, Checklist[]> => {
  const groupNames = Object.keys(groupedChecklists);

  groupNames.sort((group1, group2) => {
    if (group1 === 'General') return -1;
    if (group2 === 'General') return 1;

    return group1.localeCompare(group2);
  });

  const sortedGroupedChecklists: Record<string, Checklist[]> = {};
  groupNames.forEach((groupName) => {
    sortedGroupedChecklists[groupName] = groupedChecklists[groupName];
  });

  return sortedGroupedChecklists;
};

export const groupChecklists = (checklists: Checklist[]) => {
  const groupedChecklists = checklists.reduce<Record<string, Checklist[]>>((groupedChecklists, checklist) => {
    let checklistName: string;
    if (checklist.teamType) {
      checklistName = checklist.teamType.name;
    } else if (checklist.team) {
      checklistName = checklist.team?.teamName;
    } else {
      checklistName = 'General';
    }

    if (!groupedChecklists[checklistName]) {
      groupedChecklists[checklistName] = [];
    }
    groupedChecklists[checklistName].push(checklist);
    return groupedChecklists;
  }, {});

  return sortGroupNames(groupedChecklists);
};
