import { Box } from '@mui/system';
import { User } from 'shared';

export interface DRCModalProps {
  open: boolean;
  title: string;
  onHide: () => void;
  onSubmit?: () => void;
  usersToAvailabilities: Map<User, number[]>;
  currentUser?: User;
}

export interface DRCProps {
  // open: boolean;
  title: string;
  // onHide: () => void;
  // onSubmit?: () => void;
  usersToAvailabilities: Map<User, number[]>;
  // currentUser?: User;
}

export interface TimeSlotProps {
  text?: string;
  fontSize?: string;
  backgroundColor?: string;
  width?: string;
  height?: string;
  onMouseDown?: (e: any) => void;
  onMouseEnter?: (e: any) => void;
  onMouseUp?: (e: any) => void;
  onMouseOver?: () => void;
}

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const times = [
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

const getBackgroundColor = (frequency: number = 0): string => {
  if (frequency > 5) {
    return '#D70C0F';
  }

  switch (frequency) {
    case 0:
      return '#D9D9D9';
    case 1:
      return '#E0C0C1';
    case 2:
      return '#E89A9B';
    case 3:
      return '#E4797A';
    case 4:
      return '#EF4345';
    case 5:
      return '#D70C0F';
    default:
      return '#D9D9D9';
  }
};

const TimeSlot: React.FC<TimeSlotProps> = ({
  text,
  fontSize,
  backgroundColor,
  width = '81px',
  height = '25px',
  onMouseDown,
  onMouseEnter,
  onMouseUp,
  onMouseOver
}) => {
  return (
    <Box
      sx={{
        height,
        width,
        backgroundColor,
        cursor: 'pointer',
        borderStyle: 'solid',
        borderColor: 'gray',
        borderWidth: '0.1px',
        color: 'black',
        textAlign: 'center',
        fontSize,
        fontWeight: 'bold',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseUp={onMouseUp}
      onMouseOver={onMouseOver}
    >
      {text}
    </Box>
  );
};

export { daysOfWeek, times, getBackgroundColor, TimeSlot };
