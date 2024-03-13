import { Box } from '@mui/system';
import { ReactElement } from 'react';
import WarningIcon from '@mui/icons-material/Warning';
import BuildIcon from '@mui/icons-material/Build';
import ComputerIcon from '@mui/icons-material/Computer';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';

interface TimeSlotProps {
  text?: string;
  fontSize?: string;
  backgroundColor?: string;
  icon?: string;
  small: boolean;
  onMouseDown?: (e: any) => void;
  onMouseEnter?: (e: any) => void;
  onMouseUp?: (e: any) => void;
  onMouseOver?: () => void;
}

const TimeSlot: React.FC<TimeSlotProps> = ({
  text,
  fontSize,
  backgroundColor,
  small = false,
  icon,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
  onMouseOver
}) => {

  const getIcon = (icon: string, small: boolean): ReactElement | null => {
    const iconFont = small ? { fontSize: '1.4em' } : { fontSize: '2em' };
  
    switch (icon) {
      case 'warning':
        return <WarningIcon sx={iconFont} />;
      case 'build':
        return <BuildIcon sx={iconFont} />;
      case 'computer':
        return <ComputerIcon sx={iconFont} />;
      case 'electrical':
        return <ElectricalServicesIcon sx={iconFont} />;
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        height: small ? '25px' : '4.7vh',
        width: small ? '81px' : '11%',
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
      {icon && <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{getIcon(icon, small)}</Box>}
      {text}
    </Box>
  );
};

export default TimeSlot;
