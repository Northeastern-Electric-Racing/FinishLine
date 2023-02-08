import { styled, Tooltip, tooltipClasses, TooltipProps } from '@mui/material';

interface DynamicTooltipProps {
  id: string;
  title: React.ReactNode;
  placement: string;
  arrow: boolean;
  innerWidth: number;
}

const DynamicTooltip: React.FC<DynamicTooltipProps> = ({ id, title, placement, arrow, innerWidth }) => {
  // https://mui.com/material-ui/react-tooltip/#VariableWidth.tsx
  const InnerTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))({
    [`& .${tooltipClasses.tooltip}`]: {
      maxWidth: `${(innerWidth as number) / 2}px`,
      overflowWrap: 'break-word'
    }
  });
  return <>{InnerTooltip}</>;
};

export default DynamicTooltip;
