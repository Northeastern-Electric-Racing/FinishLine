import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useCreateFaq } from '../../../hooks/recruitment.hooks';
import React from 'react';
import FaqFormModal from './FaqFormModal';

interface CreateFaqFormModalProps {
  open: boolean;
  handleClose: () => void;
}

const CreateFaqFormModal = ({ open, handleClose }: CreateFaqFormModalProps) => {
  const { isLoading, isError, error, mutateAsync } = useCreateFaq();

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return <FaqFormModal open={open} handleClose={handleClose} onSubmit={mutateAsync} />;
};

export default CreateFaqFormModal;
