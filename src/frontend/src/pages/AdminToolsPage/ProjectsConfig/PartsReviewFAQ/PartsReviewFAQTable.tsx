import { Box, Typography, IconButton, Stack, Paper } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAllPartReviewFaqs, useDeletePartReviewFaq } from '../../../../hooks/part-review.hooks';
import CreatePartReviewFAQModal from './CreatePartReviewFAQModal';
import EditPartReviewFAQModal from './EditPartReviewFAQModal';
import NERDeleteModal from '../../../../components/NERDeleteModal';
import { useToast } from '../../../../hooks/toasts.hooks';
import { FrequentlyAskedQuestion } from 'shared';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import ErrorPage from '../../../ErrorPage';
import { NERButton } from '../../../../components/NERButton';
import { useState } from 'react';

const PartsReviewFAQTable = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FrequentlyAskedQuestion | null>(null);
  const [faqToDelete, setFaqToDelete] = useState<FrequentlyAskedQuestion | null>(null);
  const { data: faqs, isLoading, isError, error } = useAllPartReviewFaqs();
  const { mutateAsync: deleteFaq } = useDeletePartReviewFaq();
  const toast = useToast();

  const handleDelete = async (faqId: string) => {
    try {
      await deleteFaq(faqId);
      toast.success('FAQ deleted');
    } catch (e) {
      if (e instanceof Error) toast.error(e.message);
    }
    setFaqToDelete(null);
  };

  if (isLoading) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={(error as Error).message} />;

  return (
    <Box>
      <CreatePartReviewFAQModal open={showCreateModal} handleClose={() => setShowCreateModal(false)} />
      {editingFaq && <EditPartReviewFAQModal faq={editingFaq} handleClose={() => setEditingFaq(null)} open={!!editingFaq} />}
      <NERDeleteModal
        open={!!faqToDelete}
        onHide={() => setFaqToDelete(null)}
        dataType="FAQ"
        onFormSubmit={() => faqToDelete && handleDelete(faqToDelete.faqId)}
      />

      <Typography variant="subtitle1" sx={{ marginBottom: 1 }}>
        Registered Part Review FAQs
      </Typography>

      <Stack spacing={2}>
        {faqs?.map((faq) => (
          <Paper
            key={faq.faqId}
            sx={{
              backgroundColor: '#2c2c2c',
              padding: 2,
              borderRadius: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Box>
              <Typography sx={{ fontWeight: 'bold' }}>Q: {faq.question}</Typography>
              <Typography>A: {faq.answer}</Typography>
            </Box>
            <Box>
              <IconButton onClick={() => setEditingFaq(faq)} sx={{ color: 'white' }}>
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => setFaqToDelete(faq)} sx={{ color: 'white' }}>
                <DeleteIcon />
              </IconButton>
            </Box>
          </Paper>
        ))}
      </Stack>

      <Box sx={{ display: 'flex', justifyContent: 'right', marginTop: '16px' }}>
        <NERButton variant="contained" onClick={() => setShowCreateModal(true)}>
          New FAQ
        </NERButton>
      </Box>
    </Box>
  );
};

export default PartsReviewFAQTable;
