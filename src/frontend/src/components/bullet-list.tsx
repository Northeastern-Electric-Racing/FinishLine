/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ReactNode } from 'react';
import PageBlock from '../layouts/page-block';

interface BulletListProps {
  title: string;
  headerRight?: ReactNode;
  list: ReactNode[];
  ordered?: boolean;
  readOnly?: boolean;
  fieldName?: string;
}

const styles = {
  bulletList: {
    paddingLeft: '200px',
    marginBottom: '0em'
  }
};

const BulletList: React.FC<BulletListProps> = ({ title, headerRight, list, ordered }) => {
  const listPrepared = list.map((bullet, idx) => <li key={idx}>{bullet}</li>);
  let builtList = <ul style={styles.bulletList}>{listPrepared}</ul>;
  if (ordered) {
    builtList = <ol style={styles.bulletList}>{listPrepared}</ol>;
  }
  return (
    <PageBlock title={title} headerRight={headerRight}>
      {builtList}
    </PageBlock>
  );
};

export default BulletList;
