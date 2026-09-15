import { Box, Chip, IconButton, TableCell, TableRow } from '@mui/material';
import { NERButton } from '../../../components/NERButton';
import NERTable from '../../../components/NERTable';
import { useState } from 'react';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { useAllTaskLabels, useDeleteTaskLabel } from '../../../hooks/tasks.hooks';
import TaskLabelFormModal from './TaskLabelFormModal';
import TaskLabelDeleteModal from './TaskLabelDeleteModal';
import { useToast } from '../../../hooks/toasts.hooks';
import { Delete, Edit } from '@mui/icons-material';
import { TaskLabel } from 'shared';

interface TaskLabelActionButtonsProps {
  label: TaskLabel;
  onDelete: (label: TaskLabel) => void;
  onEdit: (label: TaskLabel) => void;
}

const TaskLabelActionButtons: React.FC<TaskLabelActionButtonsProps> = ({ label, onDelete, onEdit }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <>
      <IconButton onClick={() => onEdit(label)} sx={{ mx: 0.5 }}>
        <Edit />
      </IconButton>
      <IconButton onClick={() => setShowDeleteModal(true)} sx={{ mx: 0.5 }}>
        <Delete />
      </IconButton>
      {showDeleteModal && (
        <TaskLabelDeleteModal
          name={label.name}
          colorHexCode={label.colorHexCode}
          onDelete={() => {
            onDelete(label);
            setShowDeleteModal(false);
          }}
          onHide={() => setShowDeleteModal(false)}
        />
      )}
    </>
  );
};

const TaskLabelsTable: React.FC = () => {
  const { data: taskLabels, isLoading, isError, error } = useAllTaskLabels();
  const toast = useToast();
  const { mutateAsync: deleteMutateAsync } = useDeleteTaskLabel();
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [editingLabel, setEditingLabel] = useState<TaskLabel | undefined>(undefined);

  if (isError) return <ErrorPage message={error?.message} />;
  if (!taskLabels || isLoading) return <LoadingIndicator />;

  const handleDelete = async (label: TaskLabel) => {
    try {
      await deleteMutateAsync({ taskLabelId: label.taskLabelId });
      toast.success(`Task Label "${label.name}" deleted successfully!`);
    } catch (e: unknown) {
      if (e instanceof Error) toast.error(e.message);
    }
  };

  const rows = taskLabels.map((label, index) => (
    <TableRow key={label.taskLabelId} hover>
      <TableCell sx={{ borderBottom: index === taskLabels.length - 1 ? 'none' : 'default' }}>
        <Chip
          label={label.name}
          variant="filled"
          sx={{
            '& .MuiChip-label': { fontSize: '0.875rem', lineHeight: '1.25em' },
            fontWeight: 500,
            color: 'white',
            backgroundColor: label.colorHexCode,
            px: 1.5,
            py: 0.5,
            borderRadius: '999px',
            height: 'auto',
            minHeight: 0
          }}
        />
      </TableCell>
      <TableCell
        align="center"
        sx={{ borderBottom: index === taskLabels.length - 1 ? 'none' : 'default', verticalAlign: 'middle' }}
      >
        <TaskLabelActionButtons label={label} onDelete={handleDelete} onEdit={(l) => setEditingLabel(l)} />
      </TableCell>
    </TableRow>
  ));

  return (
    <Box>
      <TaskLabelFormModal showModal={openCreateModal} handleClose={() => setOpenCreateModal(false)} />
      {editingLabel && (
        <TaskLabelFormModal showModal={true} handleClose={() => setEditingLabel(undefined)} defaultValues={editingLabel} />
      )}
      <NERTable columns={[{ name: 'Label' }, { name: '', width: '10%' }]} rows={rows} />
      <Box sx={{ display: 'flex', justifyContent: 'right', marginTop: '10px' }}>
        <NERButton variant="contained" onClick={() => setOpenCreateModal(true)}>
          New Label
        </NERButton>
      </Box>
    </Box>
  );
};

export default TaskLabelsTable;
