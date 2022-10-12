/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import LoginIcon from '@mui/icons-material/Login';
import FormControl from '@mui/material/FormControl';
import {
  exampleAdminUser,
  exampleAppAdminUser,
  exampleLeadershipUser,
  exampleMemberUser,
  exampleGuestUser
} from '../../tests/TestSupport/TestData/Users.stub';

interface LoginDevProps {
  devSetRole: (role: string) => void;
  devFormSubmit: (e: any) => any;
}

/**
 * Form for dev users to do login on the dev environment.
 */
const LoginDev: React.FC<LoginDevProps> = ({ devSetRole, devFormSubmit }) => {
  const usersList = [
    exampleAppAdminUser,
    exampleAdminUser,
    exampleLeadershipUser,
    exampleMemberUser,
    exampleGuestUser
  ];
  return (
    <form onSubmit={devFormSubmit}>
      <FormControl fullWidth sx={{ marginTop: 2 }}>
        <InputLabel id="localDevUser">Local Dev User</InputLabel>
        <Select
          label="Local Dev User"
          labelId="localDevUser"
          onChange={(e: any) => devSetRole(e.target.value)}
          endAdornment={
            <IconButton type="submit" color="success" sx={{ marginRight: 2 }}>
              <LoginIcon />
            </IconButton>
          }
        >
          {usersList.map((user) => (
            <MenuItem key={user.role} value={user.role}>
              {user.role}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </form>
  );
};

export default LoginDev;
