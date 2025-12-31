import { Box } from '@mui/system';

interface EventTimeSlotProps {
  backgroundColor?: string;
  onClick?: () => void;
  selected?: boolean;
  onMouseDown?: (e: React.MouseEvent) => void;
  onMouseEnter?: (e: React.MouseEvent) => void;
  onMouseUp?: () => void;
}

const EventTimeSlot: React.FC<EventTimeSlotProps> = ({
  backgroundColor,
  onClick,
  selected = false,
  onMouseDown,
  onMouseEnter,
  onMouseUp
}) => {
  return (
    <Box onClick={onClick} onMouseDown={onMouseDown} onMouseEnter={onMouseEnter} onMouseUp={onMouseUp} p={0.5}>
      <Box
        sx={{
          borderRadius: 1,
          bgcolor: backgroundColor,
          width: '100%',
          height: '100%',
          minHeight: 54,
          display: 'flex',
          borderStyle: 'solid',
          borderColor: selected ? '#ffff8c' : 'gray',
          borderWidth: selected ? '2px' : '0.1px',
          userSelect: 'none', // Prevent text selection while dragging
          cursor: 'pointer'
        }}
      />
    </Box>
  );
};

export default EventTimeSlot;
