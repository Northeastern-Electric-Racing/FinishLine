/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { TeamPreview } from 'shared';
import { fullNamePipe, datePipe } from '../../../../utils/pipes';
import { Task } from 'shared';
import { Dialog, DialogContent, DialogTitle, Box, Grid, Breakpoint, Typography, IconButton, useTheme } from '@mui/material';
import { useState } from 'react';
import { Close, Edit } from '@mui/icons-material';
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
      /*<Dialog fullWidth maxWidth={dialogWidth} open={modalShow} onClose={onHide}>
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '30' }}>
          {task.title}{' '}
          <IconButton
            aria-label="close"
            onClick={onHide}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500]
            }}
          >
            <Close />
          </IconButton>
          <IconButton
            onClick={() => setIsEditMode(true)}
            aria-label="edit"
            disabled={!hasEditPermissions}
            sx={{
              position: 'absolute',
              right: 40,
              top: 8,
              color: (theme) => theme.palette.grey[500]
            }}
          >
            <Edit />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            '&::-webkit-scrollbar': {
              height: '20px'
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'transparent'
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: theme.palette.divider,
              borderRadius: '20px',
              border: '6px solid transparent',
              backgroundClip: 'content-box'
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
                <Typography> {task.notes}</Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>*/
    );
  };

  return isEditMode ? (
    <TaskFormModal task={task} teams={teams} onHide={onHide} modalShow={modalShow} onSubmit={onSubmit} />
  ) : (
    <ViewModal />
  );
};

export default TaskModal;
