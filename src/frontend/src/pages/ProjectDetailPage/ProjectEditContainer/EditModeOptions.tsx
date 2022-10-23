/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import Button from '@mui/material/Button';
import { NERButton } from '../../../components/NERButton';
import styles from '../../../stylesheets/pages/project-detail-page/edit-mode-options.module.css';

interface EditModeOptionsProps {
  exitEditMode: () => void;
}

const EditModeOptions: React.FC<EditModeOptionsProps> = ({ exitEditMode }) => {
  return (
    <div className={styles.editModeOptionsContainer}>
      <Button variant="contained" color="success" type="submit">
        Save
      </Button>
      <NERButton variant="contained" color="error" onClick={exitEditMode}>
        Cancel
      </NERButton>
    </div>
  );
};

export default EditModeOptions;
