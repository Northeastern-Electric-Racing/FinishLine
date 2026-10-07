import { Box } from '@mui/material';

interface EventTimeSlotProps {
  backgroundColor?: string;
  onClick?: () => void;
  selected?: boolean;
  allRequiredAvailable?: boolean;
  busy?: boolean;
  onMouseDown?: (e: React.MouseEvent) => void;
  onMouseEnter?: (e: React.MouseEvent) => void;
  onMouseUp?: () => void;
}

const EventTimeSlot: React.FC<EventTimeSlotProps> = ({
  backgroundColor,
  onClick,
  selected = false,
  allRequiredAvailable = false,
  busy = false,
  onMouseDown,
  onMouseEnter,
  onMouseUp
}) => {
  const getBorderColor = () => {
    if (selected) return '#ffff8c';
    if (allRequiredAvailable) return '#216799';
    return 'gray';
  };

  const getBorderWidth = () => {
    if (selected || allRequiredAvailable) return '3px';
    return '0.1px';
  };

  return (
    <Box
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseUp={onMouseUp}
      sx={{
        p: '1px',
        width: '100%',
        height: '100%'
      }}
    >
      <Box
        sx={{
          borderRadius: 0.5,
          bgcolor: backgroundColor,
          backgroundImage: busy
            ? 'repeating-linear-gradient(45deg, rgba(0,0,0,0.25) 0px, rgba(0,0,0,0.25) 2px, transparent 2px, transparent 6px)'
            : 'none',
          width: '100%',
          height: '100%',
          minWidth: 24,
          minHeight: 16,
          display: 'flex',
          borderStyle: 'solid',
          borderColor: getBorderColor(),
          borderWidth: getBorderWidth(),
          userSelect: 'none',
          cursor: 'pointer'
        }}
      />
    </Box>
  );
};

export default EventTimeSlot;
