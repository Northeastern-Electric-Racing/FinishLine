/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Button } from '@mui/material';
import styles from '../../../stylesheets/pages/edit-mode-options.module.css';

interface EditModeOptionsProps {
  exitEditMode: () => void;
}

const EditModeOptions = ({ exitEditMode }: EditModeOptionsProps) => {
  return (
    <div className={styles.editModeOptionsContainer}>
      <Button type="submit" color="success" variant="contained">
        Save
      </Button>
      <Button color="error" variant="contained" onClick={exitEditMode}>
        Cancel
      </Button>
    </div>
  );
};

export default EditModeOptions;
