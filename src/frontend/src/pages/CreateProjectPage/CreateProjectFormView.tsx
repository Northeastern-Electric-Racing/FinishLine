/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import PageBlock from '../../layouts/PageBlock';
import Grid from '@mui/material/Grid';
import PageTitle from '../../layouts/PageTitle/PageTitle';
import { routes } from '../../utils/routes';
import { FormControl, FormLabel } from '@mui/material';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { CreateProjectFormInputs } from './CreateProjectForm';
import ReactHookTextField from '../../components/ReactHookTextField';
import { useQuery } from '../../hooks/utils.hooks';
import { SubmitButton } from '../../components/SubmitButton';
import NERAutocomplete from '../../components/NERAutocomplete';
import { useState } from 'react';
import { Team } from 'shared';
import { useAllTeams } from '../../hooks/teams.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  carNumber: yup
    .number()
    .typeError('Car Number must be a number')
    .required('Car Number is required')
    .integer('Car Number must be an integer')
    .min(1, 'Car Number must be greater than or equal to 1'),
  crId: yup
    .number()
    .typeError('CR ID must be a number')
    .required('CR ID is required')
    .integer('CR ID must be an integer')
    .min(1, 'CR ID must be greater than or equal to 1'),
  summary: yup.string().required('Summary is required'),
  team: yup.string().required('Team is required')
});

interface CreateProjectFormViewProps {
  allowSubmit: boolean;
  onCancel: (e: any) => void;
  onSubmit: (project: CreateProjectFormInputs) => void;
}

const CreateProjectFormView: React.FC<CreateProjectFormViewProps> = ({ allowSubmit, onCancel, onSubmit }) => {
  const query = useQuery();
  const {
    handleSubmit,
    control,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      carNumber: Number(query.get('wbs')?.charAt(0)),
      crId: Number(query.get('crId')),
      summary: '',
      team: ''
    }
  });
  const [team, setTeam] = useState<Team | null>(null);
  const { isLoading, data: teams } = useAllTeams();

  if (isLoading || !teams) return <LoadingIndicator />;

  const teamsSearchOnChange = (
    _event: React.SyntheticEvent<Element, Event>,
    value: { label: string; id: string } | null
  ) => {
    if (value) {
      const team = teams.find((team: Team) => team.teamName === value.label);
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
    <form
      id={'create-project-form'}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleSubmit(onSubmit)(e);
      }}
      onKeyPress={(e) => {
        e.key === 'Enter' && e.preventDefault();
      }}
    >
      <PageTitle title={'New Project'} previousPages={[{ name: 'Projects', route: routes.PROJECTS }]} />
      <PageBlock title={''}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <FormControl>
              <FormLabel>Change Request ID</FormLabel>
              <ReactHookTextField
                name="crId"
                control={control}
                placeholder="Enter change request ID..."
                errorMessage={errors.crId}
                type="number"
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} md={9}>
            <FormControl>
              <FormLabel>Car Number</FormLabel>
              <ReactHookTextField
                name="carNumber"
                control={control}
                placeholder="Enter car number..."
                errorMessage={errors.carNumber}
                type="number"
              />
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl>
              <FormLabel>Project Name</FormLabel>
              <ReactHookTextField
                name="name"
                control={control}
                placeholder="Enter project name..."
                errorMessage={errors.name}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <NERAutocomplete
              id="teams-autocomplete"
              onChange={teamsSearchOnChange}
              options={teams.map(teamToAutoCompletion)}
              size="small"
              placeholder="Assign a Team *"
              value={team ? teamToAutoCompletion(team) : null}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl sx={{ minWidth: 325, width: '37%' }}>
              <FormLabel>Project Summary</FormLabel>
              <ReactHookTextField
                name="summary"
                control={control}
                placeholder="Enter summary..."
                errorMessage={errors.summary}
                multiline
                rows={5}
              />
            </FormControl>
          </Grid>
        </Grid>
        <Box display="flex" gap={2} sx={{ mt: 2 }}>
          <SubmitButton variant="contained" color="primary" type="submit" disabled={!allowSubmit}>
            Create
          </SubmitButton>
          <Button variant="outlined" color="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </Box>
      </PageBlock>
    </form>
  );
};

export default CreateProjectFormView;
