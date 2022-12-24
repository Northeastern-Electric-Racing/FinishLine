import Autocomplete from '@mui/material/Autocomplete';
import { NERButton } from '../../components/NERButton';
import { Grid } from '@mui/material';
import PageBlock from '../../layouts/PageBlock';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { useState } from 'react';
import { useAllUsers, useUpdateUserRole } from '../../hooks/users.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { fullNamePipe } from '../../utils/pipes';

interface UserData {
  userId: number;
  role: string;
}

const AdminToolsUserMangaement: React.FC = () => {
  const [role, setRole] = useState('');
  const [user, setUser] = useState<UserData | null>(null);
  const [isDisabled, setIsDisabled] = useState(true);
  const [hideSuccessLabel, setHideSuccessLabel] = useState(true);
  const { isLoading, isError, error, data } = useAllUsers();
  const update = useUpdateUserRole();

  if (isLoading || !data) return <LoadingIndicator />;

  if (isError) return <ErrorPage message={error?.message} />;

  const handleSearchChange = (event: React.SyntheticEvent<Element, Event>, value: string | null) => {
    if (value) {
      const user = data.find((user) => fullNamePipe(user) === value);
      if (user) setUser(user);
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
    await update.mutateAsync({ userId: user?.userId, role }).catch((error) => {
      alert(error);
      throw new Error(error);
    });
    setHideSuccessLabel(false);
  };

  return (
    <PageBlock title={'User Management'}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <div style={{ backgroundColor: 'ActiveBorder', borderRadius: '25px', height: '40px', display: 'flex' }}>
            <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
              <SearchIcon />
            </IconButton>
            <Autocomplete
              disablePortal
              id="autocomplete"
              onChange={handleSearchChange}
              options={data.map((user) => fullNamePipe(user))}
              sx={{
                width: '100%',
                '.MuiOutlinedInput-notchedOutline': { border: 0, borderRadius: '25px', borderColor: 'black' }
              }}
              size="small"
              renderInput={(params) => <TextField {...params} label="Select a User" />}
            />
          </div>
        </Grid>
        <Grid item xs={12} md={4}>
          <div
            style={{
              backgroundColor: '#ff0000',
              borderColor: '#0062cc',
              borderRadius: '25px',
              height: '40px'
            }}
          >
            <FormControl size="small" sx={{ width: '100%' }}>
              <InputLabel id="select-label">{!user ? 'Current Role' : user.role}</InputLabel>
              <Select
                label={!user ? 'Current Role' : user.role}
                labelId="select-label"
                id="role-select"
                value={role}
                onChange={handleRoleChange}
                disabled={!user}
                sx={{
                  '.MuiOutlinedInput-notchedOutline': { border: 0, borderRadius: '25px', borderColor: 'black' }
                }}
              >
                <MenuItem value={'ADMIN'}>Admin</MenuItem>
                <MenuItem value={'LEADERSHIP'}>Leadership</MenuItem>
                <MenuItem value={'MEMBER'}>Member</MenuItem>
                <MenuItem value={'GUEST'}>Guest</MenuItem>
              </Select>
            </FormControl>
          </div>
        </Grid>
      </Grid>
      <NERButton sx={{ mt: '2px', float: 'right' }} variant="contained" disabled={isDisabled || !user} onClick={handleClick}>
        Confirm
      </NERButton>
      <h4 hidden={hideSuccessLabel} style={{ color: 'primary' }}>
        Successfully Updated User
      </h4>
    </PageBlock>
  );
};

export default AdminToolsUserMangaement;
