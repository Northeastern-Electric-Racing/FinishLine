import { SubmitHandler, SubmitErrorHandler } from 'react-hook-form';
import NERFormModal from '../../../components/NERFormModal';
import { Box } from '@mui/system';
import NERModal from '../../../components/NERModal';

interface FinalizeDesignReviewProps {
  open: boolean;
  setOpen: (val: boolean) => void;
  onSubmit?: () => void;
}

const FinalizeDesignReviewModal = ({ open, setOpen, onSubmit }: FinalizeDesignReviewProps) => {
  const handleClose = () => {
    setOpen(false); // Close the modal by setting open to false
  };

  return (
    <NERModal 
      open={open} 
      title={''} 
      onHide={handleClose} // Call handleClose function to close the modal
      onSubmit={onSubmit}
    >
      <div>
        <div>
          <label>
            Add Doc Template:
            <input type="text" name="link" />
          </label>
        </div>
        <div>
          <div>
            <label>
              Meeting Type:
              <input type="checkbox" name="checkbox1" />
              Virtual
            </label>

            <label>
              <input type="checkbox" name="checkbox2" />
              In-person
            </label>
          </div>

          <label>
            Location:
            <select name="Location">
              <option value="location1">The Bay</option>
              <option value="location2">WVF</option>
              <option value="location3">Khoury College</option>
            </select>
          </label>
        </div>
      </div>
    </NERModal>
  );
};

export default FinalizeDesignReviewModal;
