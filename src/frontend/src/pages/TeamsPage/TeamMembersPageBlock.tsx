/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import PageBlock from '../../layouts/PageBlock';
import { Autocomplete, Button, Grid, IconButton, TextField, Typography, useTheme } from '@mui/material';
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
  const [memberIds, setMemberIds] = useState(team.members.map((member) => member.userId));

  const { isLoading, isError, error, data } = useAllUsers();
  const {
    isLoading: setTeamMemberIsLoading,
    isError: setTeamMemberIsError,
    error: setTeamMemberError,
    mutateAsync
  } = useSetTeamMembers(team.teamId);
  if (isError) return <ErrorPage message={error?.message} />;
  if (setTeamMemberIsError) return <ErrorPage message={setTeamMemberError?.message} />;
  if (isLoading || setTeamMemberIsLoading || !data) return <LoadingIndicator />;

  const handleSubmit = async () => {
    await mutateAsync(memberIds);
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

  return isEditingMembers ? (
    <PageBlock
      title={'People'}
      headerRight={
        <div style={{ display: 'flex' }}>
          <Button onClick={() => setIsEditingMembers(false)}>Cancel</Button>
          <Button
            sx={{
              ml: 2,
              backgroundColor: theme.palette.success.main,
              color: theme.palette.success.contrastText,
              '&:hover': {
                backgroundColor: theme.palette.success.dark
              }
            }}
            onClick={handleSubmit}
          >
            Save
          </Button>
        </div>
      }
    >
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Typography sx={{ display: 'inline', fontWeight: 'bold' }}>Lead: </Typography>
          <Typography sx={{ display: 'inline' }} variant={'body1'}>
            {fullNamePipe(team.leader)}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Autocomplete
            multiple
            id="tags-standard"
            //first filters the options to only include users who have not been selected to be on the team, then sorts the options by alphabetical order of their first name
            options={data
              .filter((user) => !memberIds.includes(user.userId))
              .sort((a, b) => (a.firstName > b.firstName ? 1 : -1))
              .map(userToAutocompleteOption)}
            defaultValue={team.members.map(userToAutocompleteOption)}
            onChange={(event, newValue) => {
              setMemberIds(newValue.map((option) => option.id));
            }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField {...params} variant="standard" label="Members" placeholder="Select A User" />
            )}
          />
        </Grid>
      </Grid>
    </PageBlock>
  ) : (
    <PageBlock
      title={'People'}
      headerRight={<IconButton disabled={hasPerms()} onClick={() => setIsEditingMembers(true)} children={<Edit />} />}
    >
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Typography style={{ display: 'inline', fontWeight: 'bold' }}>Lead: </Typography>
          <Typography style={{ display: 'inline' }}>{fullNamePipe(team.leader)}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography sx={{ display: 'inline', fontWeight: 'bold' }}>Members: </Typography>
          <Typography sx={{ display: 'inline' }}>
            {team.members
              .map((member) => {
                return fullNamePipe(member);
              })
              .join(', ')}
          </Typography>
        </Grid>
      </Grid>
    </PageBlock>
  );
};

export default TeamMembersView;
