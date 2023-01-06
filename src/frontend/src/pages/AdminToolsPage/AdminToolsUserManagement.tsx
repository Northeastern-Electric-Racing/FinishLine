import Autocomplete from '@mui/material/Autocomplete';
import { NERButton } from '../../components/NERButton';
import { Grid, InputAdornment, Typography, useTheme } from '@mui/material';
import PageBlock from '../../layouts/PageBlock';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useState } from 'react';
import { useAllUsers, useUpdateUserRole } from '../../hooks/users.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { fullNamePipe } from '../../utils/pipes';
import { RoleEnum, User } from 'shared';

const AdminToolsUserMangaement: React.FC = () => {
  const [role, setRole] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [isDisabled, setIsDisabled] = useState(true);
  const [hideSuccessLabel, setHideSuccessLabel] = useState(true);
  const { isLoading, isError, error, data: users } = useAllUsers();
  const updateUserRole = useUpdateUserRole();
  const theme = useTheme();

  const autocompleteStyle = {
    height: '40px',
    backgroundColor: theme.palette.background.default,
    width: '100%',
    borderRadius: '25px',
    border: 0,
    '.MuiOutlinedInput-notchedOutline': {
      borderColor: 'black',
      borderRadius: '25px'
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: 'red'
    }
  };

  const selectStyle = {
    width: '100%',
    backgroundColor: theme.palette.primary.main,
    borderRadius: '25px',
    height: '40px',
    '.MuiOutlinedInput-notchedOutline': { borderRadius: '25px', borderColor: 'black' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 0 },
    '&.Mui-disabled': { backgroundColor: theme.palette.background.paper }
  };

  if (isLoading || !users) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

  const handleSearchChange = (_event: React.SyntheticEvent<Element, Event>, value: { label: string; id: number } | null) => {
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
    } catch (e) {
      alert(e);
    }
  };

  const autocompleteRenderInput = (params: any) => {
    return (
      <TextField
        {...params}
        InputProps={{
          ...params.InputProps,
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          )
        }}
        placeholder="Select a User"
      />
    );
  };

  return (
    <PageBlock title={'Role Management'}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Autocomplete
            isOptionEqualToValue={(option, value) => option.id === value.id}
            disablePortal
            id="autocomplete"
            onChange={handleSearchChange}
            options={users.map((user: User) => {
              return { label: `${fullNamePipe(user)} (${user.email}) - ${user.role}`, id: user.userId };
            })}
            sx={autocompleteStyle}
            size="small"
            renderInput={autocompleteRenderInput}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Select
            displayEmpty={true}
            renderValue={(value) => (value ? value : user ? user.role : 'Current Role')}
            id="role-select"
            value={role}
            onChange={handleRoleChange}
            sx={selectStyle}
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
