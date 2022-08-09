/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import React, { ReactElement, useState } from 'react';
import { Button, Col, Container, Dropdown, DropdownButton, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  ActivationChangeRequest,
  ChangeRequest,
  ChangeRequestType,
  StageGateChangeRequest,
  StandardChangeRequest
} from 'shared';
import { routes } from '../../../routes';
import { datePipe, fullNamePipe, wbsPipe } from '../../../pipes';
import ActivationDetails from './type-specific-details/activation-details/activation-details';
import StageGateDetails from './type-specific-details/stage-gate-details/stage-gate-details';
import ImplementedChangesList from './implemented-changes-list/implemented-changes-list';
import StandardDetails from './type-specific-details/standard-details/standard-details';
import ReviewChangeRequest from '../ReviewChangeRequestModal/review-change-request';
import PageTitle from '../../../layouts/page-title/page-title';
import PageBlock from '../../../layouts/page-block/page-block';
import ReviewNotes from './review-notes/review-notes';

const convertStatus = (cr: ChangeRequest): string => {
  if (cr.dateImplemented) {
    return 'Implemented';
  }
  if (cr.dateReviewed && cr.accepted) {
    return 'Accepted';
  }
  if (cr.dateReviewed && !cr.accepted) {
    return 'Denied';
  }
  return 'Open';
};

const buildDetails = (cr: ChangeRequest): ReactElement => {
  switch (cr.type) {
    case ChangeRequestType.Activation:
      return <ActivationDetails cr={cr as ActivationChangeRequest} />;
    case ChangeRequestType.StageGate:
      return <StageGateDetails cr={cr as StageGateChangeRequest} />;
    default:
      return <StandardDetails cr={cr as StandardChangeRequest} />;
  }
};

interface ChangeRequestDetailsProps {
  isUserAllowedToReview: boolean;
  isUserAllowedToImplement: boolean;
  changeRequest: ChangeRequest;
}

const ChangeRequestDetails: React.FC<ChangeRequestDetailsProps> = ({
  isUserAllowedToReview,
  isUserAllowedToImplement,
  changeRequest
}: ChangeRequestDetailsProps) => {
  const [modalShow, setModalShow] = useState<boolean>(false);
  const handleClose = () => setModalShow(false);
  const handleOpen = () => setModalShow(true);

  const reviewBtn = (
    <Button variant="primary" onClick={handleOpen} disabled={!isUserAllowedToReview}>
      Review
    </Button>
  );

  const implementCrDropdown = (
    <DropdownButton id="implement-cr-dropdown" title="Implement Change Request">
      <Dropdown.Item as={Link} to={routes.PROJECTS_NEW} disabled={!isUserAllowedToImplement}>
        Create New Project
      </Dropdown.Item>
      <Dropdown.Item as={Link} to={routes.WORK_PACKAGE_NEW} disabled={!isUserAllowedToImplement}>
        Create New Work Package
      </Dropdown.Item>
    </DropdownButton>
  );

  let actionDropdown = <></>;
  if (changeRequest.accepted === undefined) actionDropdown = reviewBtn;
  if (changeRequest.accepted!) actionDropdown = implementCrDropdown;
  const spacer = 'mb-2';

  return (
    <Container fluid>
      <PageTitle
        title={`Change Request #${changeRequest.crId}`}
        previousPages={[{ name: 'Change Requests', route: routes.CHANGE_REQUESTS }]}
        actionButton={actionDropdown}
      />
      <PageBlock
        title={'Change Request Details'}
        headerRight={<b>{convertStatus(changeRequest)}</b>}
      >
        <Container fluid>
          <Row>
            <Col className={spacer} xs={4} sm={4} md={3} lg={2} xl={2}>
              <b>Type</b>
            </Col>
            <Col className={spacer}>{changeRequest.type}</Col>
          </Row>
          <Row>
            <Col className={spacer} xs={4} sm={4} md={3} lg={2} xl={2}>
              <b>WBS #</b>
            </Col>
            <Col className={spacer}>
              <Link to={`${routes.PROJECTS}/${wbsPipe(changeRequest.wbsNum)}`}>
                {wbsPipe(changeRequest.wbsNum)}
              </Link>
            </Col>
          </Row>
          <Row>
            <Col className={spacer} xs={4} sm={4} md={3} lg={2} xl={2}>
              <b>Submitted By</b>
            </Col>
            <Col className={spacer} xs={5} sm={5} md={4} lg={3} xl={2}>
              {fullNamePipe(changeRequest.submitter)}
            </Col>
            <Col className={spacer}>{datePipe(changeRequest.dateSubmitted)}</Col>
          </Row>
        </Container>
      </PageBlock>
      {buildDetails(changeRequest)}
      <ReviewNotes
        reviewer={changeRequest.reviewer}
        reviewNotes={changeRequest.reviewNotes}
        dateReviewed={changeRequest.dateReviewed}
      />
      <ImplementedChangesList
        changes={changeRequest.implementedChanges || []}
        overallDateImplemented={changeRequest.dateImplemented}
      />
      {modalShow && <ReviewChangeRequest modalShow={modalShow} handleClose={handleClose} />}
    </Container>
  );
};

export default ChangeRequestDetails;
