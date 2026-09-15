import {
  TableRow,
  TableCell,
  Box,
  Table as MuiTable,
  TableHead,
  TableBody,
  TableContainer,
  Typography,
  Button,
  IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { isAdmin, Milestone, formatDateOnly } from 'shared';
import { UseQueryResult } from 'react-query';
import CreateMilestoneFormModal from './CreateMilestoneFormModal';
import EditMilestoneFormModal from './EditMilestoneFormModal';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useHistoryState } from '../../../hooks/misc.hooks';
import { useDeleteMilestone } from '../../../hooks/recruitment.hooks';
import { useCurrentUser } from '../../../hooks/users.hooks';
import ErrorPage from '../../ErrorPage';
import { NERButton } from '../../../components/NERButton';
import NERDeleteModal from '../../../components/NERDeleteModal';
import { useState } from 'react';
import { useToast } from '../../../hooks/toasts.hooks';

interface MilestoneTableProps {
  useMilestones: () => UseQueryResult<Milestone[], Error>;
  createDefaults: { isOnNewMemberDashboard: boolean; isOnRecruitingDashboard: boolean };
  addButtonLabel?: string;
  /** 'recruitment' renders the red-header admin-tools table; 'onboarding' renders the dark, borderless widget-card table */
  variant?: 'recruitment' | 'onboarding';
}

const MilestoneTable = ({
  useMilestones,
  createDefaults,
  addButtonLabel = 'Add Milestone',
  variant = 'recruitment'
}: MilestoneTableProps) => {
  const currentUser = useCurrentUser();
  const [createModalShow, setCreateModalShow] = useHistoryState<boolean>('', false);
  const [milestoneEditing, setMilestoneEditing] = useHistoryState<Milestone | undefined>('', undefined);
  const {
    isLoading: milestonesIsLoading,
    isError: milestonesIsError,
    error: milestonesError,
    data: milestones
  } = useMilestones();
  const [milestoneToDelete, setMilestoneToDelete] = useState<Milestone | undefined>(undefined);
  const { mutateAsync: deleteMilestone } = useDeleteMilestone();
  const toast = useToast();

  if (milestonesIsError) return <ErrorPage message={milestonesError.message} />;
  if (milestonesIsLoading || !milestones) return <LoadingIndicator />;

  const handleDelete = async (id: string) => {
    setMilestoneToDelete(undefined);
    try {
      await deleteMilestone(id);
      toast.success('Milestone deleted successfully');
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message, 3000);
      }
    }
  };

  const sortedMilestones = [...milestones].sort(
    (a, b) => new Date(a.dateOfEvent).getTime() - new Date(b.dateOfEvent).getTime()
  );

  const isOnboardingVariant = variant === 'onboarding';
  const showAddButton = isOnboardingVariant ? isAdmin(currentUser.role) : true;

  return (
    <Box>
      <CreateMilestoneFormModal
        open={createModalShow}
        handleClose={() => setCreateModalShow(false)}
        createDefaults={createDefaults}
      />
      {milestoneEditing && (
        <EditMilestoneFormModal
          open={!!milestoneEditing}
          handleClose={() => setMilestoneEditing(undefined)}
          milestone={milestoneEditing}
        />
      )}
      {isOnboardingVariant ? (
        <TableContainer sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
          <MuiTable sx={{ '& td, & th': { borderBottom: 'none' } }}>
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
                  onClick={() => setMilestoneEditing(milestone)}
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
                      <DeleteIcon sx={{ color: 'white' }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </MuiTable>
        </TableContainer>
      ) : (
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
          <TableBody>
            {sortedMilestones.map((milestone, index) => (
              <TableRow key={milestone.milestoneId}>
                <TableCell align="left" sx={{ borderBottom: index === sortedMilestones.length - 1 ? 'none' : 'default' }}>
                  <Typography>{formatDateOnly(new Date(milestone.dateOfEvent))}</Typography>
                </TableCell>
                <TableCell sx={{ borderBottom: index === sortedMilestones.length - 1 ? 'none' : 'default' }}>
                  <Typography>{milestone.name}</Typography>
                </TableCell>
                <TableCell
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: index === sortedMilestones.length - 1 ? 'none' : 'default',
                    minHeight: '50px'
                  }}
                >
                  <Typography sx={{ maxWidth: 300 }}>{milestone.description}</Typography>
                  <Box sx={{ display: 'flex' }}>
                    <Button sx={{ p: 0.5, color: 'white' }} onClick={() => setMilestoneEditing(milestone)}>
                      <EditIcon />
                    </Button>
                    <Button
                      sx={{ p: 0.5, color: 'white' }}
                      onClick={() => {
                        setMilestoneToDelete(milestone);
                      }}
                    >
                      <DeleteIcon />
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </MuiTable>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'right', marginTop: isOnboardingVariant ? '10px' : '20px' }}>
        {showAddButton &&
          (isOnboardingVariant ? (
            <Button
              onClick={() => setCreateModalShow(true)}
              variant="text"
              startIcon={<AddCircleOutlineIcon />}
              sx={{
                color: '#ef4345',
                '&:hover': {
                  backgroundColor: 'transparent'
                }
              }}
            >
              {addButtonLabel}
            </Button>
          ) : (
            <NERButton variant="contained" onClick={() => setCreateModalShow(true)}>
              {addButtonLabel}
            </NERButton>
          ))}
      </Box>
      <NERDeleteModal
        open={!!milestoneToDelete}
        onHide={() => setMilestoneToDelete(undefined)}
        formId="delete-item-form"
        dataType="Milestone"
        onFormSubmit={() => {
          if (milestoneToDelete) {
            handleDelete(milestoneToDelete.milestoneId);
          }
        }}
      />
    </Box>
  );
};

export default MilestoneTable;
