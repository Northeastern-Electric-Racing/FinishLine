/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import PageBlock from '../../layouts/PageBlock';
import Grid from '@mui/material/Grid';
import PageTitle from '../../layouts/PageTitle/PageTitle';
import { routes } from '../../utils/routes';
import { CreateProjectFormStates } from './CreateProjectForm';
import { styled, useTheme } from '@mui/material';
import NERAutocomplete from '../../components/NERAutocomplete';
import { useState } from 'react';
import { Team } from 'shared';
import { useAllTeams } from '../../hooks/teams.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';

interface CreateProjectFormViewProps {
  states: CreateProjectFormStates;
  allowSubmit: boolean;
  onCancel: (e: any) => void;
  onSubmit: (e: any) => void;
}

const NERInput = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-input': {
    borderRadius: 4,
    border: '1px solid ' + theme.palette.divider,
    width: 'auto'
  }
}));

const CreateProjectFormView: React.FC<CreateProjectFormViewProps> = ({ states, allowSubmit, onCancel, onSubmit }) => {
  const { name, carNumber, crId, summary } = states;
  const theme = useTheme();
  const [team, setTeam] = useState<Team | null>(null);
  const { isLoading, data: teams } = useAllTeams();
  if (isLoading || !teams) return <LoadingIndicator />;

  const teamsSearchOnChange = (
    _event: React.SyntheticEvent<Element, Event>,
    value: { label: string; id: string } | null
  ) => {
    if (value) {
      const team = teams.find((team: Team) => team.teamName === value.id);
      if (team) {
        setTeam(team);
      }
    } else {
      setTeam(null);
    }
  };

  const teamToAutoCompletion = (team: Team): { label: string; id: string } => {
    return { label: team.teamName, id: team.teamId };
  };

  return (
    <>
      <PageTitle title={'New Project'} previousPages={[{ name: 'Projects', route: routes.PROJECTS }]} />
      <PageBlock title={''}>
        <form onSubmit={onSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <NERInput
                required
                id="crId"
                name="crId"
                type="text"
                label="Change Request ID"
                placeholder="Enter change request ID..."
                autoComplete="off"
                onChange={(e) => crId(parseInt(e.target.value))}
                inputProps={{ inputMode: 'numeric', pattern: '[1-9][0-9]*' }}
              />
            </Grid>
            <Grid item xs={12} md={9}>
              <NERInput
                required
                id="carNumber"
                name="carNumber"
                type="text"
                label="Car Number"
                placeholder="Enter car number..."
                autoComplete="off"
                onChange={(e) => carNumber(parseInt(e.target.value))}
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              />
            </Grid>
            <Grid item xs={12}>
              <NERInput
                required
                id="name"
                name="name"
                type="text"
                label="Project Name"
                autoComplete="off"
                placeholder="Enter project name..."
                onChange={(e) => name(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <NERAutocomplete
                id="teams-autocomplete"
                onChange={teamsSearchOnChange}
                options={teams.map(teamToAutoCompletion)}
                size="small"
                placeholder="Assign a Team"
                value={team ? teamToAutoCompletion(team) : null}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                multiline
                minRows={4}
                id="summary"
                name="summary"
                type="text"
                label="Project Summary"
                autoComplete="off"
                placeholder="Enter summary..."
                onChange={(e) => summary(e.target.value)}
                sx={{ width: 1 / 2, border: '1px solid ' + theme.palette.divider, borderRadius: 2 }}
              />
            </Grid>
          </Grid>
          <Box display="flex" gap={2} sx={{ mt: 2 }}>
            <Button variant="contained" color="primary" type="submit" disabled={!allowSubmit}>
              Create
            </Button>
            <Button variant="outlined" color="secondary" onClick={onCancel}>
              Cancel
            </Button>
          </Box>
        </form>
      </PageBlock>
    </>
  );
};

export default CreateProjectFormView;
