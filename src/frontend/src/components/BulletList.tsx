/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ReactNode } from 'react';
import { Typography } from '@mui/material';

interface BulletListProps {
  title: string;
  headerRight?: ReactNode;
  list: ReactNode[];
  ordered?: boolean;
  readOnly?: boolean;
  fieldName?: string;
  defaultClosed?: boolean;
}

const styles = {
  bulletList: {
    paddingLeft: '35px',
    marginBottom: '0em'
  }
};

const BulletList: React.FC<BulletListProps> = ({ title, headerRight, list, ordered, defaultClosed }) => {
  const listPrepared = list.map((bullet, idx) => <li key={idx}>{bullet}</li>);
  let builtList = <ul style={styles.bulletList}>{listPrepared}</ul>;
  if (ordered) {
    builtList = <ol style={styles.bulletList}>{listPrepared}</ol>;
  }
  return <Typography variant="h3">{builtList}</Typography>;
};

export default BulletList;
