import {
  TableRow,
  TableCell,
  Typography,
  Box,
  TableHead,
  Table,
  TableBody,
  Autocomplete,
  TextField,
  IconButton
} from '@mui/material';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import React, { useState } from 'react';
import { User } from 'shared';
import { NERButton } from '../../../components/NERButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { useGetFinanceDelegates, useSetFinanceDelegates } from '../../../hooks/organizations.hooks';
import { useAllUsers } from '../../../hooks/users.hooks';
import { useToast } from '../../../hooks/toasts.hooks';
import { fullNamePipe } from '../../../utils/pipes';

const FinanceDelegatesTable = () => {
  const {
    data: financeDelegates,
    isLoading: delegatesIsLoading,
    isError: delegatesIsError,
    error: delegatesError
  } = useGetFinanceDelegates();

  const { data: allUsers, isLoading: usersIsLoading, isError: usersIsError, error: usersError } = useAllUsers();

  const { mutateAsync: setFinanceDelegates, isLoading: isUpdating } = useSetFinanceDelegates();
  const toast = useToast();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  if (!financeDelegates || delegatesIsLoading || usersIsLoading) {
    return <LoadingIndicator />;
  }

  if (delegatesIsError) {
    return <ErrorPage message={delegatesError.message} />;
  }

  if (usersIsError) {
    return <ErrorPage message={usersError.message} />;
  }

  const handleAddDelegate = async () => {
    if (!selectedUser) return;

    try {
      const updatedUserIds = [...financeDelegates.map((u) => u.userId), selectedUser.userId];
      await setFinanceDelegates(updatedUserIds);
      setSelectedUser(null);
      toast.success('Finance delegate added successfully');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleRemoveDelegate = async (userId: string) => {
    try {
      const updatedUserIds = financeDelegates.filter((u) => u.userId !== userId).map((u) => u.userId);
      await setFinanceDelegates(updatedUserIds);
      toast.success('Finance delegate removed successfully');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const availableUsers =
    allUsers?.filter((user) => !financeDelegates.some((delegate) => delegate.userId === user.userId)) || [];

  const userAutocompleteOptions = availableUsers.map((user) => ({
    label: fullNamePipe(user),
    id: user.userId,
    user
  }));

  const delegateTableRows = financeDelegates.map((delegate, index) => (
    <TableRow key={`delegate-${index}`}>
      <TableCell sx={{ borderBottom: index === financeDelegates.length - 1 ? 'none' : 'default' }}>
        <Typography>{fullNamePipe(delegate)}</Typography>
      </TableCell>
      <TableCell sx={{ borderBottom: index === financeDelegates.length - 1 ? 'none' : 'default' }}>
        <Typography>{delegate.email}</Typography>
      </TableCell>
      <TableCell sx={{ borderBottom: index === financeDelegates.length - 1 ? 'none' : 'default' }}>
        <IconButton onClick={() => handleRemoveDelegate(delegate.userId)} aria-label="delete" disabled={isUpdating}>
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  ));

  const columns = ['Name', 'Email', 'Actions'];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'left', marginTop: '20px', paddingBottom: '20px', gap: 2 }}>
        <Typography variant="h5" gutterBottom color="white" paddingRight={'20px'}>
          Finance Delegates
        </Typography>
        <Autocomplete
          sx={{ width: 300 }}
          options={userAutocompleteOptions}
          value={selectedUser ? { label: fullNamePipe(selectedUser), id: selectedUser.userId, user: selectedUser } : null}
          onChange={(_event, newValue) => {
            setSelectedUser(newValue?.user || null);
          }}
          renderInput={(params) => <TextField {...params} variant="standard" placeholder="Select a User" />}
          isOptionEqualToValue={(option, value) => option.id === value.id}
        />
        <NERButton
          style={{ color: 'white' }}
          variant="contained"
          onClick={handleAddDelegate}
          disabled={!selectedUser || isUpdating}
        >
          Add Delegate
        </NERButton>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column, index) => (
              <TableCell
                key={`delegate-column-${index}`}
                sx={{
                  fontWeight: 'bold',
                  fontSize: '1em',
                  backgroundColor: '#ef4345',
                  color: 'white',
                  borderRadius: index === 0 ? '10px 0px 0px 0px' : index === columns.length - 1 ? '0px 10px 0px 0px' : '0px'
                }}
              >
                {column}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>{delegateTableRows}</TableBody>
      </Table>
    </Box>
  );
};

export default FinanceDelegatesTable;
