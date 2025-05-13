import { useState } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import ErrorPage from '../../../ErrorPage';
import { NERButton } from '../../../../components/NERButton';
import CreatePartReviewFAQModal from './CreatePartReviewFAQModal';
import EditPartReviewFAQModal from './EditPartReviewFAQModal';
import NERDeleteModal from '../../../../components/NERDeleteModal';
import { useAllPartReviewFaqs, useDeletePartReviewFaq } from '../../../../hooks/part-review.hooks';
import { useToast } from '../../../../hooks/toasts.hooks';
import { FrequentlyAskedQuestion } from 'shared';
import { useQueryClient } from 'react-query';

const PartsReviewFAQTable: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FrequentlyAskedQuestion | null>(null);
  const [deletingFaqId, setDeletingFaqId] = useState<string | null>(null);

  const { data: faqs, isLoading, isError, error } = useAllPartReviewFaqs();
  const { mutateAsync: deleteFaq } = useDeletePartReviewFaq();
  const toast = useToast();

  const queryClient = useQueryClient();

  const handleDelete = async (faqId: string) => {
    try {
      await deleteFaq(faqId);
      await queryClient.invalidateQueries(['partReviewFaqs']);
      await queryClient.refetchQueries(['partReviewFaqs']);
      toast.success('FAQ deleted successfully');
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    } finally {
      setDeletingFaqId(null);
    }
  };

  if (isLoading) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

  const faqRows = (faqs ?? []).map((faq) => (
    <Box
      key={faq.faqId}
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px',
        borderRadius: '8px',
        backgroundColor: '#333333',
        marginBottom: '8px'
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', gap: '4px' }}>
          <strong>Q:</strong>
          {faq.question}
        </Box>
        <Box sx={{ display: 'flex', gap: '6px' }}>
          <strong>A:</strong>
          {faq.answer}
        </Box>
      </Box>
      <Box sx={{ display: 'flex', gap: '8px' }}>
        <IconButton
          onClick={() => {
            setEditingFaq(faq);
          }}
        >
          <EditIcon />
        </IconButton>
        <IconButton
          onClick={() => {
            setDeletingFaqId(faq.faqId);
          }}
        >
          <DeleteIcon />
        </IconButton>
      </Box>
    </Box>
  ));

  return (
    <Box>
      {/* Modals */}
      <CreatePartReviewFAQModal
        key={showCreateModal ? 'create-modal-open' : 'create-modal-closed'}
        open={showCreateModal}
        handleClose={() => setShowCreateModal(false)}
      />
      {editingFaq && (
        <EditPartReviewFAQModal
          key={`edit-modal-${editingFaq.faqId}`}
          open={!!editingFaq}
          faq={editingFaq}
          handleClose={() => setEditingFaq(null)}
        />
      )}
      <NERDeleteModal
        open={!!deletingFaqId}
        onHide={() => setDeletingFaqId(null)}
        dataType="FAQ"
        onFormSubmit={() => deletingFaqId && handleDelete(deletingFaqId)}
      />

      <Typography variant="h6">FAQs</Typography>
      <Box
        sx={{
          maxHeight: '30vh',
          maxWidth: '100%',
          overflowY: 'scroll',
          paddingBottom: '8px',
          paddingRight: '8px',
          borderRadius: '8px',
          '&::-webkit-scrollbar': {
            width: '8px'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#c44546',
            borderRadius: '4px'
          }
        }}
      >
        {faqRows}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'right', marginTop: '10px' }}>
        <NERButton
          variant="contained"
          onClick={() => setShowCreateModal(true)}
          sx={{ minWidth: '110px' }}
          disabled={!!deletingFaqId}
        >
          New FAQ
        </NERButton>
      </Box>
    </Box>
  );
};

export default PartsReviewFAQTable;
