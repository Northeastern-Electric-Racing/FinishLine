import { Box } from '@mui/system';
import { ReactElement } from 'react';
import { User } from 'shared';
import WarningIcon from '@mui/icons-material/Warning';
import BuildIcon from '@mui/icons-material/Build';
import ComputerIcon from '@mui/icons-material/Computer';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';

export interface DRCModalProps {
  open: boolean;
  title: string;
  onHide: () => void;
  onSubmit?: () => void;
  usersToAvailabilities: Map<User, number[]>;
  iconData: Map<number, string>;
}

export interface DRCViewProps {
  title: string;
  usersToAvailabilities: Map<User, number[]>;
  iconData: Map<number, string>;
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

function getBackgroundColor(frequency: number = 0, totalUsers: number): string {
  if (frequency === 0) return '#D9D9D9'; 
  if (frequency >= totalUsers) return '#D70C0F';

  const colors = ['#E0C0C1', '#E89A9B', '#E4797A', '#EF4345'];

  const ratio = (frequency - 1) / (totalUsers - 1) * (colors.length - 1);
  const colorIndex = Math.floor(ratio);

  return colors[colorIndex];
}


function getIcon(icon: string, isModal: boolean): ReactElement | null {
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
}

const TimeSlot: React.FC<TimeSlotProps> = ({
  text,
  fontSize,
  backgroundColor,
  isModal,
  icon,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
  onMouseOver
}) => {
  return (
    <Box
      sx={{
        height: isModal ? '25px' : '4.7vh',
        width: isModal ? '81px' : '11%',
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
      {icon && <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{getIcon(icon, isModal)}</Box>}
      {text}
    </Box>
  );
};

export { daysOfWeek, times, TimeSlot, getBackgroundColor, getIcon };
