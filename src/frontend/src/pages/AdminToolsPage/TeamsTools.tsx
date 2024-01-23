import { Box, FormControl, FormLabel, Grid, Link, TableCell, TableRow } from '@mui/material';
import { routes } from '../../utils/routes';
import { Link as RouterLink } from 'react-router-dom';
import PageBlock from '../../layouts/PageBlock';
import { NERButton } from '../../components/NERButton';
import { useAllTeams, useCreateTeam } from '../../hooks/teams.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { fullNamePipe } from '../../utils/pipes';
import AdminToolTable from './AdminToolTable';
import { useAllUsers } from '../../hooks/users.hooks';
import { useToast } from '../../hooks/toasts.hooks';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { isHead } from 'shared';
import { userComparator, userToAutocompleteOption } from '../../utils/teams.utils';
import ReactHookTextField from '../../components/ReactHookTextField';
import NERAutocomplete from '../../components/NERAutocomplete';

const schema = yup.object().shape({
  teamName: yup.string().required('Team Name is Required'),
  headId: yup.string().required('You must set a Head'),
  slackId: yup.string().required('Team Channel SlackId is required'),
  description: yup.string().required('Description is Required')
});

interface CreateTeamFormInput {
  teamName: string;
  headId: string;
  slackId: string;
  description: string;
}

const defaultValues = {
  teamName: '',
  slackId: '',
  description: '',
  headId: ''
};

const TeamsTools = () => {
  const { data: allTeams, isLoading: allTeamsIsLoading, isError: allTeamsIsError, error: allTeamsError } = useAllTeams();
  const { isLoading, mutateAsync } = useCreateTeam();
  const { isLoading: allUsersIsLoading, isError: allUsersIsError, error: allUsersError, data: users } = useAllUsers();
  const toast = useToast();

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues
  });

  if (!allTeams || allTeamsIsLoading || !users || allUsersIsLoading || isLoading) return <LoadingIndicator />;

  if (allTeamsIsError) {
    return <ErrorPage message={allTeamsError.message} />;
  }

  if (allUsersIsError) return <ErrorPage message={allUsersError?.message} />;

  const onFormSubmit = async (data: CreateTeamFormInput) => {
    try {
      await mutateAsync({ ...data, headId: Number(data.headId) });
      reset(defaultValues);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message, 5000);
      }
    }
  };

  const headOptions = users
    .filter((user) => isHead(user.role))
    .sort(userComparator)
    .map(userToAutocompleteOption);

  const teamTableRows = allTeams.map((team) => (
    <TableRow>
      <TableCell sx={{ border: '2px solid black' }}>
        <Link component={RouterLink} to={`${routes.TEAMS}/${team.teamId}`} sx={{ color: 'inherit', textDecoration: 'none' }}>
          {team.teamName}
        </Link>
      </TableCell>
      <TableCell sx={{ border: '2px solid black' }}>{fullNamePipe(team.head)}</TableCell>
      <TableCell align="center" sx={{ border: '2px solid black' }}>
        {team.members.length}
      </TableCell>
    </TableRow>
  ));

  return (
    <PageBlock title="Team Management">
      <Grid container columnSpacing={2}>
        <Grid item xs={12} md={6}>
          <form
            id={'create-team-form'}
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSubmit(onFormSubmit)(e);
            }}
            noValidate
          >
            <FormControl sx={{ width: '50%', marginRight: '10px' }}>
              <FormLabel>Team Name</FormLabel>
              <ReactHookTextField name="teamName" control={control} fullWidth errorMessage={errors.teamName} />
            </FormControl>
            <FormControl sx={{ width: '45%' }}>
              <FormLabel>Slack Channel ID</FormLabel>
              <ReactHookTextField name="slackId" control={control} fullWidth errorMessage={errors.slackId} />
            </FormControl>
            <FormControl fullWidth>
              <FormLabel>Head</FormLabel>
              <Controller
                name="headId"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <NERAutocomplete
                    value={headOptions.find((option) => option.id === value) || { id: '', label: '' }}
                    onChange={(_event, newValue) => onChange(newValue ? newValue.id : '')}
                    options={headOptions}
                    id="create-team-head"
                    size="small"
                    placeholder="Choose a user"
                    errorMessage={errors.headId}
                  />
                )}
              />
            </FormControl>
            <FormControl fullWidth>
              <FormLabel>Description</FormLabel>
              <ReactHookTextField
                name="description"
                control={control}
                fullWidth
                multiline
                rows={5}
                errorMessage={errors.description}
                maxLength={300}
              />
            </FormControl>
            <Box sx={{ display: 'flex', justifyContent: 'right', marginTop: '10px' }}>
              <NERButton variant="contained" type="submit">
                Create Team
              </NERButton>
            </Box>
          </form>
        </Grid>
        <Grid item xs={12} md={6} sx={{ marginTop: '24px' }}>
          <AdminToolTable
            columns={[{ name: 'Team Name' }, { name: 'Head' }, { name: 'Members', width: '20%' }]}
            rows={teamTableRows}
          />
        </Grid>
      </Grid>
    </PageBlock>
  );
};

export default TeamsTools;
