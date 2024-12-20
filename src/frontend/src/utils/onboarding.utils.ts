import { Checklist } from 'shared';

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

  return groupedChecklists;
};
