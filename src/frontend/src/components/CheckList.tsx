/*
 * This file is part of FinishLine by NER and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import PageBlock from '../layouts/PageBlock';
import { Button, Form, Modal } from 'react-bootstrap';
import styles from '../stylesheets/components/check-list.module.css';
import { ReactNode, useState } from 'react';
import { useCheckDescriptionBullet } from '../hooks/description-bullets.hooks';
import { useAuth } from '../hooks/auth.hooks';

export type CheckListItem = {
  id: number;
  detail: string;
  resolved: boolean;
};

interface CheckListProps {
  title: string;
  headerRight?: ReactNode;
  items: CheckListItem[];
}

const CheckList: React.FC<CheckListProps> = ({ title, headerRight, items }) => {
  const auth = useAuth();
  const { mutateAsync } = useCheckDescriptionBullet();
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [currIdx, setCurrIdx] = useState<number>(-1);

  const handleUncheck = async (idx: number) => {
    await handleCheck(idx);
    setShowConfirm(false);
  };

  const handleCheck = async (idx: number) => {
    await mutateAsync({ userId: auth.user!.userId, descriptionId: items[idx].id });
  };

  return (
    <PageBlock title={title} headerRight={headerRight}>
      <Form>
        {items.map((check, idx) => (
          <div key={idx} className={styles.container}>
            <Form.Check
              label={
                <p style={check.resolved ? { textDecoration: 'line-through' } : { textDecoration: 'none' }}>
                  {check.detail}
                </p>
              }
              checked={check.resolved}
              onChange={() => {
                if (check.resolved) {
                  setCurrIdx(idx);
                  setShowConfirm(true);
                } else {
                  handleCheck(idx);
                }
              }}
            />
          </div>
        ))}
      </Form>
      {showConfirm ? (
        <Modal size="lg" centered show={showConfirm} onHide={() => setShowConfirm(false)}>
          <Modal.Header closeButton>
            <Modal.Title> Are you sure you want to mark this completed task as NOT completed?</Modal.Title>
          </Modal.Header>
          <Modal.Footer className="justify-content-around">
            <Button onClick={() => handleUncheck(currIdx)} variant="success" type="submit" className="mb-3">
              Yes
            </Button>
            <Button onClick={() => setShowConfirm(false)} variant="danger" className="mb-3">
              No
            </Button>
          </Modal.Footer>
        </Modal>
      ) : null}
    </PageBlock>
  );
};

export default CheckList;
