interface TimelineEvent {
  description: string;
  time: Date;
}

const TimelineInfo: TimelineEvent[] = [
  { description: 'Project kickoff meeting', time: new Date('2024-03-01T09:00:00') },
  { description: 'First prototype completed', time: new Date('2024-03-15T14:30:00') },
  { description: 'Stakeholder review', time: new Date('2024-03-20T10:00:00') },
  { description: 'Final bug fixes', time: new Date('2024-03-28T16:00:00') },
  { description: 'Launch day!', time: new Date('2024-04-01T08:00:00') },
  { description: 'Project kickoff meeting', time: new Date('2024-03-01T09:00:00') },
  { description: 'First prototype completed', time: new Date('2024-03-15T14:30:00') },
  { description: 'Stakeholder review', time: new Date('2024-03-20T10:00:00') },
  { description: 'Final bug fixes', time: new Date('2024-03-28T16:00:00') },
  { description: 'Launch day!', time: new Date('2024-04-01T08:00:00') }
];

export default TimelineInfo;
