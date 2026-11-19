import { Switch, Tooltip } from '@mui/material';

interface RetrospectiveToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/** Switches the gantt chart between the standard and retrospective views */
const RetrospectiveToggle = ({ checked, onChange }: RetrospectiveToggleProps) => {
  return (
    <Tooltip title="Retrospective" placement="top">
      <Switch
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        inputProps={{ 'aria-label': 'Retrospective' }}
      />
    </Tooltip>
  );
};

export default RetrospectiveToggle;
