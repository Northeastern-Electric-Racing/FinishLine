/*
 * This file is part of FinishLine by NER and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import PageBlock from '../layouts/PageBlock';
import { Form } from 'react-bootstrap';
import styles from '../stylesheets/components/check-list.module.css';
import { ReactNode } from 'react';
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
  isDisabled: boolean;
}

const CheckList: React.FC<CheckListProps> = ({ title, headerRight, items, isDisabled }) => {
  const auth = useAuth();
  const { mutateAsync } = useCheckDescriptionBullet();

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
              disabled={isDisabled}
              onChange={() => handleCheck(idx)}
            />
          </div>
        ))}
      </Form>
    </PageBlock>
  );
};

export default CheckList;
