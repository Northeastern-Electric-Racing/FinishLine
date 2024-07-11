import { TeamType } from 'shared';

const { MECHANICAL_CALENDAR, SOFTWARE_CALENDAR, ELECTRICAL_CALENDAR, EVENTS_CALENDAR } = process.env;

enum NER_TEAM_NAMES {
  MECHANICAL = 'Mechanical',
  SOFTWARE = 'Software',
  ELECTRICAL = 'Electrical'
}

export const getCalendarByTeamName = (teamType: TeamType) => {
  switch (teamType.name) {
    case NER_TEAM_NAMES.MECHANICAL:
      return MECHANICAL_CALENDAR;
    case NER_TEAM_NAMES.SOFTWARE:
      return SOFTWARE_CALENDAR;
    case NER_TEAM_NAMES.ELECTRICAL:
      return ELECTRICAL_CALENDAR;
    default:
      return EVENTS_CALENDAR;
  }
};
