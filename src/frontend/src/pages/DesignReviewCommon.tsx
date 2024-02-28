import { User } from "shared";

export interface DRCModalProps {
    open: boolean;
    title: string;
    onHide: () => void;
    onSubmit?: () => void;
    usersToAvailabilities: Map<User, number[]>;
  }
  
  export interface TimeSlotProps {
    text?: string;
    fontSize?: number;
    backgroundColor: string;
  }
  
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
  
  export const getBackgroundColor = (frequency?: number): string => {
    switch (frequency) {
      case 0:
        return 'white';
      case 1:
        return 'red';
      case 2:
        return 'blue';
      case 3:
        return 'green';
      case 4:
        return 'purple';
      case 5:
        return 'orange';
      case 6:
        return 'yellow';
      default:
        return 'white';
    }
  };
