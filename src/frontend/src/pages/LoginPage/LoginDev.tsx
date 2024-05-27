/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import LoginIcon from '@mui/icons-material/Login';
import FormControl from '@mui/material/FormControl';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useAllUsers } from '../../hooks/users.hooks';
import { fullNamePipe } from '../../utils/pipes';
import { rankUserRole } from 'shared';
import { FormEvent } from 'react';
import { Typography } from '@mui/material';

interface LoginDevProps {
  devSetUser: (userId: string) => void;
  devFormSubmit: (e: FormEvent) => void;
}

/**
 * Form for dev users to do login on the dev environment.
 */
const LoginDev: React.FC<LoginDevProps> = ({ devSetUser, devFormSubmit }) => {
  if (import.meta.env.MODE !== 'development') return <></>;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { isLoading, data: usersList } = useAllUsers();

  if (!usersList || isLoading) return <LoadingIndicator />;

  if (usersList.length === 0) return <Typography>No Users Available</Typography>;

  const sortedUsers = usersList
    .sort((a, b) => a.firstName.localeCompare(b.firstName))
    .sort((a, b) => a.lastName.localeCompare(b.lastName))
    .sort((a, b) => rankUserRole(b.role) - rankUserRole(a.role));

  devSetUser(sortedUsers[0].userId);

  return (
    <form onSubmit={devFormSubmit}>
      <FormControl fullWidth sx={{ marginTop: 2 }}>
        <InputLabel id="localDevUser">Local Dev User</InputLabel>
        <Select
          label="Local Dev User"
          labelId="localDevUser"
          onChange={(e: any) => devSetUser(e.target.value)}
          defaultValue={sortedUsers[0].userId}
          endAdornment={
            <IconButton type="submit" color="success" sx={{ marginRight: 2 }}>
              <LoginIcon />
            </IconButton>
          }
        >
          {sortedUsers.map((user) => (
            <MenuItem key={user.userId} value={user.userId}>
              {fullNamePipe(user)} ({user.role.toLowerCase()})
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </form>
  );
};

export default LoginDev;
