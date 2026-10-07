/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { fullNamePipe, datePipe, wbsPipe } from '../../../../utils/pipes';
import { Task, TaskStatus, WbsNumber } from 'shared';
import { Box, Button, Chip, Grid, IconButton, Link, Tooltip, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Link as RouterLink } from 'react-router-dom';
import { useState } from 'react';
import { routes } from '../../../../utils/routes';
import TaskFormModal, { EditTaskFormInput } from './TaskFormModal';
import NERModal from '../../../../components/NERModal';
import { useToast } from '../../../../hooks/toasts.hooks';

interface TaskModalProps {
  task: Task;
  modalShow: boolean;
  onHide: () => void;
  onSubmit: (data: EditTaskFormInput) => Promise<void>;
  hasEditPermissions: boolean;
  wbsNum: WbsNumber;
  // the board this task was opened from, so the edit form knows whether it's WP-scoped
  context?: 'global' | 'project' | 'workPackage';
  // opens another task's modal by taskId (used by the "Blocked By" task links)
  onOpenTask: (taskId: string) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({
  task,
  modalShow,
  onHide,
  onSubmit,
  hasEditPermissions,
  wbsNum,
  context,
  onOpenTask
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const toast = useToast();

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?task=${task.taskId}`;
    navigator.clipboard.writeText(url);
    toast.success('Task link copied to clipboard!');
  };

  const priorityColor = task.priority === 'HIGH' ? '#ef4345' : task.priority === 'LOW' ? '#00ab41' : '#FFA500';
  const isWpTask = task.wbsNum.workPackageNumber !== 0;
  const isWpContext = context === 'workPackage';
  const activeBlockers = task.blockedBy.filter((blocker) => blocker.status !== TaskStatus.DONE);

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
        actionsLeftChildren={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Copy link to this task">
              <IconButton onClick={handleCopyLink}>
                <ContentCopyIcon />
              </IconButton>
            </Tooltip>
            {/* on the global board only, offer a shortcut to the task's own project/work package task page */}
            {context === 'global' && (
              <Button
                variant="outlined"
                component={RouterLink}
                to={`${routes.PROJECTS}/${wbsPipe(task.wbsNum)}/tasks`}
                onClick={onHide}
              >
                {isWpTask ? 'Go to Work Package' : 'Go to Project'}
              </Button>
            )}
          </Box>
        }
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
          {isWpTask && !isWpContext && (
            <Grid item xs={12} md={6}>
              <Typography fontWeight={'bold'}>
                Work Package:
                <Typography display={'inline'}> {task.wbsName}</Typography>
              </Typography>
            </Grid>
          )}
          <Grid item xs={12} md={6}>
            <Typography fontWeight={'bold'}>Label(s):</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
              {task.labels.map((label) => (
                <Chip
                  key={label.taskLabelId}
                  label={label.name}
                  size="small"
                  sx={{ backgroundColor: label.colorHexCode, color: '#fff', fontWeight: 'bold' }}
                />
              ))}
            </Box>
          </Grid>
          {(activeBlockers.length > 0 || task.blockedByWorkPackages.length > 0) && (
            <Grid item xs={12} md={6}>
              <Typography fontWeight={'bold'}>Blocked By:</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mt: 0.5 }}>
                {activeBlockers.map((blocker) => (
                  <Link
                    key={blocker.taskId}
                    component="button"
                    type="button"
                    underline="hover"
                    onClick={() => onOpenTask(blocker.taskId)}
                    sx={{ fontSize: '0.875rem' }}
                  >
                    {blocker.title}
                  </Link>
                ))}
                {task.blockedByWorkPackages.map((blockingWp) => (
                  <Chip key={wbsPipe(blockingWp.wbsNum)} label={`${blockingWp.name} (WP)`} size="small" variant="outlined" />
                ))}
              </Box>
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
      context={context}
    />
  ) : (
    <ViewModal />
  );
};

export default TaskModal;
