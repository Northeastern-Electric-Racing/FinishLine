/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ReactNode, useState } from 'react';
import PageBlock from '../layouts/page-block';
import { Form, Button, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import styles from '../stylesheets/components/check-list.module.css';

interface CheckListProps {
  title: string;
  headerRight?: ReactNode;
  listItems: {
    details: string;
    resolved: boolean;
  }[];
}

const CheckList: React.FC<CheckListProps> = ({ title, headerRight, listItems }) => {
  const [checks, setChecks] = useState(listItems);
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleCheck = (idx: number) => {
    const updatedChecks = checks.map((check, i) => {
      if (i === idx) {
        check.resolved = !check.resolved;
        return check;
      }
      return check;
    });

    setChecks(updatedChecks);
  };

  const renderTooltip = (message: string) => <Tooltip id="button-tooltip">{message}</Tooltip>;

  return (
    <PageBlock title={title} headerRight={headerRight}>
      <Form>
        {checks.map((check, idx) => (
          <div key={idx} className={styles.container}>
            <Form.Check
              label={
                <p
                  style={
                    check.resolved ? { textDecoration: 'line-through' } : { textDecoration: 'none' }
                  }
                >
                  {check.details}
                </p>
              }
              defaultChecked={check.resolved}
              data-testId={`testCheckbox${idx}`}
              onChange={() => handleCheck(idx)}
            />
            {check.resolved ? (
              <OverlayTrigger overlay={renderTooltip('Delete Risk')}>
                <Button variant="danger" data-testId="deleteButton">
                  <FontAwesomeIcon icon={faTrash} />
                </Button>
              </OverlayTrigger>
            ) : (
              <OverlayTrigger overlay={renderTooltip('Convert to CR')}>
                <Button variant="success" data-testId="convertButton">
                  <FontAwesomeIcon icon={faArrowRight} />
                </Button>
              </OverlayTrigger>
            )}
          </div>
        ))}
        <div>
          <Button variant="success" onClick={handleShow}>
            Add New Risk
          </Button>
        </div>
        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Add New Risk</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Control placeholder={'Enter New Risk Here'} />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger" onClick={handleClose}>
              Close
            </Button>
            <Button variant="success" onClick={handleClose}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      </Form>
    </PageBlock>
  );
};

export default CheckList;
