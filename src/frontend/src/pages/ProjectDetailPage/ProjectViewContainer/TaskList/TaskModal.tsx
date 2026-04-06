/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { fullNamePipe, datePipe } from '../../../../utils/pipes';
import { Task, WbsNumber } from 'shared';
import { Box, Grid, Typography } from '@mui/material';
import { useState } from 'react';
import TaskFormModal, { EditTaskFormInput } from './TaskFormModal';
import NERModal from '../../../../components/NERModal';

interface TaskModalProps {
  task: Task;
  modalShow: boolean;
  onHide: () => void;
  onSubmit: (data: EditTaskFormInput) => Promise<void>;
  hasEditPermissions: boolean;
  wbsNum: WbsNumber;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, modalShow, onHide, onSubmit, hasEditPermissions, wbsNum }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const priorityColor = task.priority === 'HIGH' ? '#ef4345' : task.priority === 'LOW' ? '#00ab41' : '#FFA500';
  const isWpTask = task.wbsNum.workPackageNumber !== 0;

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
        <Grid container spacing={4}>
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
              Author:
              <Typography display={'inline'}> {fullNamePipe(task.createdBy)}</Typography>
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography fontWeight={'bold'}>
              Start Date:
              <Typography display={'inline'}> {datePipe(task.startDate)}</Typography>
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography fontWeight={'bold'}>
              Deadline:
              <Typography display={'inline'}> {datePipe(task.deadline)}</Typography>
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography fontWeight={'bold'}>
              Assignee(s):
              <Typography display={'inline'}> {task.assignees.map((user) => fullNamePipe(user)).join(', ')}</Typography>
            </Typography>
          </Grid>
          {isWpTask && (
            <Grid item xs={12} md={6}>
              <Typography fontWeight={'bold'}>
                Work Package:
                <Typography display={'inline'}> {task.wbsName}</Typography>
              </Typography>
            </Grid>
          )}
          <Grid item xs={12} md={6}>
            <Typography fontWeight={'bold'}>Notes:</Typography>
            <Box sx={{ height: 'auto', overflow: 'auto' }}>
              <Typography sx={{ whiteSpace: 'pre-wrap' }}>{task.notes}</Typography>
            </Box>
          </Grid>
        </Grid>
      </NERModal>
    );
  };

  const handleEditSubmit = async (data: EditTaskFormInput) => {
    await onSubmit(data);
    setIsEditMode(false);
  };

  return isEditMode ? (
    <TaskFormModal
      task={task}
      onHide={onHide}
      modalShow={modalShow}
      onSubmit={handleEditSubmit}
      onReset={() => {
        setIsEditMode(false);
      }}
      wbsNum={wbsNum}
    />
  ) : (
    <ViewModal />
  );
};

export default TaskModal;
