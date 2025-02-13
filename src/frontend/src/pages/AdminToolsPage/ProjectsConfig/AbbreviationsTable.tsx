import { TableRow, TableCell, Box, Typography } from '@mui/material';
import AdminToolTable from '../AdminToolTable';
import { NERButton } from '../../../components/NERButton';
import { useState } from 'react';
import CreateCarModal from './CreateCarFormModal';

const AbbreviationsTable: React.FC = () => {
  const [openModal, setOpenModal] = useState(false);

  return (
    <Box>
      <Typography variant="subtitle1">Project Name Abbreviations</Typography>
      <CreateCarModal showModal={openModal} handleClose={() => setOpenModal(false)} />
      <AdminToolTable columns={[{ name: 'Project Name' }, { name: 'Abbreviation' }, { name: ' ' }]} rows={[]} />
      <Box sx={{ display: 'flex', justifyContent: 'right', marginTop: '10px' }}>
        <NERButton variant="contained" onClick={() => setOpenModal(true)}>
          New Abbreviation
        </NERButton>
      </Box>
    </Box>
  );
};

export default AbbreviationsTable;
