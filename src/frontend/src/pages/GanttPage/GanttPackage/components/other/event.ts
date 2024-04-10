import { Task } from '../../types/public-types';
import dayjs from 'dayjs';

export type Date_Event = { id: string; start: Date; end: Date; title: string };

export type EventChange = { id: string; eventId: string } & (
  | { type: 'change-end-date'; originalEnd: Date; newEnd: Date }
  | { type: 'shift-by-days'; days: number }
);

export function applyChangeToEvent(event: Task, eventChanges: EventChange[]): Task {
  const changedEvent = { ...event };
  for (const eventChange of eventChanges) {
    switch (eventChange.type) {
      case 'change-end-date': {
        changedEvent.end = eventChange.newEnd;
        break;
      }
      case 'shift-by-days': {
        changedEvent.start = dayjs(changedEvent.start).add(eventChange.days, 'days').toDate();
        changedEvent.end = dayjs(changedEvent.end).add(eventChange.days, 'days').toDate();
        break;
      }
    }
  }
  return changedEvent;
}

export function applyChangesToEvents(events: Task[], eventChanges: EventChange[]): Task[] {
  return events.map((event) => {
    const changes = eventChanges.filter((ec) => ec.eventId === event.id);
    return applyChangeToEvent(event, changes);
  });
}
