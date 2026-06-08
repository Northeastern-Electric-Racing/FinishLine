import React, { useState } from 'react';
import { Box, Chip, IconButton, Link, Stack, Typography, useTheme } from '@mui/material';
import { CalendarTask, isAdmin, notGuest, TaskPriority, TaskStatus, wbsPipe, formatDateOnly } from 'shared';
import { useCurrentUser } from '../../hooks/users.hooks';
import { Link as RouterLink } from 'react-router-dom';
import { routes } from '../../utils/routes';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventIcon from '@mui/icons-material/Event';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useEditTask, useEditTaskAssignees, useDeleteTask } from '../../hooks/tasks.hooks';
import { useToast } from '../../hooks/toasts.hooks';
import TaskFormModal, { EditTaskFormInput } from '../ProjectDetailPage/ProjectViewContainer/TaskList/TaskFormModal';
import NERDeleteModal from '../../components/NERDeleteModal';

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  [TaskPriority.Low]: '#4caf50',
  [TaskPriority.Medium]: '#ff9800',
  [TaskPriority.High]: '#f44336'
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.IN_BACKLOG]: 'In Backlog',
  [TaskStatus.IN_PROGRESS]: 'In Progress',
  [TaskStatus.DONE]: 'Done'
};

const joinPeople = (members: { firstName: string; lastName: string }[]) =>
  members.map((m) => `${m.firstName} ${m.lastName}`).join(', ');

interface TaskClickContentProps {
  task: CalendarTask;
  onClose: () => void;
}

export const TaskClickContent: React.FC<TaskClickContentProps> = ({ task, onClose }) => {
  const currentUser = useCurrentUser();
  const theme = useTheme();
  const toast = useToast();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { mutateAsync: editTaskMutation } = useEditTask();
  const { mutateAsync: editAssignees } = useEditTaskAssignees();
  const { mutateAsync: deleteTaskMutation } = useDeleteTask();

  const canEdit = notGuest(currentUser.role);
  const canDelete =
    isAdmin(currentUser.role) ||
    task.createdBy.userId === currentUser.userId ||
    task.projectLeadId === currentUser.userId ||
    task.projectManagerId === currentUser.userId;

  const handleEditSubmit = async (data: EditTaskFormInput) => {
    try {
      await editTaskMutation({
        taskId: task.taskId,
        title: data.title,
        notes: data.notes,
        priority: data.priority,
        startDate: data.startDate,
        deadline: data.deadline,
        wbsNum: task.wbsNum
      });
      await editAssignees({
        taskId: task.taskId,
        assignees: data.assignees
      });
      toast.success('Task updated successfully!');
      setShowEditModal(false);
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteTaskMutation({ taskId: task.taskId });
      toast.success('Task deleted successfully!');
      setShowDeleteModal(false);
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    }
  };

  const projectPath = `${routes.PROJECTS}/${wbsPipe(task.wbsNum)}`;

  return (
    <>
      <Box
        sx={{
          bgcolor: theme.palette.grey[900],
          color: theme.palette.common.white,
          borderRadius: 2,
          px: 2,
          py: 1.5,
          maxWidth: 420
        }}
      >
        <Box sx={{ mb: 1.5 }}>
          <Stack direction="row" spacing={1} alignItems="flex-start">
            <AssignmentIcon sx={{ color: '#7B68EE', mt: 0.3 }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 'bold',
                  color: '#7B68EE',
                  whiteSpace: 'normal',
                  overflowWrap: 'anywhere',
                  lineHeight: 1.2
                }}
              >
                {task.title}
              </Typography>
            </Box>

            <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
              {canEdit && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEditModal(true);
                  }}
                  sx={{
                    color: theme.palette.grey[500],
                    '&:hover': { color: theme.palette.common.white, bgcolor: 'transparent' }
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              )}
              {canDelete && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteModal(true);
                  }}
                  sx={{
                    color: theme.palette.grey[500],
                    '&:hover': { color: '#ef5350', bgcolor: 'transparent' }
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.75 }}>
            <Chip
              label={task.priority}
              size="small"
              sx={{
                bgcolor: PRIORITY_COLORS[task.priority],
                color: 'white',
                fontWeight: 'bold',
                fontSize: 11,
                height: 22
              }}
            />
            <Chip
              label={STATUS_LABELS[task.status]}
              size="small"
              variant="outlined"
              sx={{
                borderColor: theme.palette.grey[600],
                color: theme.palette.grey[300],
                fontSize: 11,
                height: 22
              }}
            />
          </Stack>
        </Box>

        <Stack spacing={1}>
          {task.deadline && (
            <Stack direction="row" spacing={1.25} alignItems="center">
              <EventIcon fontSize="small" />
              <Typography variant="body2">
                <b>Deadline:</b> {formatDateOnly(new Date(task.deadline), 'MMM D, YYYY')}
              </Typography>
            </Stack>
          )}

          {task.assignees.length > 0 && (
            <Stack direction="row" spacing={1.25} alignItems="flex-start">
              <GroupIcon fontSize="small" sx={{ mt: 0.3 }} />
              <Typography variant="body2" sx={{ flex: 1 }}>
                <b>Assignees:</b> {joinPeople(task.assignees)}
              </Typography>
            </Stack>
          )}

          <Stack direction="row" spacing={1.25} alignItems="center">
            <PersonIcon fontSize="small" />
            <Typography variant="body2">
              <b>Created by:</b> {task.createdBy.firstName} {task.createdBy.lastName}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1.25} alignItems="center">
            <FolderIcon fontSize="small" />
            <Typography variant="body2">
              <b>Project:</b>{' '}
              <Link component={RouterLink} to={projectPath} onClick={(e) => e.stopPropagation()} sx={{ color: '#7B68EE' }}>
                {wbsPipe(task.wbsNum)}
              </Link>
            </Typography>
          </Stack>

          {task.notes && task.notes.trim().length > 0 && (
            <Stack direction="row" spacing={1.25} alignItems="flex-start">
              <DescriptionIcon fontSize="small" sx={{ mt: 0.3 }} />
              <Typography variant="body2" sx={{ flex: 1, whiteSpace: 'pre-wrap' }}>
                <b>Notes:</b> {task.notes}
              </Typography>
            </Stack>
          )}
        </Stack>
      </Box>

      {showEditModal && (
        <TaskFormModal
          task={task}
          modalShow={showEditModal}
          onHide={() => setShowEditModal(false)}
          onSubmit={handleEditSubmit}
          wbsNum={task.wbsNum}
        />
      )}

      {showDeleteModal && (
        <NERDeleteModal
          open={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          formId="delete-task-form"
          dataType={task.title}
          onFormSubmit={handleDeleteConfirm}
        />
      )}
    </>
  );
};
