import { Box, FormControl, FormLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { Control, Controller } from 'react-hook-form';
import LoadingIndicator from './LoadingIndicator';
import { useAllTeams } from '../hooks/teams.hooks';

interface TeamDropdownProps {
  control: Control<any, any>;
  name: string;
  multiselect?: boolean;
}

const TeamDropdown = ({ control, name, multiselect = false }: TeamDropdownProps) => {
  const { isLoading, data: teams } = useAllTeams(false);
  if (isLoading || !teams) return <LoadingIndicator />;

  return (
    <Box>
      <FormControl fullWidth>
        <FormLabel sx={{ alignSelf: 'start' }}>{multiselect ? 'Teams' : 'Team'}</FormLabel>
        <Controller
          control={control}
          name={name}
          render={({ field: { onChange, value } }) => (
            <Select
              multiple={multiselect}
              id="team-autocomplete"
              displayEmpty
              renderValue={(values: any) =>
                multiselect
                  ? values.map((value: any) => teams.find((team) => team.teamId === `${value}`)?.teamName).join(', ')
                  : teams.find((team) => team.teamId === `${values}`)?.teamName
              }
              value={value}
              onChange={(event: SelectChangeEvent<number>) => onChange(event.target.value)}
              size={'small'}
              placeholder={'Change Team'}
              sx={{ height: 56, width: '100%', textAlign: 'left' }}
              MenuProps={{
                anchorOrigin: {
                  vertical: 'bottom',
                  horizontal: 'right'
                },
                transformOrigin: {
                  vertical: 'top',
                  horizontal: 'right'
                }
              }}
            >
              {teams.map((team) => {
                return (
                  <MenuItem key={team.teamId} value={team.teamId}>
                    {team.teamName}
                  </MenuItem>
                );
              })}
            </Select>
          )}
        />
      </FormControl>
    </Box>
  );
};

export default TeamDropdown;
