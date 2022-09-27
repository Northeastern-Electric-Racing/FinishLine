/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ReactNode } from 'react';
import { Card } from 'react-bootstrap';
import { useTheme } from '../hooks/Theme.hooks';

interface PageBlockProps {
  title: string;
  headerRight?: ReactNode;
  cardContainerStyle?: string;
  cardBodyStyle?: string;
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
const PageBlock: React.FC<PageBlockProps> = ({
  title,
  headerRight,
  children,
  cardContainerStyle = 'mb-3',
  cardBodyStyle = ''
}) => {
  const theme = useTheme();

  return (
    <Card className={'mb-3'} border={theme.cardBorder} bg={theme.cardBg}>
      <Card.Body className={cardBodyStyle}>
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
