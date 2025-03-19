import { Box, IconButton, TableCell, TableRow } from '@mui/material';
import { NERButton } from '../../../components/NERButton';
import AdminToolTable from '../AdminToolTable';
import { useState } from 'react';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { useDeletePartTag, useGetAllPartTags } from '../../../hooks/part-review.hooks';
import CreatePartTagModal from './CreatePartTagModal';
import { Delete } from '@mui/icons-material';
import PartTagDeleteModal from './PartTagDeleteModal';
import { useToast } from '../../../hooks/toasts.hooks';

interface PartTagDeleteButtonProps {
  name: string;
  colorHexCode: string;
  onDelete: (name: string) => void;
}

const PartTagsTable: React.FC = () => {
  const {
    data: partTags,
    isLoading: partTagsIsLoading,
    isError: partTagsIsError,
    error: partTagsError
  } = useGetAllPartTags();
  const toast = useToast();
  const { mutateAsync } = useDeletePartTag();
  const [openModal, setOpenModal] = useState(false);

  if (!partTags || partTagsIsLoading) {
    return <LoadingIndicator />;
  }
  if (partTagsIsError) {
    return <ErrorPage message={partTagsError?.message} />;
  }
  const handleDeletePartTag = async (partTagId: string) => {
    try {
      await mutateAsync({ partTagId });
      toast.success(`Manufacturer: ${partTagId} Deleted Successfully!`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const PartTagDeleteButton: React.FC<PartTagDeleteButtonProps> = ({ name, colorHexCode, onDelete }) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleDeleteSubmit = () => {
      onDelete(name);
      setShowDeleteModal(false);
    };
    return (
      <>
        <IconButton
          type="button"
          sx={{
            mx: 1
          }}
          onClick={() => setShowDeleteModal(true)}
        >
          <Delete />
        </IconButton>
        {showDeleteModal && (
          <PartTagDeleteModal
            name={name}
            colorHexCode={colorHexCode}
            onDelete={handleDeleteSubmit}
            onHide={() => setShowDeleteModal(false)}
          />
        )}
      </>
    );
  };

  const partTagTableRows = partTags.map((partTag) => (
    <TableRow>
      <TableCell sx={{ border: '2px solid black', width: '40%' }}>{partTag.partTagId}</TableCell>
      <TableCell sx={{ border: '2px solid black', width: '40%' }}>{partTag.name}</TableCell>
      <TableCell align="left" sx={{ border: '2px solid black', width: '20%' }}>
        <Box
          sx={{
            display: 'inline-block',
            padding: '4px 8px',
            alignItems: 'center',
            height: '100%',
            background: partTag.colorHexCode,
            borderRadius: '8px'
          }}
        >
          {partTag.colorHexCode}
        </Box>
      </TableCell>
      <TableCell align="center" sx={{ border: '2px solid black', verticalAlign: 'middle' }}>
        <PartTagDeleteButton name={partTag.name} colorHexCode={partTag.colorHexCode} onDelete={handleDeletePartTag} />
      </TableCell>
    </TableRow>
  ));

  return (
    <Box>
      <CreatePartTagModal showModal={openModal} handleClose={() => setOpenModal(false)} />
      <AdminToolTable
        columns={[{ name: 'Tag Id' }, { name: 'Tag Name' }, { name: 'Color' }, { name: ' ' }]}
        rows={partTagTableRows}
      />
      <Box sx={{ display: 'flex', justifyContent: 'right', marginTop: '10px' }}>
        <NERButton variant="contained" onClick={() => setOpenModal(true)}>
          New Tag
        </NERButton>
      </Box>
    </Box>
  );
};

export default PartTagsTable;
