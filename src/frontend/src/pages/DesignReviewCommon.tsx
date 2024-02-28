import { Box } from '@mui/system';
import { User } from 'shared';

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
  backgroundColor?: string;
  onClick?: () => void;
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

const getBackgroundColor = (frequency?: number): string => {
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

const TimeSlot: React.FC<TimeSlotProps> = ({ text, fontSize, backgroundColor, onClick }) => {
  return (
    <Box
      sx={{
        height: '25px',
        width: '81px',
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
        justifyContent: 'flex-end'
      }}
      onClick={onClick}
    >
      {text}
    </Box>
  );
};

export { daysOfWeek, times, getBackgroundColor, TimeSlot };
