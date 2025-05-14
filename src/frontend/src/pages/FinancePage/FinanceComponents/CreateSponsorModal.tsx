import { useForm } from 'react-hook-form';
import LoadingIndicator from '../../../components/LoadingIndicator';
import NERFormModal from '../../../components/NERFormModal';
import { EditSponsorPayload, useCreateSponsor } from '../../../hooks/finance.hooks';
import ErrorPage from '../../ErrorPage';
import sponsorSchema, { SponsorForm } from './SponsorForm';
import { yupResolver } from '@hookform/resolvers/yup';
import { useToast } from '../../../hooks/toasts.hooks';

interface CreateSponsorModalProps {
  showModal: boolean;
  handleClose: () => void;
}

const CreateSponsorModal = ({ showModal, handleClose }: CreateSponsorModalProps) => {
  const toast = useToast();
  const { isLoading, isError, error, mutateAsync } = useCreateSponsor();
  const { handleSubmit, reset } = useForm({
    resolver: yupResolver(sponsorSchema),
    defaultValues: {
      name: '',
      sponsorStatus: false,
      sponsorValue: 0,
      sponsorJoinDate: new Date(),
      sponsorActiveYears: [],
      taxExempt: false,
      discountCode: '',
      sponsorTasks: [],
      sponsorTierId: ''
    }
  });
  const onFormSubmit = async (data: any) => {
    try {
      const transformedData: EditSponsorPayload = {
        ...data,
        sponsorTasks: data.notesOnSponsor.map((note: any) => ({
          dueDate: new Date(note.dueDate),
          notifyDate: note.notifyDate ? new Date(note.notifyDate) : undefined,
          assigneeUserId: note.assigneeUserId,
          notes: note.notes
        }))
      };

      await mutateAsync(transformedData);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };
  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return (
    <NERFormModal
      open={showModal}
      onHide={handleClose}
      title={'Create Sponsor'}
      reset={() => reset()}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onFormSubmit}
      formId={'create-sponsor-form'}
      showCloseButton
    >
      <SponsorForm />
    </NERFormModal>
  );
};

export default CreateSponsorModal;
