import {
  Box,
  FormControl,
  FormLabel,
  Grid,
  TableCell,
  TableRow,
  Button,
  IconButton,
  TextField,
  useTheme
} from '@mui/material';
import { Edit } from '@mui/icons-material';
import { routes } from '../../utils/routes';
import { Link as RouterLink } from 'react-router-dom';
import PageBlock from '../../layouts/PageBlock';
import { NERButton } from '../../components/NERButton';
import { useAllTeams, useCreateTeam } from '../../hooks/teams.hooks';
import { fullNamePipe } from '../../utils/pipes';
import AdminToolTable from './AdminToolTable';
import { useAllUsers } from '../../hooks/users.hooks';
import { useToast } from '../../hooks/toasts.hooks';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import styles from '../../stylesheets/pages/teams.module.css';
import ReactMarkdown from 'react-markdown';
import * as yup from 'yup';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { isHead, isUnderWordCount, countWords, isAdmin } from 'shared';
import { userComparator, userToAutocompleteOption } from '../../utils/teams.utils';
import ReactHookTextField from '../../components/ReactHookTextField';
import NERAutocomplete from '../../components/NERAutocomplete';
import { ReactNode, useState } from 'react';
import { useAuth } from '../../hooks/auth.hooks';

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
  const auth = useAuth();
  const theme = useTheme();
  const [isEditingDescription, setIsEditingDescription] = useState(true);
  const [currentDescription, setCurrentDescription] = useState('');
  const [prevDescription, setPrevDescription] = useState('');
  const [isPreview, setIsPreview] = useState(false);
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
      setCurrentDescription('');
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

  const teamTableRows = allTeams?.map((team) => (
    <TableRow component={RouterLink} to={`${routes.TEAMS}/${team.teamId}`} sx={{ color: 'inherit', textDecoration: 'none' }}>
      <TableCell sx={{ border: '2px solid black' }}>{team.teamName}</TableCell>
      <TableCell sx={{ border: '2px solid black' }}>{fullNamePipe(team.head)}</TableCell>
      <TableCell align="center" sx={{ border: '2px solid black' }}>
        {team.members.length}
      </TableCell>
    </TableRow>
  ));

  const resetDefaults = () => {
    setIsEditingDescription(false);
    setIsPreview(false);
  };

  const hasPerms = auth.user && isAdmin(auth.user.role);

  interface DescriptionButtonsProps {
    toRight: ReactNode;
  }

  const DescriptionButtons: React.FC<DescriptionButtonsProps> = ({ toRight }) => {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '6px',
          marginBottom: '10px'
        }}
      >
        <FormLabel>Description</FormLabel>
        {toRight}
      </Box>
    );
  };

  const editButtons = (
    <Box style={{ display: 'flex' }}>
      <Button
        onClick={() => {
          setCurrentDescription(prevDescription);
          setPrevDescription('');
          resetDefaults();
        }}
      >
        Cancel
      </Button>
      <Button
        onClick={() => {
          setPrevDescription(currentDescription);
          setIsPreview(!isPreview);
        }}
        sx={{
          ml: 2,
          backgroundColor: theme.palette.grey[600],
          color: theme.palette.getContrastText(theme.palette.grey[600]),
          '&:hover': {
            backgroundColor: theme.palette.grey[700]
          }
        }}
      >
        {isPreview ? 'Edit' : 'Preview'}
      </Button>
    </Box>
  );

  const nonEditingView = (
    <Box sx={{ display: 'flex-col' }}>
      <DescriptionButtons
        toRight={hasPerms ? <IconButton onClick={() => setIsEditingDescription(true)} children={<Edit />} /> : null}
      />
      <ReactMarkdown className={styles.markdown}>{currentDescription}</ReactMarkdown>
    </Box>
  );

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
                    value={headOptions?.find((option) => option.id === value) || { id: '', label: '' }}
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
                render={({ field }) =>
                  isEditingDescription ? (
                    <Box sx={{ display: 'flex-col' }}>
                      <DescriptionButtons toRight={editButtons} />
                      {isPreview ? (
                        <ReactMarkdown className={styles.markdown}>{currentDescription}</ReactMarkdown>
                      ) : (
                        <TextField
                          fullWidth
                          multiline
                          rows={5}
                          value={currentDescription}
                          id={'description-input'}
                          onChange={(e) => {
                            setCurrentDescription(e.target.value);
                            field.onChange(e);
                          }}
                          inputProps={{
                            maxLength: isUnderWordCount(field.value, 300) ? null : 0
                          }}
                          error={!!errors.description || !isUnderWordCount(currentDescription, 300)}
                          helperText={
                            errors.description ? errors.description.message : `${countWords(field.value)}/300 words`
                          }
                        />
                      )}
                    </Box>
                  ) : (
                    nonEditingView
                  )
                }
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
    </PageBlock>
  );
};

export default TeamsTools;
