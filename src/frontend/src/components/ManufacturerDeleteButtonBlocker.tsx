import { Close } from '@mui/icons-material';
import { Breakpoint, Dialog, DialogActions, DialogTitle, IconButton } from '@mui/material';
import NERFailButton from '../components/NERFailButton';
import NERSuccessButton from '../components/NERSuccessButton';

interface ManufacturerDeleteButtonBlockerProps {
  name: String;
  onHide: () => void;
  onSubmit: () => Promise<void>;
}

const ManufacturerDeleteButtonBlocker: React.FC<ManufacturerDeleteButtonBlockerProps> = ({
  name,
  onHide,
  onSubmit
}: ManufacturerDeleteButtonBlockerProps) => {
  const dialogWidth: Breakpoint = 'md';
  return (
    <Dialog fullWidth maxWidth={dialogWidth} open={true} onClose={onHide}>
      <DialogTitle sx={{ fontWeight: 'bold', fontSize: '30' }}>
        Are you sure you want to delete this manufacturer: {name}
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
      </DialogTitle>

      <DialogActions>
        <NERFailButton type="submit" variant="contained" sx={{ mx: 1 }} onClick={onHide}>
          Cancel
        </NERFailButton>
        <NERSuccessButton variant="contained" type="submit" sx={{ mx: 1 }} onClick={onSubmit}>
          Delete
        </NERSuccessButton>
      </DialogActions>
    </Dialog>
  );
};

export default ManufacturerDeleteButtonBlocker;
