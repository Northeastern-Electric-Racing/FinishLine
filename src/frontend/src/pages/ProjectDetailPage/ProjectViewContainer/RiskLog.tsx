/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Risk } from '../../../../../shared/src/types/risk-types';
import { useState } from 'react';
import PageBlock from '../../../layouts/PageBlock';
import { Form, Button, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import styles from '../../../stylesheets/components/RiskLog.module.css';
import {
  useCreateSingleRisk,
  useEditSingleRisk,
  useDeleteSingleRisk,
  useGetRisksForProject
} from '../../../hooks/Risks.hooks';
import { useAuth } from '../../../hooks/Auth.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';

interface RiskLogProps {
  projectId: number;
}

const sortRisksByDate = (a: Risk, b: Risk) => {
  return new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime();
};

const RiskLog: React.FC<RiskLogProps> = ({ projectId }) => {
  const auth = useAuth();
  const { userId } = auth.user!;

  const { mutateAsync: createMutateAsync } = useCreateSingleRisk();
  const { mutateAsync: editMutateAsync } = useEditSingleRisk();
  const { mutateAsync: deleteMutateAsync } = useDeleteSingleRisk();

  const [newDetail, setNewDetail] = useState('');
  const [show, setShow] = useState(false);
  const risksQuery = useGetRisksForProject(projectId);

  if (risksQuery.isLoading) return <LoadingIndicator />;

  const risks = [
    ...risksQuery.data!.filter((r) => !r.dateDeleted && !r.isResolved).sort(sortRisksByDate),
    ...risksQuery.data!.filter((r) => !r.dateDeleted && r.isResolved).sort(sortRisksByDate)
  ];

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleCheck = async (risk: Risk) => {
    const payload = {
      userId: userId,
      id: risk.id,
      detail: risk.detail,
      resolved: !risk.isResolved
    };
    try {
      await editMutateAsync(payload);
    } catch (e) {
      if (e instanceof Error) {
        console.log(e);
        alert(e.message);
      }
    }
  };

  const handleCreate = async () => {
    const payload = {
      projectId: projectId,
      createdById: userId,
      detail: newDetail
    };

    try {
      await createMutateAsync(payload);
      handleClose();
    } catch (e) {
      if (e instanceof Error) {
        alert(e.message);
      }
    }
  };

  const handleDelete = async (id: string) => {
    const payload = {
      riskId: id,
      deletedByUserId: userId
    };

    try {
      await deleteMutateAsync(payload);
    } catch (e) {
      if (e instanceof Error) {
        alert(e.message);
      }
    }
  };

  const renderTooltip = (message: string) => <Tooltip id="button-tooltip">{message}</Tooltip>;

  return (
    <PageBlock title={'Risk Log'}>
      <Form>
        {risks.map((risk, idx) => (
          <div key={idx} className={styles.container}>
            <Form.Check
              label={
                <p
                  style={
                    risk.isResolved
                      ? { textDecoration: 'line-through' }
                      : { textDecoration: 'none' }
                  }
                >
                  {risk.detail}
                </p>
              }
              checked={risk.isResolved}
              data-testId={`testCheckbox${idx}`}
              onChange={() => handleCheck(risk)}
            />
            {risk.isResolved ? (
              <OverlayTrigger overlay={renderTooltip('Delete Risk')}>
                <Button
                  variant="danger"
                  data-testId="deleteButton"
                  onClick={() => handleDelete(risk.id)}
                >
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
            <Form.Control
              placeholder={'Enter New Risk Here'}
              onChange={(e) => setNewDetail(e.target.value)}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger" onClick={handleClose}>
              Close
            </Button>
            <Button variant="success" onClick={handleCreate}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      </Form>
    </PageBlock>
  );
};

export default RiskLog;
