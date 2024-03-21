import { TableRow, TableCell, Typography, Box, IconButton } from '@mui/material';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useGetAllExpenseTypes } from '../../../hooks/finance.hooks';
import ErrorPage from '../../ErrorPage';
import { NERButton } from '../../../components/NERButton';
import { useState } from 'react';
import { ExpenseType } from 'shared';
import CreateAccountCodeModal from './CreateAccountCodeModal';
import EditAccountCodeModal from './EditAccountCodeModal';
import AdminToolTable from '../AdminToolTable';
import { codeAndRefundSourceName } from '../../../utils/pipes';
import DeleteIcon from '@mui/icons-material/Delete';
import NERModal from '../../../components/NERModal';

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
  const [showDeleteAccountCodeModal, setShowDeleteAccountCodeModal] = useState(false);

  if (!expenseTypes || expenseTypesIsLoading) {
    return <LoadingIndicator />;
  }

  if (expenseTypesIsError) {
    return <ErrorPage message={expenseTypesError.message} />;
  }

  const handleDeleteAccountCode = () => {};

  const DeleteAccountCodeModal = () => {
    return (
      <NERModal
        open={showDeleteAccountCodeModal}
        onHide={() => setShowDeleteAccountCodeModal(false)}
        title="Warning!"
        cancelText="No"
        submitText="Yes"
        onSubmit={handleDeleteAccountCode}
      >
        <Typography>Are you sure you want to delete this account code?</Typography>
      </NERModal>
    );
  };

  const accountCodesTableRows = expenseTypes.map((expenseType, index) => (
    <TableRow
      key={`account-code-${index}`}
      onClick={() => {
        setClickedAccountCode(expenseType);
      }}
      sx={{ cursor: 'pointer' }}
    >
      <TableCell
        onClick={() => {
          setShowEditModal(true);
        }}
        sx={{ border: '2px solid black' }}
      >
        {expenseType.name}
      </TableCell>
      <TableCell
        onClick={() => {
          setShowEditModal(true);
        }}
        sx={{ border: '2px solid black' }}
      >
        {expenseType.code}
      </TableCell>
      <TableCell
        align="left"
        onClick={() => {
          setShowEditModal(true);
        }}
        sx={{ border: '2px solid black' }}
      >
        <Typography>{expenseType.allowed ? 'Yes' : 'No'}</Typography>
      </TableCell>
      <TableCell
        align="left"
        onClick={() => {
          setShowEditModal(true);
        }}
        sx={{ border: '2px solid black' }}
      >
        {expenseType.allowedRefundSources.map((refundSource, idx) => (
          <Typography key={`account-code-refund-source-${index}-${idx}`}>{codeAndRefundSourceName(refundSource)}</Typography>
        ))}
      </TableCell>
      <TableCell align="left" sx={{ border: '2px solid black' }}>
        <IconButton
          type="button"
          sx={{
            mx: 1,
            color: 'red',
            marginLeft: '15px',
            marginTop: '3px',
            borderRadius: '4px',
            outline: 'solid'
          }}
          onClick={() => {
            setShowDeleteAccountCodeModal(true);
          }}
        >
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  ));

  return (
    <Box>
      <CreateAccountCodeModal showModal={showCreateModal} handleClose={() => setShowCreateModal(false)} />
      <DeleteAccountCodeModal />
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
      <AdminToolTable
        columns={[
          { name: 'Account Name', width: '25%' },
          { name: 'Account Code', width: '25%' },
          { name: 'Allowed', width: '15%' },
          { name: 'Allowed Refund Sources', width: '35%' }
        ]}
        rows={accountCodesTableRows}
      />
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
