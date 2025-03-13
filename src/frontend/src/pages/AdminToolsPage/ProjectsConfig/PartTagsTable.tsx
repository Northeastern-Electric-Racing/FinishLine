import { Box, TableCell, TableRow } from '@mui/material';
import { NERButton } from '../../../components/NERButton';
import AdminToolTable from '../AdminToolTable';
import { useState } from 'react';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { useGetAllPartTags } from '../../../hooks/part-review.hooks';
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
    </TableRow>
  ));

  return (
    <Box>
      <CreatePartTagModal showModal={openModal} handleClose={() => setOpenModal(false)} />
      <AdminToolTable columns={[{ name: 'Tag Id' }, { name: 'Tag Name' }, { name: 'color' }]} rows={partTagTableRows} />
      <Box sx={{ display: 'flex', justifyContent: 'right', marginTop: '10px' }}>
        <NERButton variant="contained" onClick={() => setOpenModal(true)}>
          New Tag
        </NERButton>
      </Box>
    </Box>
  );
};

export default PartTagsTable;
