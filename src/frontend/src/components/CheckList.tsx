/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import PageBlock from '../layouts/PageBlock';
import { Form } from 'react-bootstrap';
import styles from '../stylesheets/components/CheckList.module.css';
import { ReactNode, useState } from 'react';

export type CheckListItem = {
  details: string;
  resolved: boolean;
};

interface CheckListProps {
  title: string;
  headerRight?: ReactNode;
  items: CheckListItem[];
}

const CheckList: React.FC<CheckListProps> = ({ title, headerRight, items }) => {
  const [checks, setChecks] = useState(items);
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
              onChange={() => handleCheck(idx)}
            />
          </div>
        ))}
      </Form>
    </PageBlock>
  );
};

export default CheckList;
