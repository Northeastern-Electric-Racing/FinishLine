import { Box } from '@mui/system';
import { getIcon } from '../utils/design-review.utils';

interface TimeSlotProps {
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

export default TimeSlot;
