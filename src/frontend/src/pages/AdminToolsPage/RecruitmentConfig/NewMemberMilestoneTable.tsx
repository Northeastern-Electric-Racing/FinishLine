import {
  TableRow,
  TableCell,
  Box,
  IconButton,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableContainer,
  Button
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useState } from 'react';
import { isAdmin, Milestone, formatDateOnly } from 'shared';
import { useCurrentUser } from '../../../hooks/users.hooks';
import { useDeleteMilestone, useNewMemberMilestones } from '../../../hooks/recruitment.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import NERModal from '../../../components/NERModal';
import CreateMilestoneFormModal from './CreateMilestoneFormModal';
import EditMilestoneFormModal from './EditMilestoneFormModal';

const NewMemberMilestoneTable = () => {
  const currentUser = useCurrentUser();
  const {
    data: milestones,
    isLoading: milestonesIsLoading,
    isError: milestonesIsError,
    error: milestonesError
  } = useNewMemberMilestones();
  const { mutateAsync: deleteMilestone } = useDeleteMilestone();

  const [milestoneToDelete, setMilestoneToDelete] = useState<Milestone>();
  const [editingMilestone, setEditingMilestone] = useState<Milestone>();
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  if (!milestones || milestonesIsLoading) return <LoadingIndicator />;
  if (milestonesIsError) return <ErrorPage message={milestonesError.message} />;

  const sortedMilestones = [...milestones].sort(
    (a, b) => new Date(a.dateOfEvent).getTime() - new Date(b.dateOfEvent).getTime()
  );

  const handleDelete = (milestone: Milestone) => {
    deleteMilestone(milestone.milestoneId);
    setMilestoneToDelete(undefined);
  };

  return (
    <Box>
      <CreateMilestoneFormModal
        open={showCreateModal}
        handleClose={() => setShowCreateModal(false)}
        createDefaults={{ isOnNewMemberDashboard: true, isOnRecruitingDashboard: false }}
      />
      {editingMilestone && (
        <EditMilestoneFormModal
          open={!!editingMilestone}
          handleClose={() => setEditingMilestone(undefined)}
          milestone={editingMilestone}
        />
      )}

      <Box>
        <TableContainer sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
          <Table sx={{ '& td, & th': { borderBottom: 'none' } }}>
            <TableHead>
              <TableRow sx={{ borderBottom: '2px solid white', color: 'white' }}>
                <TableCell sx={{ borderRight: '2px solid white', color: 'white' }}>Date</TableCell>
                <TableCell sx={{ borderRight: '2px solid white', color: 'white' }}>Name</TableCell>
                <TableCell sx={{ color: 'white' }}>Description</TableCell>
                <TableCell sx={{ color: 'white' }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedMilestones.map((milestone) => (
                <TableRow
                  key={milestone.milestoneId}
                  onClick={() => setEditingMilestone(milestone)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell align="left" sx={{ color: 'white' }}>
                    {formatDateOnly(new Date(milestone.dateOfEvent))}
                  </TableCell>
                  <TableCell sx={{ borderLeft: '2px solid white', color: 'white' }}>{milestone.name}</TableCell>
                  <TableCell sx={{ borderLeft: '2px solid white', color: 'white' }}>{milestone.description}</TableCell>
                  <TableCell align="center" sx={{ color: 'white', verticalAlign: 'middle' }}>
                    <IconButton
                      onClick={(event) => {
                        event.stopPropagation();
                        setMilestoneToDelete(milestone);
                      }}
                    >
                      <Delete sx={{ color: 'white' }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'right', marginTop: '10px' }}>
          {isAdmin(currentUser.role) && (
            <Button
              onClick={() => setShowCreateModal(true)}
              variant="text"
              startIcon={<AddCircleOutlineIcon />}
              sx={{
                color: '#ef4345',
                '&:hover': {
                  backgroundColor: 'transparent'
                }
              }}
            >
              Add Onboarding Milestone
            </Button>
          )}
        </Box>
      </Box>

      <NERModal
        open={!!milestoneToDelete}
        title="Warning!"
        onHide={() => setMilestoneToDelete(undefined)}
        submitText="Delete"
        onSubmit={() => handleDelete(milestoneToDelete!)}
      >
        <Typography gutterBottom>
          Are you sure you want to delete the milestone <i>{milestoneToDelete?.name}</i>?
        </Typography>
        <Typography fontWeight="bold">This action cannot be undone!</Typography>
      </NERModal>
    </Box>
  );
};

export default NewMemberMilestoneTable;
