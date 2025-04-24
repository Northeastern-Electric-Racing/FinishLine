import { TableRow, TableCell, Typography, Box, TableHead, Table, TableBody, Checkbox } from '@mui/material';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useGetAllAccountCodes } from '../../../hooks/finance.hooks';
import ErrorPage from '../../ErrorPage';
import React, { useState } from 'react';
import { AccountCode } from 'shared';
import CreateAccountCodeModal from './CreateAccountCodeModal';
import EditAccountCodeModal from './EditAccountCodeModal';
import { NERButton } from '../../../components/NERButton';

const AccountManagerTable = () => {
  const {
    data: accountCodes,
    isLoading: accountCodesIsLoading,
    isError: accountCodesIsError,
    error: accountCodesError
  } = useGetAllAccountCodes();
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [clickedAccountCode, setClickedAccountCode] = useState<AccountCode>();

  if (!accountCodes || accountCodesIsLoading) {
    return <LoadingIndicator />;
  }

  if (accountCodesIsError) {
    return <ErrorPage message={accountCodesError.message} />;
  }

  const uniqueIndexCodeNames = (accountCode: AccountCode) => {
    const uniqueNames = new Set();

    accountCode.indexCodes.forEach((indexCode) => uniqueNames.add(indexCode.name));
    return Array.from(uniqueNames).join(', ');
  };

  const accountManagerTableRows = accountCodes.map((accountCode, index) => (
    <TableRow
      onClick={() => {
        setClickedAccountCode(accountCode);
        setShowEditModal(true);
      }}
      key={`account-code-${index}`}
      sx={{ cursor: 'pointer' }}
    >
      <TableCell>
        <Typography>{uniqueIndexCodeNames(accountCode)}</Typography>
      </TableCell>
      <TableCell>
        <Typography>{accountCode.code}</Typography>
      </TableCell>
      <TableCell>
        <Typography>{accountCode.name}</Typography>
      </TableCell>
      <TableCell>
        <Checkbox checked={accountCode.allowed} />
      </TableCell>
    </TableRow>
  ));

  const columns = ['Index Code', 'Account Code', 'Description', 'Allowed'];

  return (
    <Box>
      <CreateAccountCodeModal showModal={showCreateModal} handleClose={() => setShowCreateModal(false)} />
      {clickedAccountCode && (
        <EditAccountCodeModal
          showModal={showEditModal}
          handleClose={() => {
            setShowEditModal(false);
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
                  borderBottom: '2px solid white',
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
      <Box sx={{ display: 'flex', justifyContent: 'right', marginTop: '10px' }}>
        <NERButton
          variant="contained"
          onClick={() => {
            setShowCreateModal(true);
          }}
        >
          Add Account
        </NERButton>
      </Box>
    </Box>
  );
};

export default AccountManagerTable;
