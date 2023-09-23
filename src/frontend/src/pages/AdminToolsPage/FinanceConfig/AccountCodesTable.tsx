import { TableRow, TableCell, Paper, Table, TableBody, TableContainer, TableHead, Typography, Box } from '@mui/material';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useGetAllExpenseTypes } from '../../../hooks/finance.hooks';
import ErrorPage from '../../ErrorPage';
import { NERButton } from '../../../components/NERButton';
import { useState } from 'react';
import { ExpenseType } from 'shared';
import CreateAccountCodeModal from './CreateAccountCodeModal';
import EditAccountCodeModal from './EditAccountCodeModal';

const AccountCodesTable = () => {
  const {
    data: expenseTypes,
    isLoading: expenseTypesIsLoading,
    isError: expenseTypesIsError,
    error: expenseTypesError
  } = useGetAllExpenseTypes();
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [clickedAccountCode, setClickedAccountCode] = useState<ExpenseType>();

  if (!expenseTypes || expenseTypesIsLoading) {
    return <LoadingIndicator />;
  }

  if (expenseTypesIsError) {
    return <ErrorPage message={expenseTypesError.message} />;
  }

  const accountCodesTableRows = expenseTypes.map((expenseType) => (
    <TableRow
      onClick={() => {
        setClickedAccountCode(expenseType);
        setShowEditModal(true);
      }}
      sx={{ cursor: 'pointer' }}
    >
      <TableCell sx={{ border: '2px solid black' }}>{expenseType.name}</TableCell>
      <TableCell sx={{ border: '2px solid black' }}>{expenseType.code}</TableCell>
      <TableCell align="center" sx={{ border: '2px solid black' }}>
        <Typography>{expenseType.allowed ? 'Yes' : 'No'}</Typography>
      </TableCell>
      <TableCell align="center" sx={{ border: '2px solid black' }}>
        <Typography>
          {expenseType.allowedRefundSources.map((source) => {
            return source === 'CASH' ? 'CASH ' : 'BUDGET ';
          })}
        </Typography>
      </TableCell>
    </TableRow>
  ));

  return (
    <Box>
      <CreateAccountCodeModal showModal={showCreateModal} handleClose={() => setShowCreateModal(false)} />
      {clickedAccountCode && (
        <EditAccountCodeModal
          showModal={showEditModal}
          handleClose={() => setShowEditModal(false)}
          accountCode={clickedAccountCode}
        />
      )}
      <Typography variant="subtitle1" textAlign="left">
        Account Codes
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableCell
              align="left"
              sx={{ fontSize: '16px', fontWeight: 600, border: '2px solid black' }}
              itemType="date"
              width="25%"
            >
              Account Name
            </TableCell>
            <TableCell
              align="left"
              sx={{ fontSize: '16px', fontWeight: 600, border: '2px solid black' }}
              itemType="date"
              width="25%"
            >
              Account Code
            </TableCell>
            <TableCell
              align="center"
              sx={{ fontSize: '16px', fontWeight: 600, border: '2px solid black' }}
              itemType="date"
              width="15%"
            >
              Allowed
            </TableCell>
            <TableCell
              align="center"
              sx={{ fontSize: '16px', fontWeight: 600, border: '2px solid black' }}
              itemType="date"
              width="35%"
            >
              Allowed Refund Sources
            </TableCell>
          </TableHead>
          <TableBody>{accountCodesTableRows}</TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: 'flex', justifyContent: 'right', marginTop: '10px' }}>
        <NERButton
          variant="contained"
          onClick={() => {
            setShowCreateModal(true);
          }}
        >
          New Account Code
        </NERButton>
      </Box>
    </Box>
  );
};

export default AccountCodesTable;
