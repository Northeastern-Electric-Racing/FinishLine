import { TableRow, TableCell, Box, Table as MuiTable, TableHead, TableBody, Typography, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Milestone } from 'shared/src/types/milestone-types';
import CreateMilestoneFormModal from './CreateMilestoneFormModal';
import EditMilestoneFormModal from './EditMilestoneFormModal';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useHistoryState } from '../../../hooks/misc.hooks';
import { useAllMilestones } from '../../../hooks/recruitment.hooks';
import ErrorPage from '../../ErrorPage';
import { NERButton } from '../../../components/NERButton';

const MilestoneTable = () => {
  const [createModalShow, setCreateModalShow] = useHistoryState<boolean>('', false);
  const [milestoneEditing, setMilestoneEditing] = useHistoryState<Milestone | undefined>('', undefined);
  const {
    isLoading: milestonesIsLoading,
    isError: milestonesIsError,
    error: milestonesError,
    data: milestones
  } = useAllMilestones();

  if (!milestones || milestonesIsLoading) return <LoadingIndicator />;
  if (milestonesIsError) return <ErrorPage message={milestonesError.message} />;

  const sortedMilestones = milestones.sort((a, b) => new Date(a.dateOfEvent).getTime() - new Date(b.dateOfEvent).getTime());
  const milestoneRows = sortedMilestones.map((milestone, index) => (
    <TableRow>
      <TableCell
        align="left"
        sx={{
          borderRight: '1px solid',
          borderBottom: index === milestones.length - 1 ? 'none' : '1px solid'
        }}
      >
        <Typography>{new Date(milestone.dateOfEvent).toDateString()}</Typography>
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
          <Button sx={{ p: 0.5, color: 'white' }} onClick={() => setMilestoneEditing(milestone)}>
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
      <CreateMilestoneFormModal open={createModalShow} handleClose={() => setCreateModalShow(false)} />
      {milestoneEditing && (
        <EditMilestoneFormModal
          open={!!milestoneEditing}
          handleClose={() => setMilestoneEditing(undefined)}
          milestone={milestoneEditing}
        />
      )}
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
      <Box sx={{ display: 'flex', justifyContent: 'right', marginTop: '20px' }}>
        <NERButton
          variant="contained"
          onClick={() => {
            setCreateModalShow(true);
          }}
        >
          Add Milestone
        </NERButton>
      </Box>
    </Box>
  );
};

export default MilestoneTable;
