import ErrorPage from '../../../ErrorPage';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import { useCreateNewMemberFaq } from '../../../../hooks/recruitment.hooks';
import React from 'react';
import FaqFormModal from '../../RecruitmentConfig/FaqFormModal';

interface CreateNewMemberFaqFormModalProps {
  open: boolean;
  handleClose: () => void;
}

const CreateNewMemberFaqFormModal = ({ open, handleClose }: CreateNewMemberFaqFormModalProps) => {
  const { isLoading, isError, error, mutateAsync } = useCreateNewMemberFaq();

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return <FaqFormModal open={open} handleClose={handleClose} onSubmit={mutateAsync} />;
};

export default CreateNewMemberFaqFormModal;
