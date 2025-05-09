import { yupResolver } from '@hookform/resolvers/yup';
import { FormControl, FormLabel } from '@mui/material';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import LoadingIndicator from '../../../components/LoadingIndicator';
import NERFormModal from '../../../components/NERFormModal';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { useToast } from '../../../hooks/toasts.hooks';
import { ReimbursementRequestComment } from 'shared';
import { UseMutateAsyncFunction } from 'react-query';
import { useCurrentUser } from '../../../hooks/users.hooks';

const schema = yup.object().shape({
  comment: yup.string().required('Comment is required')
});

interface CreateRRCommentModalProps {
  showModal: boolean;
  handleClose: () => void;
  mutateAsync: UseMutateAsyncFunction<
    ReimbursementRequestComment,
    Error,
    {
      dateCreated: Date;
      comment: string;
      reimbursementRequestId: string;
    },
    unknown
  >;
  isLoading: boolean;
  defaultValues?: CreateRRCommentModalInputs;
  title: string;
}

export interface CreateRRCommentModalInputs {
  comment: string;
}

const CreateRRCommentModal: React.FC<CreateRRCommentModalProps> = ({
  showModal: modalShow,
  handleClose,
  mutateAsync,
  defaultValues,
  isLoading,
  title
}: CreateRRCommentModalProps) => {
  const toast = useToast();

  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
    watch,
    reset
  } = useForm<CreateRRCommentModalInputs>({
    resolver: yupResolver(schema),
    defaultValues: defaultValues ?? {
      comment: ''
    },
    mode: 'onChange'
  });

  const user = useCurrentUser();

  const handleConfirm = async (data: { comment: string; reimbursementRequestId: string }) => {
    try {
      await mutateAsync({
        comment: `@${user.firstName}${user.lastName} followed up: "${data.comment}`,
        dateCreated: new Date(),
        reimbursementRequestId: data.reimbursementRequestId
      });
      toast.success('Comment added successfully');
      handleClose();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <NERFormModal
      open={modalShow}
      onHide={handleClose}
      title={title}
      reset={reset}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={handleConfirm}
      formId="comment-form"
      disabled={!isValid || (defaultValues && defaultValues.comment === watch('comment'))}
    >
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <FormControl>
          <FormLabel>Comment</FormLabel>
          <ReactHookTextField name="comment" control={control} sx={{ width: 1 }} errorMessage={errors.comment} />
        </FormControl>
      )}
    </NERFormModal>
  );
};

export default CreateRRCommentModal;
