import { Box, IconButton, Typography } from '@mui/material';
import { Star, StarBorder, Edit, Delete } from '@mui/icons-material';
import { NERButton } from '../../../components/NERButton';
import CreateCommonMistakesModal from './CreateCommonMistakeModal';
import EditCommonMistakeModal from './EditCommonMistakeModal';
import NERDeleteModal from '../../../components/NERDeleteModal';
import { useState } from 'react';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useToast } from '../../../hooks/toasts.hooks';
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
  const [mistakeToDelete, setMistakeToDelete] = useState<PartReviewCommonMistake | undefined>(undefined);

  const { data, isLoading, isError, error } = useCommonMistakes();
  const deleteCommonMistake = useDeletePartReviewCommonMistake();
  const editCommonMistake = useEditPartReviewCommonMistakes();
  const toast = useToast();

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
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message, 3000);
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

      <NERDeleteModal
        open={!!mistakeToDelete}
        onHide={() => setMistakeToDelete(undefined)}
        formId="delete-mistake-form"
        dataType="Common Mistake"
        onFormSubmit={async () => {
          if (mistakeToDelete) {
            try {
              await deleteCommonMistake.mutateAsync(mistakeToDelete.partReviewCommonMistakeId);
              setMistakeToDelete(undefined);
            } catch (err) {
              if (err instanceof Error) {
                toast.error(err.message);
              }
            }
          }
        }}
      />

      <Typography variant="subtitle1" fontWeight="bold">
        Common Mistakes
      </Typography>

      {data &&
        data.map((mistake) => (
          <Box
            key={mistake.partReviewCommonMistakeId}
            sx={{
              backgroundColor: '#2f3031',
              display: 'flex',
              alignItems: 'center',
              padding: 2,
              marginBottom: 1,
              borderRadius: 2,
              boxShadow: 2
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
              <IconButton sx={{ color: 'dark-gray' }} onClick={() => setMistakeToDelete(mistake)}>
                <Delete />
              </IconButton>
            </Box>
          </Box>
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
