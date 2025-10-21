import { Autocomplete, FormControl, FormLabel, TextField } from '@mui/material';
import { useAssignMemberToRR } from '../../../hooks/finance.hooks';
import { useToast } from '../../../hooks/toasts.hooks';
import { ReimbursementRequest } from 'shared';
import { useEffect, useState } from 'react';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useAllUsers } from '../../../hooks/users.hooks';
import NERModal from '../../../components/NERModal';

interface AssignFinanceMemberModalProps {
  modalShow: boolean;
  onHide: () => void;
  reimbursementRequest: ReimbursementRequest;
}

const AssignFinanceMemberModal = ({ modalShow, onHide, reimbursementRequest }: AssignFinanceMemberModalProps) => {
  const toast = useToast();
  const { mutateAsync: assignMember } = useAssignMemberToRR(reimbursementRequest.reimbursementRequestId);
  const { data: users, isLoading: usersLoading, isError: usersIsError, error: usersError } = useAllUsers();

  const [userId, setUserId] = useState<string>();

  useEffect(() => {
    if (reimbursementRequest.assignee) {
      setUserId(reimbursementRequest.assignee.userId);
    }
  }, [reimbursementRequest]);

  if (usersIsError) return <ErrorPage message={usersError?.message} />;
  if (usersLoading || !users) return <LoadingIndicator />;

  const onSubmit = async () => {
    try {
      if (!userId) {
        throw new Error('Must select a user to assign');
      }
      await assignMember({ assigneeId: userId });
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
    onHide();
  };

  return (
    <NERModal
      open={modalShow}
      onHide={onHide}
      title={`Assign user to Reimbursement Request #${reimbursementRequest.identifier}`}
      onSubmit={onSubmit}
      disabled={!userId}
      submitText="Submit"
    >
      <FormControl fullWidth>
        <FormLabel>Assignee</FormLabel>
        <Autocomplete
          options={users}
          getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
          value={users.find((user) => user.userId === userId)}
          onChange={(_event, value) => {
            setUserId(value?.userId);
          }}
          renderInput={(params) => <TextField {...params} variant="outlined" placeholder="Select User" error={false} />}
        />
      </FormControl>
    </NERModal>
  );
};

export default AssignFinanceMemberModal;
