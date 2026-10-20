import { useEffect, useState } from 'react';
import { Box, IconButton, TextField, Typography } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import NERSuccessButton from './NERSuccessButton';
import NERFailButton from './NERFailButton';

interface EditableTextFieldProps {
  label: string;
  value: string;
  emptyPlaceholder: string;
  editPlaceholder?: string;
  isEditing: boolean;
  isSaving?: boolean;
  onEditStart: () => void;
  onCancel: () => void;
  onSave: (newText: string) => void;
}

const EditableTextField: React.FC<EditableTextFieldProps> = ({
  label,
  value,
  emptyPlaceholder,
  editPlaceholder,
  isEditing,
  isSaving = false,
  onEditStart,
  onCancel,
  onSave
}) => {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (isEditing) {
      setDraft(value);
    }
  }, [isEditing, value]);

  if (!isEditing) {
    return (
      <Box>
        <Box display="flex" alignItems="center">
          <Typography variant="h5">{label}</Typography>
          <IconButton onClick={onEditStart}>
            <EditOutlinedIcon />
          </IconButton>
        </Box>
        <Typography sx={{ whiteSpace: 'pre-wrap' }}> {value.trim() ? value : emptyPlaceholder}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center">
        <Typography variant="h5">{label}</Typography>
        <NERFailButton sx={{ ml: 2 }} type="button" onClick={onCancel} disabled={isSaving}>
          Cancel
        </NERFailButton>
        <NERSuccessButton sx={{ ml: 2 }} type="button" onClick={() => onSave(draft)} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save'}
        </NERSuccessButton>
      </Box>
      <TextField
        multiline
        fullWidth
        minRows={3}
        autoFocus
        value={draft}
        placeholder={editPlaceholder}
        onChange={(e) => setDraft(e.target.value)}
        sx={{ mt: 1 }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            onCancel();
          }
        }}
      />
    </Box>
  );
};

export default EditableTextField;
