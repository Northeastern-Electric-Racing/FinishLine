import { Box, TableCell, TableRow, Typography } from '@mui/material';
import { NERButton } from '../../../components/NERButton';
import AdminToolTable from '../AdminToolTable';
import { useState } from 'react';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { useGetAllPartTags } from '../../../hooks/part-tag.hooks';
import CreatePartTagModal from './CreatePartTagModal';

const PartTagsTable: React.FC = () => {
  const {
    data: partTags,
    isLoading: partTagsIsLoading,
    isError: partTagsIsError,
    error: partTagsError
  } = useGetAllPartTags();
  const [openModal, setOpenModal] = useState(false);

  if (!partTags || partTagsIsLoading) {
    return <LoadingIndicator />;
  }
  if (partTagsIsError) {
    return <ErrorPage message={partTagsError?.message} />;
  }

  const partTagTableRows = partTags.map((partTag) => (
    <TableRow>
      <TableCell sx={{ border: '2px solid black' }}>{partTag.partTagId}</TableCell>
      <TableCell sx={{ border: '2px solid black' }}>{partTag.name}</TableCell>
      <TableCell align="left" sx={{ border: '2px solid black' }}>
        {partTag.colorHexCode}
      </TableCell>
    </TableRow>
  ));

  return (
    <Box>
      <CreatePartTagModal showModal={openModal} handleClose={() => setOpenModal(false)} />
      <AdminToolTable columns={[{ name: 'Tag Name' }]} rows={partTagTableRows} />
      <Box sx={{ display: 'flex', justifyContent: 'right', marginTop: '10px' }}>
        <NERButton variant="contained" onClick={() => setOpenModal(true)}>
          New Tag
        </NERButton>
      </Box>
    </Box>
  );
};

export default PartTagsTable;
