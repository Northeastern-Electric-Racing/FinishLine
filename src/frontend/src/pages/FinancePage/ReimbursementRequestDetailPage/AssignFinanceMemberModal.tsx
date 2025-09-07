import { yupResolver } from '@hookform/resolvers/yup';
import { Autocomplete, FormControl, FormLabel, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import NERFormModal from '../../../components/NERFormModal';
import { useAssignMemberToRR } from '../../../hooks/finance.hooks';
import { useToast } from '../../../hooks/toasts.hooks';
import { ReimbursementRequest } from 'shared';
import { useState } from 'react';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useAllUsers } from '../../../hooks/users.hooks';

const schema = yup.object().shape({
  assigneeId: yup.string().required()
});

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

  if (usersIsError) return <ErrorPage message={usersError?.message} />;
  if (usersLoading || !users) return <LoadingIndicator />;

  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
    reset
  } = useForm<{ assigneeId: string }>({
    resolver: yupResolver(schema),
    mode: 'onChange'
  });

  const onSubmit = async (data: { assigneeId: string }) => {
    try {
      await assignMember(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
    onHide();
  };

  return (
    <NERFormModal
      open={modalShow}
      onHide={onHide}
      title="Add SABO Number"
      reset={reset}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      disabled={!isValid}
      formId="add-sabo-number"
      paperProps={{
        width: '100%'
      }}
    >
      <FormControl fullWidth>
        <FormLabel>Assignees</FormLabel>
        <Autocomplete
          options={users}
          getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
          value={users.find((user) => user.userId == userId)}
          onChange={(_event, value) => {
            setUserId(value?.userId);
          }}
          renderInput={(params) => <TextField {...params} variant="outlined" placeholder="Select User(s)" error={false} />}
        />
      </FormControl>
    </NERFormModal>
  );
};

export default AssignFinanceMemberModal;
