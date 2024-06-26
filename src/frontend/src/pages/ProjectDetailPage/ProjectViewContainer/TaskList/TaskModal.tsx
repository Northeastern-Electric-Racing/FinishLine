/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { TeamPreview } from 'shared';
import { fullNamePipe, datePipe } from '../../../../utils/pipes';
import { Task } from 'shared';
import { Box, Grid, Typography } from '@mui/material';
import { useState } from 'react';
import TaskFormModal, { EditTaskFormInput } from './TaskFormModal';
import NERModal from '../../../../components/NERModal';

interface TaskModalProps {
  task: Task;
  teams: TeamPreview[];
  modalShow: boolean;
  onHide: () => void;
  onSubmit: (data: EditTaskFormInput) => Promise<void>;
  hasEditPermissions: boolean;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, teams, modalShow, onHide, onSubmit, hasEditPermissions }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const priorityColor = task.priority === 'HIGH' ? '#ef4345' : task.priority === 'LOW' ? '#00ab41' : '#FFA500';
  const ViewModal: React.FC = () => {
    return (
      <NERModal
        open={modalShow}
        title={task.title}
        onHide={onHide}
        cancelText="Exit"
        submitText="Update"
        onSubmit={() => {
          if (hasEditPermissions) {
            setIsEditMode(true);
          }
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography fontWeight={'bold'}>
              Priority:{' '}
              <Typography display={'inline'} color={priorityColor}>
                {task.priority}
              </Typography>
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography fontWeight={'bold'}>
              Deadline:
              <Typography display={'inline'}> {datePipe(task.deadline)}</Typography>
            </Typography>
          </Grid>
          <Grid item xs={12} md={12}>
            <Typography fontWeight={'bold'}>
              Assignee(s):
              <Typography display={'inline'}> {task.assignees.map((user) => fullNamePipe(user)).join(', ')}</Typography>
            </Typography>
          </Grid>
          <Grid item xs={12} md={12}>
            <Typography fontWeight={'bold'}>Notes:</Typography>
            <Box sx={{ height: '200px', overflow: 'auto' }}>
              <Typography>{task.notes}</Typography>
            </Box>
          </Grid>
        </Grid>
      </NERModal>
    );
  };

  return isEditMode ? (
    <TaskFormModal task={task} teams={teams} onHide={onHide} modalShow={modalShow} onSubmit={onSubmit} />
  ) : (
    <ViewModal />
  );
};

export default TaskModal;
