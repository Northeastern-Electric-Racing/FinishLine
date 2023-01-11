import PageBlock from '../../layouts/PageBlock';
import { Autocomplete, Button, Grid, IconButton, TextField, useTheme } from '@mui/material';
import { fullNamePipe } from '../../utils/pipes';
import { Team } from 'shared';
import { Edit } from '@mui/icons-material';
import { useState } from 'react';
import { useAuth } from '../../hooks/auth.hooks';
import { useAllUsers } from '../../hooks/users.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { User } from 'shared';
import { useSetTeamMembers } from '../../hooks/teams.hooks';

interface TeamMembersViewProps {
  team: Team;
}

const TeamMembersView: React.FC<TeamMembersViewProps> = ({ team }) => {
  const auth = useAuth();
  const theme = useTheme();
  const [isEditingMembers, setIsEditingMembers] = useState(false);
  const [members, setMembers] = useState(team.members);

  const { isLoading, isError, error, data } = useAllUsers();
  const {
    isLoading: memberIsLoading,
    isError: memberIsError,
    error: memberError,
    mutateAsync
  } = useSetTeamMembers(team.teamId);
  if (isError) return <ErrorPage message={error?.message} />;
  if (memberIsError) return <ErrorPage message={memberError?.message} />;
  if (isLoading || memberIsLoading || !data) return <LoadingIndicator />;

  const handleSubmit = async () => {
    await mutateAsync(members.map((member) => member.userId));
    setIsEditingMembers(false);
  };

  const hasPerms = () => {
    return !(
      auth.user &&
      (auth.user.role === 'ADMIN' || auth.user.role === 'APP_ADMIN' || auth.user.userId === team.leader.userId)
    );
  };
  const userToAutocompleteOption = (user: User): { label: string; id: number } => {
    return { label: `${fullNamePipe(user)}`, id: user.userId };
  };

  if (!isEditingMembers)
    return (
      <PageBlock
        title={'People'}
        headerRight={<IconButton disabled={hasPerms()} onClick={() => setIsEditingMembers(true)} children={<Edit />} />}
      >
        <Grid container spacing={1}>
          <Grid item xs={12} md={12}>
            <b style={{ display: 'inline' }}>Lead: </b>
            <p style={{ display: 'inline' }}>{fullNamePipe(team.leader)}</p>
          </Grid>
          <Grid item xs={12} md={12}>
            <b style={{ display: 'inline' }}>Members: </b>
            <p style={{ display: 'inline' }}>
              {team.members
                .map((member) => {
                  return fullNamePipe(member);
                })
                .join(', ')}
            </p>
          </Grid>
        </Grid>
      </PageBlock>
    );
  else {
    return (
      <PageBlock
        title={'People'}
        headerRight={
          <div style={{ display: 'flex' }}>
            <Button onClick={() => setIsEditingMembers(false)}>Cancel</Button>
            <Button
              sx={{
                ml: 2,
                backgroundColor: theme.palette.success.main,
                color: theme.palette.success.contrastText
              }}
              onClick={handleSubmit}
            >
              Save
            </Button>
          </div>
        }
      >
        <Grid container spacing={1}>
          <Grid item xs={12} md={12}>
            <b style={{ display: 'inline' }}>Lead: </b>
            <p style={{ display: 'inline' }}>{fullNamePipe(team.leader)}</p>
          </Grid>
          <Grid item xs={12} md={12}>
            <Autocomplete
              multiple
              id="tags-standard"
              //first filters the options to only include users who have not been selected to be on the team, then sorts the options by alphabetical order of their first name
              options={data
                .filter((user) => !members.map((user) => user.userId).includes(user.userId))
                .sort((a, b) => (a.firstName > b.firstName ? 1 : -1))}
              getOptionLabel={(option) => userToAutocompleteOption(option).label}
              defaultValue={team.members}
              onChange={(event, newValue) => {
                setMembers(newValue);
              }}
              renderInput={(params) => (
                <TextField {...params} variant="standard" label="Members" placeholder="Select A User" />
              )}
            />
          </Grid>
        </Grid>
      </PageBlock>
    );
  }
};

export default TeamMembersView;
