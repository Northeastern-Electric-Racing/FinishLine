/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 *
 */

import {
  faCoins,
  faReceipt,
  faHandHoldingUsd,
  faDollarSign,
  faFileAlt,
  faSortNumericDown,
  faCogs
} from '@fortawesome/free-solid-svg-icons';
import { Container, Row } from 'react-bootstrap';
import ExternalLink from '../../../components/external-link/external-link';
import PageBlock from '../../../layouts/page-block/page-block';

const UsefulLinks: React.FC = () => {
  const links = [
    <ExternalLink
      icon={faCoins}
      description={'Purchasing Guidelines'}
      link={'https://docs.google.com/document/d/1M5Ldy9L1BifBo18tdKpv3CH-frRneyEK26hUXbtMg7Q/edit'}
    />,
    <ExternalLink
      icon={faHandHoldingUsd}
      description={'Reimbursement Guidelines'}
      link={'https://docs.google.com/document/d/1HvLnVNzZTftgoAXppIEp-gTmUBQGt-V6n97prziWWrs/edit'}
    />,
    <ExternalLink
      icon={faDollarSign}
      description={'Procurement Form'}
      link={'https://forms.gle/6ztRoa1iL7p1KHwP6'}
    />,
    <ExternalLink
      icon={faReceipt}
      description={'McMaster Order Sheet'}
      link={
        'https://docs.google.com/spreadsheets/d/1kqpnw8jZDx2GO5NFUtqefRXqT1XX46iMx5ZI4euPJgY/edit'
      }
    />,
    <ExternalLink
      icon={faFileAlt}
      description={'Project Update Log'}
      link={'https://docs.google.com/document/d/1w0B6upZRY28MlbVA4hyU3X_NRNP0cagmLWqjHn6B8OA/edit'}
    />,
    <ExternalLink
      icon={faSortNumericDown}
      description={'Part Numbering Guidelines'}
      link={'https://docs.google.com/document/d/1Y8IXCvYjXP3RBj6h4-xLCHXVLW5R6pi3-4i5SYMKtZY/edit'}
    />,
    <ExternalLink
      icon={faCogs}
      description={'Hardware Guidelines'}
      link={'https://docs.google.com/document/d/1OD1d1VaIEHCwiFCuU7wfwAPu-UA--0_QzbyJjBsexwg/edit'}
    />
  ];

  return (
    <PageBlock title={'Useful Links'}>
      <Container fluid>
        <Row>{links}</Row>
      </Container>
    </PageBlock>
  );
};

export default UsefulLinks;
