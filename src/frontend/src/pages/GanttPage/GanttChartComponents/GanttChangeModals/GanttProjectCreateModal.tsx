import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField, Typography } from '@mui/material';
import { ChangeRequestReason, ChangeRequestType, Project } from 'shared';
import { useState } from 'react';
import dayjs from 'dayjs';
import { CreateStandardChangeRequestPayload, useCreateStandardChangeRequest } from '../../../../hooks/change-requests.hooks';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import { useToast } from '../../../../hooks/toasts.hooks';
import { NERDraggableFormModal } from '../../../../components/NERDraggableFormModal';
import { getProjectStartDate, getProjectEndDate } from '../../../../utils/gantt.utils';

interface GanttProjectCreateModalProps {
  project: Project;
  handleClose: () => void;
  open: boolean;
}

export const GanttProjectCreateModal = ({ project, handleClose, open }: GanttProjectCreateModalProps) => {
  const toast = useToast();
  const [reasonForChange, setReasonForChange] = useState<ChangeRequestReason>(ChangeRequestReason.Initialization);
  const [explanationForChange, setExplanationForChange] = useState('');
  const { isLoading, mutateAsync } = useCreateStandardChangeRequest();

  const startDate = getProjectStartDate(project);
  const latestEndDate = getProjectEndDate(project);

  if (isLoading) return <LoadingIndicator />;

  const handleReasonChange = (event: SelectChangeEvent<ChangeRequestReason>) => {
    setReasonForChange(event.target.value as ChangeRequestReason);
  };

  const handleExplanationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setExplanationForChange(event.target.value);
  };

  const changeInTimeline = `${dayjs(startDate).format('MMMM D, YYYY')} - ${dayjs(latestEndDate).format('MMMM D, YYYY')}`;
  const handleSubmit = async () => {
    if (!reasonForChange) {
      return;
    }

    const [selectedTeam] = project.teams;

    const teamIds = selectedTeam ? [selectedTeam.teamId] : [];

    const payload: CreateStandardChangeRequestPayload = {
      wbsNum: {
        carNumber: project.wbsNum.carNumber,
        projectNumber: 0,
        workPackageNumber: 0
      },
      type: ChangeRequestType.Issue,
      what: `Create New Project with timeline of: ${changeInTimeline}`,
      why: [
        {
          explain: explanationForChange,
          type: reasonForChange
        }
      ],
      proposedSolutions: [],
      projectProposedChanges: {
        name: project.name,
        budget: 0,
        summary: `New Project for ${project.name}`,
        descriptionBullets: [],
        leadId: undefined,
        managerId: undefined,
        links: [],
        teamIds,
        carNumber: project.wbsNum.carNumber,
        workPackageProposedChanges: project.workPackages.map((workPackage) => ({
          name: workPackage.name,
          stage: workPackage.stage,
          leadId: undefined,
          managerId: undefined,
          startDate: workPackage.startDate.toLocaleString(),
          duration: workPackage.duration,
          blockedBy: [],
          descriptionBullets: [],
          links: []
        }))
      }
    };
    try {
      await mutateAsync(payload);
      toast.success('Change Request Created Successfully!');
      handleClose();
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  return (
    <NERDraggableFormModal
      open={open}
      title={'New Project: ' + project.name}
      disableSuccessButton={!reasonForChange || !explanationForChange}
      handleSubmit={handleSubmit}
      onHide={handleClose}
    >
      <Box sx={{ padding: 2, borderRadius: '10px 0 10px 0' }}>
        <Typography sx={{ fontSize: '1em' }}>{`New: ${changeInTimeline}`}</Typography>
        <Box sx={{ mt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Reason for Initialization</InputLabel>
            <Select value={reasonForChange} label="Reason for Initialization" onChange={handleReasonChange}>
              {Object.entries(ChangeRequestReason).map(([key, value]) => (
                <MenuItem value={value}>{key}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Explanation for Initialization"
            sx={{ mt: 2 }}
            value={explanationForChange}
            onChange={handleExplanationChange}
            multiline
          />
        </Box>
      </Box>
    </NERDraggableFormModal>
  );
};
