import NERModal from '../../../components/NERModal';
import { Grid, Typography } from '@mui/material';
import { useApproveReimbursementRequest } from '../../../hooks/finance.hooks';
import { ReimbursementRequest } from 'shared';
import { useUserSecureSettings } from '../../../hooks/users.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';

interface SubmitToSaboModalProps {
  open: boolean;
  setOpen: (val: boolean) => void;
  reimbursementRequest: ReimbursementRequest;
}

const SubmitToSaboModal = ({ open, setOpen, reimbursementRequest }: SubmitToSaboModalProps) => {
  const { mutateAsync: submitToSabo } = useApproveReimbursementRequest(reimbursementRequest.reimbursementRequestId);
  const { recipient } = reimbursementRequest;
  const { data: userInfo, isLoading, isError, error } = useUserSecureSettings(recipient.userId);

  if (isLoading || !userInfo) return <LoadingIndicator />;
  if (isError) return <ErrorPage error={error} message={error.message} />;

  const handleSubmitToSabo = () => {
    submitToSabo();
    setOpen(false);
  };

  return (
    <NERModal
      open={open}
      onHide={() => setOpen(false)}
      title="Input these fields into the Sabo Form"
      cancelText="Cancel"
      submitText="Submit to Sabo"
      onSubmit={() => handleSubmitToSabo()}
    >
      <Grid container>
        <Grid item xs={3}>
          <Typography>First Name</Typography>
        </Grid>
        <Grid item xs={3}>
          Last Name
        </Grid>
        <Grid item xs={3}>
          NUID
        </Grid>
        <Grid item xs={3}>
          Email
        </Grid>
        <Grid item xs={3}>
          Phone #
        </Grid>
        <Grid item xs={3}>
          Street Address
        </Grid>
        <Grid item xs={3}>
          City
        </Grid>
        <Grid item xs={3}>
          State
        </Grid>
        <Grid item xs={3}>
          Zip Code
        </Grid>
        <Grid item xs={3}>
          Date of Expense
        </Grid>
        <Grid item xs={3}>
          Total Expenses
        </Grid>
        <Grid item xs={3}>
          Expense Description: Purchased From[Total Cost]
        </Grid>
        <Grid item xs={3}>
          Business Purpose: the list of WBS#s provided in the Products table
        </Grid>
        <Grid item xs={3}>
          SABO Form Index: 800462
        </Grid>
        <Grid item xs={3}>
          Expense Type: Account Code, Title
        </Grid>
      </Grid>
      Receipts
    </NERModal>
  );
};

export default SubmitToSaboModal;
