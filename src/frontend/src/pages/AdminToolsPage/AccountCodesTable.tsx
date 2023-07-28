import {
  TableRow,
  TableCell,
  Checkbox,
  Grid,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  Typography
} from '@mui/material';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useGetAllExpenseTypes } from '../../hooks/finance.hooks';
import ErrorPage from '../ErrorPage';
import { NERButton } from '../../components/NERButton';
import { useState } from 'react';
import NewAccountCodeView from './NewAccountCodeView';
import NewAccountCode from './NewAccountCode';

const AccountCodesTable = () => {
  const {
    data: expenseTypes,
    isLoading: expenseTypesIsLoading,
    isError: expenseTypesIsError,
    error: expenseTypesError
  } = useGetAllExpenseTypes();
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const handleModalClose = () => setShowCreateModal(false);

  if (!expenseTypes || expenseTypesIsLoading) {
    return <LoadingIndicator />;
  }

  if (expenseTypesIsError) {
    return <ErrorPage message={expenseTypesError.message} />;
  }

  const accountCodesTableRows = expenseTypes.map((expenseType) => (
    <TableRow>
      <TableCell sx={{ border: '2px solid black' }}>{expenseType.name}</TableCell>
      <TableCell sx={{ border: '2px solid black' }}>{expenseType.code}</TableCell>
      <TableCell align="center" sx={{ border: '2px solid black' }}>
        <Checkbox defaultChecked={expenseType.allowed} disabled />
      </TableCell>
    </TableRow>
  ));

  return (
    <>
      <Grid item direction="column" alignSelf="right" xs={6}>
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
                width="50%"
              >
                Account Name
              </TableCell>
              <TableCell
                align="left"
                sx={{ fontSize: '16px', fontWeight: 600, border: '2px solid black' }}
                itemType="date"
                width="30%"
              >
                Account Code
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontSize: '16px', fontWeight: 600, border: '2px solid black' }}
                itemType="date"
                width="20%"
              >
                Allowed
              </TableCell>
            </TableHead>
            <TableBody>{accountCodesTableRows}</TableBody>
          </Table>
        </TableContainer>
        <NERButton
          variant="contained"
          onClick={() => {
            setShowCreateModal(true);
          }}
        >
          New Account Code
        </NERButton>
      </Grid>
      {showCreateModal && <NewAccountCode showModal={showCreateModal} handleClose={handleModalClose} />}
    </>
  );
};

export default AccountCodesTable;
