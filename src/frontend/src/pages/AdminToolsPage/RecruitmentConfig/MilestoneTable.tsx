import { TableRow, TableCell, Box, Table as MuiTable, TableHead, TableBody, Typography, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Milestone } from 'shared/src/types/milestone-types';

interface MilestoneTableProps {
  milestones: Milestone[];
  setEditingMilestone: (value: Milestone | undefined) => void;
}

const MilestoneTable: React.FC<MilestoneTableProps> = ({ milestones, setEditingMilestone }) => {
  const milestoneRows = milestones.map((milestone, index) => (
    <TableRow>
      <TableCell
        align="left"
        sx={{
          borderRight: '1px solid',
          borderBottom: index === milestones.length - 1 ? 'none' : '1px solid'
        }}
      >
        <Typography>{milestone.dateOfEvent.toDateString()}</Typography>
      </TableCell>
      <TableCell
        sx={{
          borderRight: '1px solid',
          borderBottom: index === milestones.length - 1 ? 'none' : '1px solid'
        }}
      >
        <Typography>{milestone.name}</Typography>
      </TableCell>
      <TableCell
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: index === milestones.length - 1 ? 'none' : '1px solid'
        }}
      >
        <Typography sx={{ maxWidth: 300 }}>{milestone.description}</Typography>
        <Box sx={{ display: 'flex' }}>
          <Button sx={{ p: 0.5, color: 'white' }} onClick={() => setEditingMilestone(milestone)}>
            <EditIcon />
          </Button>
          <Button sx={{ p: 0.5, color: 'white' }}>
            <DeleteIcon />
          </Button>
        </Box>
      </TableCell>
    </TableRow>
  ));

  return (
    <Box>
      <MuiTable>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                fontWeight: 'bold',
                fontSize: '1em',
                backgroundColor: '#ef4345',
                color: 'white',
                borderRadius: '10px 0px 0px 0px'
              }}
            >
              Date
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold', fontSize: '1em', backgroundColor: '#ef4345', color: 'white' }}>
              Name
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 'bold',
                fontSize: '1em',
                backgroundColor: '#ef4345',
                color: 'white',
                borderRadius: '0px 10px 0px 0px'
              }}
            >
              Description
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{milestoneRows}</TableBody>
      </MuiTable>
    </Box>
  );
};

export default MilestoneTable;
