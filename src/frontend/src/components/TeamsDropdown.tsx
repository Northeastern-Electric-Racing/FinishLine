import { Box, FormControl, FormLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { Control, Controller } from 'react-hook-form';
import LoadingIndicator from './LoadingIndicator';
import { useAllTeams } from '../hooks/teams.hooks';

interface TeamDropdownProps {
  control: Control<any, any>;
  name: string;
}

const TeamDropdown = ({ control, name }: TeamDropdownProps) => {
  const { isLoading, data: teams } = useAllTeams();
  if (isLoading || !teams) return <LoadingIndicator />;

  return (
    <Box>
      <FormControl fullWidth>
        <FormLabel sx={{ alignSelf: 'start' }}>Team</FormLabel>
        <Controller
          control={control}
          name={name}
          render={({ field: { onChange, value } }) => (
            <Select
              id="team-autocomplete"
              displayEmpty
              renderValue={(value) => teams.find((team) => team.teamId === `${value}`)?.teamName}
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
