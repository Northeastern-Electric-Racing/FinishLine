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

export const groupChecklists = (checklists: Checklist[]): Record<string, Checklist[]> => {
  const groupedChecklists = checklists.reduce<Record<string, Checklist[]>>((acc, checklist) => {
    let checklistName: string;

    if (checklist.teamType) {
      checklistName = checklist.teamType.name;
    } else if (checklist.team) {
      checklistName = checklist.team.teamName;
    } else {
      checklistName = 'General';
    }

    if (!acc[checklistName]) {
      acc[checklistName] = [];
    }
    acc[checklistName].push(checklist);
    return acc;
  }, {});

  return groupedChecklists;
};

export const groupAndSortChecklists = (
  checklists: Checklist[],
  teamTypes: { name: string }[],
  teams: { teamName: string }[]
): Record<string, Checklist[]> => {
  const groupedChecklists = groupChecklists(checklists);

  const completeGroupedChecklists = teamTypes.reduce<Record<string, Checklist[]>>((acc, teamType) => {
    acc[teamType.name] = groupedChecklists[teamType.name] || [];
    return acc;
  }, {});

  teams.forEach((team) => {
    if (!completeGroupedChecklists[team.teamName]) {
      completeGroupedChecklists[team.teamName] = [];
    }
    completeGroupedChecklists[team.teamName] = [
      ...(completeGroupedChecklists[team.teamName] || []),
      ...(groupedChecklists[team.teamName] || [])
    ];
  });

  completeGroupedChecklists['General'] = groupedChecklists['General'] || [];

  return sortGroupNames(completeGroupedChecklists);
};
