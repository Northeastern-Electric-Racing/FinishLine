/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ReactNode, useState } from 'react';
import { Card } from 'react-bootstrap';
import { useTheme } from '../hooks/Theme.hooks';

interface PageBlockProps {
  title: string;
  headerRight?: ReactNode;
}

const styles = {
  header: {
    overflow: 'hidden'
  },
  'down-arrow': {
    border: 'solid black',
    'border-width': '0 2px 2px 0',
    display: 'inline-block',
    padding: '5px',
    transform: 'rotate(45deg)',
    '-webkit-transform': 'rotate(45deg)',
    cursor: 'pointer',
    'border-radius': '0px 0px 2px 0px',
    'border-color': 'white',
    'margin-top': '7px'
  },
  'up-arrow': {
    border: 'solid black',
    'border-width': '0 2px 2px 0',
    display: 'inline-block',
    padding: '5px',
    transform: 'rotate(-135deg)',
    '-webkit-transform': 'rotate(-135deg)',
    cursor: 'pointer',
    'border-radius': '0px 0px 2px 0px',
    'margin-top': '7px'
  }
};

/**
 * Custom component for a consistent page-building block.
 * @param title The title of the block on the page
 * @param headerRight The optional stuff to display on the right side of the header
 */
const PageBlock: React.FC<PageBlockProps> = ({ title, headerRight, children }) => {
  const theme = useTheme();
  const [collapse, setCollapse] = useState(false);

  return (
    <Card className={'mb-3'} border={theme.cardBorder} bg={theme.cardBg}>
      <Card.Body>
        <Card.Title style={styles.header}>
          <h5 className={'float-left mb-0'}>{title}</h5>
          <span
            style={collapse ? styles['up-arrow'] : styles['down-arrow']}
            className={'float-right mx-3 cursor-pointer collapser'}
            onClick={() => setCollapse(!collapse)}
          />
          <div className={'float-right'}>{headerRight}</div>
        </Card.Title>
        {collapse ? '' : children}
      </Card.Body>
    </Card>
  );
};

export default PageBlock;
