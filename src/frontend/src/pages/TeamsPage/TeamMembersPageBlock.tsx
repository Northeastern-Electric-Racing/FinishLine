/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Autocomplete, Grid, IconButton, TextField } from '@mui/material';
import { useState } from 'react';
import { useAuth } from '../../hooks/auth.hooks';
import { useAllUsers } from '../../hooks/users.hooks';
import { useSetTeamMembers } from '../../hooks/teams.hooks';
import { RoleEnum, Team, User } from 'shared';
import { fullNamePipe } from '../../utils/pipes';
import { Edit } from '@mui/icons-material';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import PageBlock from '../../layouts/PageBlock';
import DetailDisplay from '../../components/DetailDisplay';
import NERSuccessButton from '../../components/NERSuccessButton';
import NERFailButton from '../../components/NERFailButton';

interface TeamMembersPageBlockProps {
  team: Team;
}

const userToAutocompleteOption = (user: User): { label: string; id: number } => {
  return { label: `${fullNamePipe(user)} (${user.email})`, id: user.userId };
};

const TeamMembersPageBlock: React.FC<TeamMembersPageBlockProps> = ({ team }) => {
  const auth = useAuth();
  const [isEditingMembers, setIsEditingMembers] = useState(false);
  const [members, setMembers] = useState(team.members.map(userToAutocompleteOption));

  const { isLoading, isError, error, data: users } = useAllUsers();
  const {
    isLoading: setTeamMemberIsLoading,
    isError: setTeamMemberIsError,
    error: setTeamMemberError,
    mutateAsync
  } = useSetTeamMembers(team.teamId);

  if (isError) return <ErrorPage message={error?.message} />;
  if (setTeamMemberIsError) return <ErrorPage message={setTeamMemberError?.message} />;
  if (isLoading || setTeamMemberIsLoading || !users) return <LoadingIndicator />;

  const handleSubmit = async () => {
    try {
      await mutateAsync(members.map((member) => member.id));
      setIsEditingMembers(false);
    } catch (error) {
      alert(error);
    }
  };

  const hasPerms =
    auth.user &&
    (auth.user.role === RoleEnum.ADMIN || auth.user.role === RoleEnum.APP_ADMIN || auth.user.userId === team.leader.userId);

  const options = users
    .filter((user) => user.userId !== team.leader.userId)
    .sort((a, b) => (a.firstName > b.firstName ? 1 : -1))
    .map(userToAutocompleteOption);

  const editButtons = (
    <div style={{ display: 'flex' }}>
      <NERFailButton
        onClick={() => {
          setIsEditingMembers(false);
          setMembers(team.members.map(userToAutocompleteOption));
        }}
      >
        Cancel
      </NERFailButton>
      <NERSuccessButton sx={{ ml: 2 }} onClick={handleSubmit}>
        Save
      </NERSuccessButton>
    </div>
  );

  const editingView = (
    <PageBlock title={'People'} headerRight={editButtons}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <DetailDisplay label="Lead" content={fullNamePipe(team.leader)} />
        </Grid>
        <Grid item xs={12}>
          <Autocomplete
            isOptionEqualToValue={(option, value) => option.id === value.id}
            filterSelectedOptions
            multiple
            id="tags-standard"
            options={options}
            value={members}
            onChange={(_event, newValue) => setMembers(newValue)}
            getOptionLabel={(option) => option.label}
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
      headerRight={hasPerms ? <IconButton onClick={() => setIsEditingMembers(true)} children={<Edit />} /> : null}
    >
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <DetailDisplay label="Lead" content={fullNamePipe(team.leader)} />
        </Grid>
        <Grid item xs={12}>
          <DetailDisplay label="Members" content={team.members.map((member) => fullNamePipe(member)).join(', ')} />
        </Grid>
      </Grid>
    </PageBlock>
  );
  return isEditingMembers ? editingView : nonEditingView;
};

export default TeamMembersPageBlock;
