import { Box } from '@mui/material';

interface EventTimeSlotProps {
  backgroundColor?: string;
  onClick?: () => void;
  selected?: boolean;
  allRequiredAvailable?: boolean;
  onMouseDown?: (e: React.MouseEvent) => void;
  onMouseEnter?: (e: React.MouseEvent) => void;
  onMouseUp?: () => void;
}

const EventTimeSlot: React.FC<EventTimeSlotProps> = ({
  backgroundColor,
  onClick,
  selected = false,
  allRequiredAvailable = false,
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
