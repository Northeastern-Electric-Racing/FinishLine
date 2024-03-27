import { Box } from '@mui/system';
import { Icon } from '@mui/material';

interface TimeSlotProps {
  text?: string;
  fontSize?: string;
  backgroundColor?: string;
  icon?: string;
  small?: boolean;
  onMouseDown?: (e: any) => void;
  onMouseEnter?: (e: any) => void;
  onMouseUp?: (e: any) => void;
  onMouseOver?: () => void;
  onClick?: () => void;
  selected?: boolean;
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
  onMouseOver,
  onClick,
  selected = false
}) => {
  return (
    <Box
      sx={{
        height: small ? '25px' : '4.7vh',
        width: small ? '81px' : '12.2%',
        backgroundColor: selected ? '#9b9b9b' : backgroundColor,
        cursor: onMouseEnter ? 'pointer' : undefined,
        borderStyle: 'solid',
        borderColor: 'gray',
        borderWidth: '0.1px',
        color: 'black',
        textAlign: 'center',
        fontSize,
        fontWeight: 'bold',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseUp={onMouseUp}
      onMouseOver={onMouseOver}
      onClick={onClick}
    >
      {icon && <Icon>{icon}</Icon>}
      {text}
    </Box>
  );
};

export default TimeSlot;
