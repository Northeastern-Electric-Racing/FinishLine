import { Box, IconButton, Typography, Paper } from '@mui/material';
import { Star, StarBorder, Edit, Delete } from '@mui/icons-material';
import { NERButton } from '../../../components/NERButton';
import CreateCommonMistakesModal from './CreateCommonMistakeModal';
import EditCommonMistakeModal from './EditCommonMistakeModal';
import { useState } from 'react';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import type { PartReviewCommonMistake } from 'shared';
import {
  useCommonMistakes,
  useDeletePartReviewCommonMistake,
  useEditPartReviewCommonMistakes
} from '../../../hooks/part-review.hooks';

const CommonMistakesTable: React.FC = () => {
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [editingMistake, setEditingMistake] = useState<PartReviewCommonMistake | null>(null);

  const { data, isLoading, isError, error } = useCommonMistakes();
  const deleteCommonMistake = useDeletePartReviewCommonMistake();
  const editCommonMistake = useEditPartReviewCommonMistakes();

  const handleEdit = (mistake: PartReviewCommonMistake) => {
    setEditingMistake(mistake);
  };

  const handleCreate = () => {
    setEditingMistake(null);
    setOpenCreateModal(true);
  };

  if (!data || isLoading) {
    return <LoadingIndicator />;
  }
  if (isError) {
    return <ErrorPage message={error?.message} />;
  }

  const handleToggleStar = async (mistake: PartReviewCommonMistake) => {
    try {
      await editCommonMistake.mutateAsync({
        commonMistakeId: mistake.partReviewCommonMistakeId,
        payload: {
          title: mistake.title,
          description: mistake.description,
          starred: !mistake.starred
        }
      });
    } catch (err) {
      console.error('Failed to toggle star:', err);
    }
  };

  const handleDelete = async (mistake: PartReviewCommonMistake): Promise<void> => {
    if (window.confirm(`Are you sure you want to delete the mistake: "${mistake.title}"?`)) {
      try {
        await deleteCommonMistake.mutateAsync(mistake.partReviewCommonMistakeId);
        alert('Mistake deleted successfully.');
      } catch (error) {
        console.error('Failed to delete the mistake:', error);
        alert('An error occurred while deleting the mistake. Please try again.');
      }
    }
  };

  return (
    <Box>
      <CreateCommonMistakesModal showModal={openCreateModal} handleClose={() => setOpenCreateModal(false)} />

      {editingMistake && (
        <EditCommonMistakeModal
          showModal={!!editingMistake}
          handleClose={() => setEditingMistake(null)}
          mistake={editingMistake}
        />
      )}

      <Typography variant="subtitle1" fontWeight="bold">
        Common Mistakes
      </Typography>

      {data &&
        data.map((mistake) => (
          <Paper
            key={mistake.partReviewCommonMistakeId}
            elevation={2}
            sx={{
              backgroundColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              padding: 2,
              marginBottom: 1,
              borderRadius: 2
            }}
          >
            <Box sx={{ marginRight: 1 }}>
              <IconButton onClick={() => handleToggleStar(mistake)}>
                {mistake.starred ? <Star sx={{ color: '#fbc02d' }} /> : <StarBorder sx={{ color: 'gray' }} />}
              </IconButton>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {mistake.title}
              </Typography>
              <Typography variant="body2">{mistake.description}</Typography>
            </Box>
            <Box>
              <IconButton sx={{ color: 'dark-gray' }} onClick={() => handleEdit(mistake)}>
                <Edit />
              </IconButton>
            </Box>
            <Box>
              <IconButton sx={{ color: 'dark-gray' }} onClick={() => handleDelete(mistake)}>
                <Delete />
              </IconButton>
            </Box>
          </Paper>
        ))}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
        <NERButton variant="contained" onClick={handleCreate}>
          New Common Mistake
        </NERButton>
      </Box>
    </Box>
  );
};

export default CommonMistakesTable;
