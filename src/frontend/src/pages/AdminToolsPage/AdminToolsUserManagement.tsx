/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { NERButton } from '../../components/NERButton';
import { Box, Grid, Typography, useTheme } from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useState } from 'react';
import { useAllUsers, useCurrentUser, useUpdateUserRole } from '../../hooks/users.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { fullNamePipe } from '../../utils/pipes';
import { RoleEnum, User, isAdmin, rankUserRole } from 'shared';
import NERAutocomplete from '../../components/NERAutocomplete';
import { useToast } from '../../hooks/toasts.hooks';

const AdminToolsUserManagement: React.FC = () => {
  const [role, setRole] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [isDisabled, setIsDisabled] = useState(true);
  const { isLoading, isError, error, data: users } = useAllUsers();
  const updateUserRole = useUpdateUserRole();
  const theme = useTheme();
  const toast = useToast();
  const currentUser = useCurrentUser();
  const currentUserRank = rankUserRole(currentUser.role);

  const styles = {
    roleSelectStyle: {
      width: '100%',
      backgroundColor: theme.palette.primary.main,
      borderRadius: '25px',
      height: '40px',
      '.MuiOutlinedInput-notchedOutline': { borderRadius: '25px', borderColor: 'black' },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 0 },
      '&.Mui-disabled': { backgroundColor: theme.palette.background.paper }
    }
  };
  if (isLoading || !users) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

  const usersSearchOnChange = (
    _event: React.SyntheticEvent<Element, Event>,
    value: { label: string; id: string } | null
  ) => {
    if (value) {
      const user = users.find((user: User) => user.userId.toString() === value.id);
      if (user) {
        setUser(user);
        setRole(user.role);
      }
    } else {
      setUser(null);
    }
  };

  const handleRoleChange = (event: SelectChangeEvent) => {
    setRole(event.target.value);
    if (user && event.target.value === user.role) {
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
    }
  };

  const handleClick = async () => {
    if (!user) return;
    try {
      await updateUserRole.mutateAsync({ userId: user.userId, role });
      toast.success('Role updated successfully!');
      setUser(null);
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  const userToAutocompleteOptionWithRole = (user: User): { label: string; id: string } => {
    return { label: `${fullNamePipe(user)} (${user.email}) - ${user.role}`, id: user.userId.toString() };
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Role Management
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <NERAutocomplete
            id="users-autocomplete"
            onChange={usersSearchOnChange}
            options={users.filter((user) => rankUserRole(user.role) < currentUserRank).map(userToAutocompleteOptionWithRole)}
            size="small"
            placeholder="Select a User"
            value={user ? userToAutocompleteOptionWithRole(user) : null}
          />
        </Grid>
        <Grid item xs={12} md={3} mt={1}>
          <Select
            displayEmpty={true}
            renderValue={(value) => (value ? value : user ? user.role : 'Current Role')}
            id="role-select"
            value={role}
            onChange={handleRoleChange}
            sx={styles.roleSelectStyle}
            disabled={!user}
          >
            {isAdmin(currentUser.role)
              ? Object.values(RoleEnum)
                  .filter((v) => rankUserRole(v) <= currentUserRank)
                  .map((v) => (
                    <MenuItem value={v} key={v}>
                      {v}
                    </MenuItem>
                  ))
              : Object.values(RoleEnum)
                  .filter((v) => rankUserRole(v) < currentUserRank)
                  .map((v) => (
                    <MenuItem value={v} key={v}>
                      {v}
                    </MenuItem>
                  ))}
          </Select>
        </Grid>
        <Grid item xs={12} md={'auto'} mt={-1.5}>
          <NERButton
            sx={{ mt: '20px', float: 'right' }}
            variant="contained"
            disabled={isDisabled || !user}
            onClick={handleClick}
          >
            Confirm
          </NERButton>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminToolsUserManagement;
