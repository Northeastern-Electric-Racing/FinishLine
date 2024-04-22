import {
  Box,
  FormControl,
  FormLabel,
  Grid,
  TableCell,
  TableRow,
  Button,
  TextField,
  useTheme,
  Typography
} from '@mui/material';
import { routes } from '../../utils/routes';
import { Link as RouterLink } from 'react-router-dom';
import { NERButton } from '../../components/NERButton';
import { useAllTeams, useCreateTeam } from '../../hooks/teams.hooks';
import { fullNamePipe } from '../../utils/pipes';
import AdminToolTable from './AdminToolTable';
import { useAllUsers } from '../../hooks/users.hooks';
import { useToast } from '../../hooks/toasts.hooks';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import ReactMarkdown from 'react-markdown';
import * as yup from 'yup';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { isHead, isUnderWordCount, countWords } from 'shared';
import { userComparator, userToAutocompleteOption } from '../../utils/teams.utils';
import ReactHookTextField from '../../components/ReactHookTextField';
import NERAutocomplete from '../../components/NERAutocomplete';
import { useState } from 'react';

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
  const theme = useTheme();
  const [showPreview, setShowPreview] = useState(false);
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

  if (allUsersIsError) return <ErrorPage message={allUsersError.message} />;
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
    <TableRow component={RouterLink} to={`${routes.TEAMS}/${team.teamId}`} sx={{ color: 'inherit', textDecoration: 'none' }}>
      <TableCell sx={{ border: '2px solid black' }}>{team.teamName}</TableCell>
      <TableCell sx={{ border: '2px solid black' }}>{fullNamePipe(team.head)}</TableCell>
      <TableCell align="center" sx={{ border: '2px solid black' }}>
        {team.members.length}
      </TableCell>
    </TableRow>
  ));

  return (
    <Box>
      <Typography variant="h5" gutterBottom borderBottom={1} color="#ef4345" borderColor={'white'}>
        Team Management
      </Typography>
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
              <FormLabel sx={{ marginTop: '6px' }}>Team Name</FormLabel>
              <ReactHookTextField name="teamName" control={control} fullWidth errorMessage={errors.teamName} />
            </FormControl>
            <FormControl sx={{ width: '45%' }}>
              <FormLabel sx={{ marginTop: '6px' }}>Slack Channel ID</FormLabel>
              <ReactHookTextField name="slackId" control={control} fullWidth errorMessage={errors.slackId} />
            </FormControl>
            <FormControl fullWidth>
              <FormLabel sx={{ marginTop: '6px' }}>Head</FormLabel>
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
              <Controller
                name="description"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Box>
                    <Box
                      sx={{
                        marginTop: '6px',
                        marginBottom: '6px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'end'
                      }}
                    >
                      <FormLabel>Description</FormLabel>
                      <Button
                        onClick={() => {
                          setShowPreview(!showPreview);
                        }}
                        sx={{
                          backgroundColor: theme.palette.grey[600],
                          color: theme.palette.getContrastText(theme.palette.grey[600]),
                          '&:hover': {
                            backgroundColor: theme.palette.grey[700]
                          }
                        }}
                      >
                        {showPreview ? 'Edit' : 'Preview'}
                      </Button>
                    </Box>
                    {showPreview ? (
                      <ReactMarkdown>{field.value}</ReactMarkdown>
                    ) : (
                      <TextField
                        {...field}
                        fullWidth
                        multiline
                        rows={5}
                        id={'description-input'}
                        inputProps={{
                          maxLength: isUnderWordCount(field.value, 300) ? null : 0
                        }}
                        onChange={(e) => {
                          field.onChange(e);
                        }}
                        error={!!errors.description || !isUnderWordCount(field.value, 300)}
                        helperText={errors.description ? errors.description.message : `${countWords(field.value)}/300 words`}
                      />
                    )}
                  </Box>
                )}
              />
            </FormControl>
            <Box sx={{ display: 'flex', justifyContent: 'right' }}>
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
    </Box>
  );
};

export default TeamsTools;
