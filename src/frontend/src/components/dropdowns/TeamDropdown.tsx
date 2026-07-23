/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { SxProps, Theme } from '@mui/material';
import { useSlimTeams } from '../../hooks/dropdowns.hooks';
import DropdownSelect from './DropdownSelect';

interface TeamDropdownProps {
  /** selected team ids */
  value: string[];
  onChange: (teamIds: string[]) => void;
  sx?: SxProps<Theme>;
}

/** Reusable multi-select of teams (FilterTaskArgs.teamIds). */
const TeamDropdown: React.FC<TeamDropdownProps> = ({ value, onChange, sx }) => {
  const { data: teams, isLoading } = useSlimTeams();

  const options = (teams ?? []).map((team) => ({ key: team.teamId, label: team.name }));

  return (
    <DropdownSelect
      label="Team"
      placeholder="Filter by team"
      options={options}
      selectedKeys={value}
      onChange={onChange}
      loading={isLoading}
      sx={sx}
    />
  );
};

export default TeamDropdown;
