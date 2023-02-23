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
