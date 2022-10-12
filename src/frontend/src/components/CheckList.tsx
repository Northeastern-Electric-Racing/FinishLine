/*
 * This file is part of FinishLine by NER and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import PageBlock from '../layouts/PageBlock';
import { Form } from 'react-bootstrap';
import styles from '../stylesheets/components/CheckList.module.css';
import { ReactNode } from 'react';
import { useCheckDescriptionBullet } from '../hooks/description-bullets.hooks';
import LoadingIndicator from './LoadingIndicator';
import { useAuth } from '../hooks/Auth.hooks';

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
  const { isLoading, mutateAsync } = useCheckDescriptionBullet();

  if (isLoading) return <LoadingIndicator />;

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
              onChange={() => handleCheck(idx)}
            />
          </div>
        ))}
      </Form>
    </PageBlock>
  );
};

export default CheckList;
