/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const styles = {
  button: {
    display: 'flex'
  },
  buttonText: {
    color: 'white'
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
      <Button>
        <div style={styles.button}>
          <FontAwesomeIcon className="mr-2 my-auto" icon={icon} size="1x" color="white" />
          <p className="mb-0" style={styles.buttonText}>
            {text}
          </p>
        </div>
      </Button>
    </Link>
  );
};

export default ActionButton;
