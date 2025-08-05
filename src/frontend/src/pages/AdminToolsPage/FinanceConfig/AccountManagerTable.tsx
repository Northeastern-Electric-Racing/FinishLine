import { TableRow, TableCell, Typography, Box, TableHead, Table, TableBody, Checkbox, IconButton } from '@mui/material';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useGetAllAccountCodes } from '../../../hooks/finance.hooks';
import ErrorPage from '../../ErrorPage';
import React, { useState } from 'react';
import { AccountCode } from 'shared';
import CreateAccountCodeModal from './CreateAccountCodeModal';
import EditAccountCodeModal from './EditAccountCodeModal';
import { NERButton } from '../../../components/NERButton';
import DeleteAccountCodeModal from './DeleteAccountCodeModal';
import DeleteIcon from '@mui/icons-material/Delete';
import { centsToDollar } from '../../../utils/pipes';

const AccountManagerTable = () => {
  const {
    data: accountCodes,
    isLoading: accountCodesIsLoading,
    isError: accountCodesIsError,
    error: accountCodesError
  } = useGetAllAccountCodes();
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [clickedAccountCode, setClickedAccountCode] = useState<AccountCode>();
  const [accountCodeToDelete, setAccountCodeToDelete] = useState<AccountCode | undefined>(undefined);

  if (!accountCodes || accountCodesIsLoading) {
    return <LoadingIndicator />;
  }

  if (accountCodesIsError) {
    return <ErrorPage message={accountCodesError.message} />;
  }

  const uniqueIndexCodeNames = (accountCode: AccountCode) => {
    const uniqueNames = new Set(accountCode.indexCodes.map((indexCode) => indexCode.name));
    return Array.from(uniqueNames).join(', ');
  };

  const accountManagerTableRows = accountCodes.map((accountCode, index) => (
    <TableRow
      onClick={() => {
        setClickedAccountCode(accountCode);
      }}
      key={`account-code-${index}`}
      sx={{ cursor: 'pointer' }}
    >
      <TableCell sx={{ borderBottom: index === accountCodes.length - 1 ? 'none' : 'default' }}>
        <Typography>{uniqueIndexCodeNames(accountCode)}</Typography>
      </TableCell>
      <TableCell sx={{ borderBottom: index === accountCodes.length - 1 ? 'none' : 'default' }}>
        <Typography>{accountCode.code}</Typography>
      </TableCell>
      <TableCell sx={{ borderBottom: index === accountCodes.length - 1 ? 'none' : 'default' }}>
        <Typography>{accountCode.name}</Typography>
      </TableCell>
      <TableCell sx={{ borderBottom: index === accountCodes.length - 1 ? 'none' : 'default' }}>
        <Typography>{accountCode.amount ? `$${centsToDollar(accountCode.amount)}` : ''}</Typography>
      </TableCell>
      <TableCell sx={{ borderBottom: index === accountCodes.length - 1 ? 'none' : 'default' }}>
        <Checkbox checked={accountCode.allowed} />
      </TableCell>
      <TableCell sx={{ borderBottom: index === accountCodes.length - 1 ? 'none' : 'default' }}>
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            setAccountCodeToDelete(accountCode);
          }}
          aria-label="delete"
        >
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  ));

  const columns = ['Index Code', 'Account Code', 'Description', 'Amount', 'Allowed', 'Actions'];

  return (
    <Box>
      {accountCodeToDelete && (
        <DeleteAccountCodeModal
          handleClose={() => {
            setAccountCodeToDelete(undefined);
          }}
          accountCode={accountCodeToDelete}
        />
      )}
      <Box sx={{ display: 'flex', justifyContent: 'left', marginTop: '20px', paddingBottom: '20px' }}>
        <Typography variant="h5" gutterBottom color="white" paddingRight={'20px'}>
          Account Manager
        </Typography>
        <NERButton
          style={{ color: 'white' }}
          variant="contained"
          onClick={() => {
            setShowCreateModal(true);
          }}
        >
          Add Account
        </NERButton>
      </Box>
      <CreateAccountCodeModal showModal={showCreateModal} handleClose={() => setShowCreateModal(false)} />
      {clickedAccountCode && (
        <EditAccountCodeModal
          showModal={!!clickedAccountCode}
          handleClose={() => {
            setClickedAccountCode(undefined);
          }}
          accountCode={clickedAccountCode}
        />
      )}
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column, index) => (
              <TableCell
                key={`account-code-column-${index}`}
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
        <TableBody>{accountManagerTableRows} </TableBody>
      </Table>
    </Box>
  );
};

export default AccountManagerTable;
