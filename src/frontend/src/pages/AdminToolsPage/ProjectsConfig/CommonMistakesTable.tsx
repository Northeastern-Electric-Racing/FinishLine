import { TableRow, TableCell, Box } from '@mui/material';
import { NERButton } from '../../../components/NERButton';
import AdminToolTable from '../AdminToolTable';
import CreateCommonMistakesModal from './CreateCommonMistakeModal';
import { useState } from 'react';

const fakeData = [
    {
        "id":"1",
        "title":"Test1",
        "description":"Description1",
        "starred":"true"
    },
    {
        "id":"2",
        "title":"Test2",
        "description":"Description2",
        "starred":"false"
    },
    {
        "id":"3",
        "title":"Test3",
        "description":"Description3",
        "starred":"false"
    }
]

const CommonMistakesTable: React.FC = () => {
  const [openModal, setOpenModal] = useState(false);


  const carsTableRows = fakeData.map((data) => (
    <TableRow>
      <TableCell sx={{ border: '2px solid black' }}>{data.title}</TableCell>
      <TableCell sx={{ border: '2px solid black' }}>{data.description}</TableCell>
      <TableCell align="left" sx={{ border: '2px solid black' }}>{data.starred}</TableCell>
    </TableRow>
  ));

  return (
    <Box>
      <CreateCommonMistakesModal showModal={openModal} handleClose={() => setOpenModal(false)} />
      <AdminToolTable
        columns={[{ name: 'Title' }, { name: 'Description' }, { name: 'Starred' }]}
        rows={carsTableRows}
      />
      <Box sx={{ display: 'flex', justifyContent: 'right', marginTop: '10px' }}>
        <NERButton variant="contained" onClick={() => setOpenModal(true)}>
          New Common Mistake
        </NERButton>
      </Box>
    </Box>
  );
};

export default CommonMistakesTable;
