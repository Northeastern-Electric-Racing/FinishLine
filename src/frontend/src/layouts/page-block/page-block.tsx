/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ReactNode } from 'react';
import { Card } from 'react-bootstrap';
import { useTheme } from '../../services/theme.hooks';

interface PageBlockProps {
  title: string;
  headerRight?: ReactNode;
}

const styles = {
  header: {
    overflow: 'hidden'
  }
};

/**
 * Custom component for a consistent page-building block.
 * @param title The title of the block on the page
 * @param headerRight The optional stuff to display on the right side of the header
 */
const PageBlock: React.FC<PageBlockProps> = ({ title, headerRight, children }) => {
  const theme = useTheme();

  return (
    <Card className={'mb-3'} border={theme.cardBorder} bg={theme.cardBg}>
      <Card.Body>
        <Card.Title style={styles.header}>
          <h5 className={'float-left mb-0'}>{title}</h5>
          <div className={'float-right'}>{headerRight}</div>
        </Card.Title>
        {children}
      </Card.Body>
    </Card>
  );
};

export default PageBlock;
