/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';

const styles = {
  button: {
    display: 'flex'
  }
};
interface ActionButtonProps {
  link: string;
  icon: IconDefinition;
  text: string;
}

// Common component for all major action buttons
const ActionButton: React.FC<ActionButtonProps> = ({ link, icon, text }) => {
  return (
    <Link className={'row py-auto px-3 '} to={link} style={{ textDecoration: 'none' }}>
      <Button
        variant="contained"
        style={{ backgroundColor: '#ef4345', textTransform: 'none', fontSize: '15px' }}
      >
        <div style={styles.button}>
          <FontAwesomeIcon className="mr-2 my-auto" icon={icon} size="1x" color="white" />
          {text}
        </div>
      </Button>
    </Link>
  );
};

export default ActionButton;
