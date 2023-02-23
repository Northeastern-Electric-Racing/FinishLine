import { Tooltip, Typography } from '@mui/material';

interface DynamicTooltipProps {
  title: string;
  children: React.ReactElement;
}

const DynamicTooltip: React.FC<DynamicTooltipProps> = ({ title, children }) => {
  return (
    <Tooltip
      id="tooltip"
      placement="right"
      title={<Typography>{title}</Typography>}
      PopperProps={{
        popperOptions: {
          modifiers: [
            {
              name: 'flip',
              options: {
                fallbackPlacements: ['top', 'bottom']
              }
            },
            {
              name: 'offset',
              options: {
                // I think this should allow a plain value as well, not functions
                offset: [0, -10] // distance: 10px
              }
            }
          ]
        }
      }}
      arrow
    >
      {children}
    </Tooltip>
  );
};

export default DynamicTooltip;
