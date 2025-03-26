import { Box, IconButton, Typography, Paper } from '@mui/material';
import { Star, StarBorder, Edit } from '@mui/icons-material';
import { NERButton } from '../../../components/NERButton';
import CreateCommonMistakesModal from './CreateCommonMistakeModal';
import EditCommonMistakeModal from './EditCommonMistakeModal';
import { useState } from 'react';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import type { PartReviewCommonMistake } from 'shared';
import { useCommonMistakes } from '../../../hooks/part-review.hooks';

const CommonMistakesTable: React.FC = () => {
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [editingMistake, setEditingMistake] = useState<PartReviewCommonMistake | null>(null);

  const { data, isLoading, isError, error } = useCommonMistakes()

  const handleEdit = (mistake: PartReviewCommonMistake) => {
    setEditingMistake(mistake);
  };

  const handleCreate = () => {
    setEditingMistake(null);
    setOpenCreateModal(true);
  };

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading || !data) return <LoadingIndicator />;

  return (
    <Box sx={{ padding: 2 }}>
      <CreateCommonMistakesModal showModal={openCreateModal} handleClose={() => setOpenCreateModal(false)} />

      {editingMistake && (
        <EditCommonMistakeModal
          showModal={!!editingMistake}
          handleClose={() => setEditingMistake(null)}
          mistake={editingMistake}
        />
      )}

      <Typography variant="h6" sx={{ marginBottom: 2, color: 'black' }}>
        Common Mistakes
      </Typography>

      {data.map((mistake) => (
        <Paper
          key={mistake.partReviewCommonMistakeId}
          elevation={2}
          sx={{
            backgroundColor: '#1e1e1e',
            display: 'flex',
            alignItems: 'center',
            padding: 2,
            marginBottom: 1,
            borderRadius: 2,
            color: 'white'
          }}
        >
          <Box sx={{ marginRight: 2 }}>
            {mistake.starred ? <Star sx={{ color: '#fbc02d' }} /> : <StarBorder sx={{ color: 'gray' }} />}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {mistake.title}
            </Typography>
            <Typography variant="body2" color="gray">
              {mistake.description}
            </Typography>
          </Box>
          <Box>
            <IconButton sx={{ color: 'white' }} onClick={() => handleEdit(mistake)}>
              <Edit />
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
