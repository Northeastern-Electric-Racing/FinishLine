import { useState } from 'react';
import { TableRow, TableCell, Box, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import LoadingIndicator from '../../../../components/LoadingIndicator';
import ErrorPage from '../../../ErrorPage';
import { NERButton } from '../../../../components/NERButton';
import AdminToolTable from '../../AdminToolTable';

import CreatePartReviewFAQModal from './CreatePartReviewFAQModal';
import EditPartReviewFAQModal from './EditPartReviewFAQModal';
import NERDeleteModal from '../../../../components/NERDeleteModal';

import { useAllPartReviewFaqs, useDeletePartReviewFaq } from '../../../../hooks/part-review.hooks';
import { useToast } from '../../../../hooks/toasts.hooks';
import { FrequentlyAskedQuestion } from 'shared';

const PartsReviewFAQTable: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FrequentlyAskedQuestion | null>(null);
  const [deletingFaqId, setDeletingFaqId] = useState<string | null>(null);

  const { data: faqs, isLoading, isError, error } = useAllPartReviewFaqs();
  const { mutateAsync: deleteFaq } = useDeletePartReviewFaq();
  const toast = useToast();

  const handleDelete = async (faqId: string) => {
    try {
      await deleteFaq(faqId);
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
  if (isError) return <ErrorPage message={error instanceof Error ? error.message : 'Unknown error'} />;

  const faqRows = (faqs ?? []).map((faq) => (
    <TableRow key={faq.faqId}>
      <TableCell sx={{ border: '2px solid black' }}>
        <strong>Q:</strong> {faq.question}
        <br />
        <strong>A:</strong> {faq.answer}
      </TableCell>
      <TableCell align="right" sx={{ border: '2px solid black' }}>
        <IconButton
          onClick={() => setEditingFaq(faq)}
          sx={{ color: 'white' }}
          disabled={!!deletingFaqId}
          aria-label={`Edit FAQ ${faq.question}`}
        >
          <EditIcon />
        </IconButton>
        <IconButton
          onClick={() => setDeletingFaqId(faq.faqId)}
          sx={{ color: 'white' }}
          disabled={!!deletingFaqId}
          aria-label={`Delete FAQ ${faq.question}`}
        >
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
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

      <AdminToolTable
        columns={[
          { name: 'FAQ', width: '85%' },
          { name: 'Actions', width: '15%' }
        ]}
        rows={faqRows}
      />

      <Box sx={{ display: 'flex', justifyContent: 'right', marginTop: '10px' }}>
        <NERButton
          variant="contained"
          onClick={() => setShowCreateModal(true)}
          sx={{ minWidth: '150px' }}
          disabled={!!deletingFaqId}
        >
          New FAQ
        </NERButton>
      </Box>
    </Box>
  );
};

export default PartsReviewFAQTable;