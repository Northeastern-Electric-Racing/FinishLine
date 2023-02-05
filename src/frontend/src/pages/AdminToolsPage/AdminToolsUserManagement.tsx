/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { NERButton } from '../../components/NERButton';
import { Grid, Typography, useTheme } from '@mui/material';
import PageBlock from '../../layouts/PageBlock';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useState } from 'react';
import { useAllUsers, useUpdateUserRole } from '../../hooks/users.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { fullNamePipe } from '../../utils/pipes';
import { RoleEnum, User } from 'shared';
import NERAutocomplete from '../../components/NERAutocomplete';
import { useToast } from '../../hooks/toasts.hooks';

const AdminToolsUserMangaement: React.FC = () => {
  const [role, setRole] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [isDisabled, setIsDisabled] = useState(true);
  const [hideSuccessLabel, setHideSuccessLabel] = useState(true);
  const { isLoading, isError, error, data: users } = useAllUsers();
  const updateUserRole = useUpdateUserRole();
  const theme = useTheme();
  const toast = useToast();

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
    value: { label: string; id: number } | null
  ) => {
    if (value) {
      const user = users.find((user: User) => user.userId === value.id);
      if (user) {
        setUser(user);
        setRole(user.role);
        setHideSuccessLabel(true);
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
    setHideSuccessLabel(true);
    if (!user) return;
    try {
      await updateUserRole.mutateAsync({ userId: user.userId, role });
      setHideSuccessLabel(false);
      setUser(null);
    } catch (e) {
      if (e instanceof Error) {
        alert(e.message);
        toast.error(e.message);
      }
    }
  };

  const userToAutocompleteOption = (user: User): { label: string; id: number } => {
    return { label: `${fullNamePipe(user)} (${user.email}) - ${user.role}`, id: user.userId };
  };

  return (
    <PageBlock title={'Role Management'}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <NERAutocomplete
            id="users-autocomplete"
            onChange={usersSearchOnChange}
            options={users.map(userToAutocompleteOption)}
            size="small"
            placeholder="Select a User"
            value={user ? userToAutocompleteOption(user) : null}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Select
            displayEmpty={true}
            renderValue={(value) => (value ? value : user ? user.role : 'Current Role')}
            id="role-select"
            value={role}
            onChange={handleRoleChange}
            sx={styles.roleSelectStyle}
            disabled={!user}
          >
            {Object.values(RoleEnum)
              .filter((v) => v !== RoleEnum.APP_ADMIN)
              .map((v) => (
                <MenuItem value={v} key={v}>
                  {v}
                </MenuItem>
              ))}
          </Select>
        </Grid>
      </Grid>
      <NERButton
        sx={{ mt: '20px', float: 'right' }}
        variant="contained"
        disabled={isDisabled || !user}
        onClick={handleClick}
      >
        Confirm
      </NERButton>
      <Typography hidden={hideSuccessLabel} style={{ color: theme.palette.primary.main, marginTop: '20px' }}>
        Successfully Updated User
      </Typography>
    </PageBlock>
  );
};

export default AdminToolsUserMangaement;
