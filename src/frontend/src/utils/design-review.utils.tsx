import { ReactElement } from 'react';
import WarningIcon from '@mui/icons-material/Warning';
import BuildIcon from '@mui/icons-material/Build';
import ComputerIcon from '@mui/icons-material/Computer';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import { User } from 'shared';
import {
  batman,
  superman,
  theVisitor,
  greenlantern,
  wonderwoman,
  flash,
  aquaman,
  alfred
} from '../../../backend/tests/test-data/users.test-data';

export const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const times = [
  '10-11 AM',
  '11-12 AM',
  '12-1 PM',
  '1-2 PM',
  '2-3 PM',
  '3-4 PM',
  '4-5 PM',
  '5-6 PM',
  '6-7 PM',
  '7-8 PM',
  '8-9 PM',
  '9-10 PM'
];

export interface DRCModalProps {
  open: boolean;
  description: string;
  time: string;
  location: string;
  onHide: () => void;
  onSubmit?: () => void;
  usersToAvailabilities: Map<User, number[]>;
  existingMeetingData: Map<number, string>;
}

export interface DRCViewProps {
  title: string;
  usersToAvailabilities: Map<User, number[]>;
  existingMeetingData: Map<number, string>;
}

export interface TimeSlotProps {
  text?: string;
  fontSize?: string;
  backgroundColor?: string;
  icon?: string;
  isModal: boolean;
  onMouseDown?: (e: any) => void;
  onMouseEnter?: (e: any) => void;
  onMouseUp?: (e: any) => void;
  onMouseOver?: () => void;
}

export enum HeatmapColors {
  zero = '#D9D9D9',
  one = '#E0C0C1',
  two = '#E89A9B',
  three = '#E4797A',
  four = '#EF4345',
  five = '#D70C0F'
}

export const getBackgroundColor = (frequency: number = 0, totalUsers: number): string => {
  if (frequency === 0) return HeatmapColors.zero;
  if (frequency >= totalUsers) return HeatmapColors.five;

  const colors = [HeatmapColors.two, HeatmapColors.three, HeatmapColors.four, HeatmapColors.five];

  const ratio = ((frequency - 1) / (totalUsers - 1)) * (colors.length - 1);
  const colorIndex = Math.floor(ratio);

  return colors[colorIndex];
};

export const getIcon = (icon: string, isModal: boolean): ReactElement | null => {
  const iconStyle = isModal ? { fontSize: '1.4em' } : { fontSize: '2em' };

  switch (icon) {
    case 'warning':
      return <WarningIcon sx={iconStyle} />;
    case 'build':
      return <BuildIcon sx={iconStyle} />;
    case 'computer':
      return <ComputerIcon sx={iconStyle} />;
    case 'electrical':
      return <ElectricalServicesIcon sx={iconStyle} />;
    default:
      return null;
  }
};

// TODO: We will have to make a call to the backend to get this data
// currently hardcoded for testing purposes
export const usersToAvailabilities = new Map([
  [superman, [1, 2, 3, 4, 5, 6, 7]],
  [batman, [2, 3, 4, 5, 6, 7]],
  [theVisitor, [3, 4, 5, 6, 7]],
  [greenlantern, [4, 5, 6, 7]],
  [wonderwoman, [5, 6, 7]],
  [flash, [6, 7]],
  [aquaman, [7]],
  [alfred, [7]]
]);

// TODO: We will have to maker a call to the backend to get this data
// currently hardcoded for testing purposes
export const existingMeetingData = new Map<number, string>();
existingMeetingData.set(5, 'warning');
existingMeetingData.set(10, 'build');
existingMeetingData.set(20, 'computer');
existingMeetingData.set(50, 'electrical');
