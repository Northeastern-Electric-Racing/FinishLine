/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Autocomplete, Button, Grid, IconButton, TextField, useTheme } from '@mui/material';
import { useState } from 'react';
import { useAuth } from '../../hooks/auth.hooks';
import { useAllUsers } from '../../hooks/users.hooks';
import { useSetTeamMembers } from '../../hooks/teams.hooks';
import { Team, User } from 'shared';
import { fullNamePipe } from '../../utils/pipes';
import { Edit } from '@mui/icons-material';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import PageBlock from '../../layouts/PageBlock';
import DetailDisplay from '../../components/DetailDisplay';

interface TeamMembersPageBlockProps {
  team: Team;
}

const TeamMembersPageBlock: React.FC<TeamMembersPageBlockProps> = ({ team }) => {
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

  //first filters the options to only include users who have not been selected to be on the team, then sorts the options by alphabetical order of their first name, then maps the options to the autocomplete option format
  const options = () => {
    return data
      .filter((user) => !memberIds.includes(user.userId))
      .sort((a, b) => (a.firstName > b.firstName ? 1 : -1))
      .map(userToAutocompleteOption);
  };

  const headerRight = (
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
  );

  const editingView = (
    <PageBlock title={'People'} headerRight={headerRight}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <DetailDisplay label="Lead" content={fullNamePipe(team.leader)} />
        </Grid>
        <Grid item xs={12}>
          <Autocomplete
            multiple
            id="tags-standard"
            options={options()}
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
  );

  const nonEditingView = (
    <PageBlock
      title={'People'}
      headerRight={<IconButton disabled={hasPerms()} onClick={() => setIsEditingMembers(true)} children={<Edit />} />}
    >
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <DetailDisplay label="Lead" content={fullNamePipe(team.leader)} />
        </Grid>
        <Grid item xs={12}>
          <DetailDisplay
            label="Members"
            content={team.members
              .map((member) => {
                return fullNamePipe(member);
              })
              .join(', ')}
          />
        </Grid>
      </Grid>
    </PageBlock>
  );
  return isEditingMembers ? editingView : nonEditingView;
};

export default TeamMembersPageBlock;
