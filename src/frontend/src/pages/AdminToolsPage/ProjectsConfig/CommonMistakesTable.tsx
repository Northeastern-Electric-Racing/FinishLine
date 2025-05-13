import { Box, IconButton, Typography, Tooltip } from '@mui/material';
import { Star, StarBorder, Edit, Delete } from '@mui/icons-material';
import { NERButton } from '../../../components/NERButton';
import NERDeleteModal from '../../../components/NERDeleteModal';
import { useState } from 'react';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useToast } from '../../../hooks/toasts.hooks';
import ErrorPage from '../../ErrorPage';
import type { PartReviewCommonMistake } from 'shared';
import {
  useAllCommonMistakes,
  useDeletePartReviewCommonMistake,
  useUpdateCommonMistake
} from '../../../hooks/part-review.hooks';
import HelpIcon from '@mui/icons-material/Help';
import CreateCommonMistakesModal from './CreateCommonMistakeModal';
import EditCommonMistakeModal from './EditCommonMistakeModal';

const CommonMistakesTable: React.FC = () => {
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [mistakeToEdit, setMistakeToEdit] = useState<PartReviewCommonMistake | null>(null);
  const [mistakeToDelete, setMistakeToDelete] = useState<PartReviewCommonMistake | null>(null);

  const { data: commonMistakes, isLoading, isError, error } = useAllCommonMistakes();
  const { mutateAsync: mutateDeleteAsync } = useDeletePartReviewCommonMistake();
  const { mutateAsync: mutateEditAsync } = useUpdateCommonMistake();
  const toast = useToast();

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (isError) {
    return <ErrorPage message={error?.message} />;
  }

  if (!commonMistakes) {
    return <ErrorPage message="No common mistakes found" />;
  }

  const handleEdit = (mistake: PartReviewCommonMistake) => {
    setMistakeToEdit(mistake);
  };

  const handleCreate = () => {
    setMistakeToEdit(null);
    setOpenCreateModal(true);
  };

  const handleToggleStar = async (mistake: PartReviewCommonMistake) => {
    try {
      await mutateEditAsync({
        commonMistakeId: mistake.partReviewCommonMistakeId,
        payload: {
          title: mistake.title,
          description: mistake.description,
          starred: !mistake.starred
        }
      });
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  const tooltipMessage = (
    <Typography sx={{ fontSize: 14 }}>Star common mistakes that you want displayed on the Submission Guide.</Typography>
  );

  return (
    <Box>
      <CreateCommonMistakesModal showModal={openCreateModal} handleClose={() => setOpenCreateModal(false)} />

      {mistakeToEdit && (
        <EditCommonMistakeModal
          showModal={!!mistakeToEdit}
          handleClose={() => setMistakeToEdit(null)}
          mistake={mistakeToEdit}
        />
      )}

      <NERDeleteModal
        open={!!mistakeToDelete}
        onHide={() => setMistakeToDelete(null)}
        formId="delete-mistake-form"
        dataType="Common Mistake"
        onFormSubmit={async () => {
          if (mistakeToDelete) {
            try {
              const message = await mutateDeleteAsync(mistakeToDelete.partReviewCommonMistakeId);
              setMistakeToDelete(null);
              toast.success(message.message);
            } catch (err) {
              if (err instanceof Error) {
                toast.error(err.message);
              }
            }
          }
        }}
      />

      <Box>
        <Typography variant="h6">
          Common Mistakes
          <Tooltip title={tooltipMessage} placement="right" arrow>
            <HelpIcon sx={{ ml: 1, fontSize: 20 }} />
          </Tooltip>
        </Typography>
      </Box>

      <Box
        sx={{
          maxHeight: '30vh',
          overflowY: 'auto',
          mt: 1,
          pr: 1,
          '&::-webkit-scrollbar': {
            width: '8px'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#c44546',
            borderRadius: '4px'
          }
        }}
      >
        {/* Converts true to 1, and false to 0, and then compares the larger number to sort starred */}
        {commonMistakes &&
          commonMistakes
            .sort((a, b) => Number(b.starred) - Number(a.starred))
            .map((mistake) => (
              <Box
                key={mistake.partReviewCommonMistakeId}
                sx={{
                  backgroundColor: '#2f3031',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 1.25,
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
                <Box sx={{ flex: 1, overflow: 'hidden' }}>
                  <Typography variant="subtitle1" fontWeight="bold" noWrap>
                    {mistake.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {mistake.description}
                  </Typography>
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
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
        <NERButton variant="contained" onClick={handleCreate}>
          New Common Mistake
        </NERButton>
      </Box>
    </Box>
  );
};

export default CommonMistakesTable;
