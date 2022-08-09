/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import React, { useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { ChangeRequest, ChangeRequestExplanation, StandardChangeRequest } from 'shared';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { routes } from '../../routes';
import { booleanPipe, datePipe, fullNamePipe, wbsPipe } from '../../pipes';
import { useAllChangeRequests } from '../../services/change-requests.hooks';
import { DisplayChangeRequest } from './change-requests-table/change-requests-table';
import CRTable from './change-requests-table/change-requests-table'; // Directly rename the default import
import ChangeRequestsFilter from './change-requests-filter/change-requests-filter';
import LoadingIndicator from '../../components/loading-indicator/loading-indicator';
import ActionButton from '../../components/action-button/action-button';
import ErrorPage from '../../pages/ErrorPage/error-page';
import PageTitle from '../../layouts/page-title/page-title';

/***
 * Returns a list of change requests that has been filtered according to the given params.
 * @param changeRequests The list of projects to filter.
 * @param type The category under which the change request falls.
 * @param impact The parts of the project the change will impact.
 * @param whyType A why type of the change request.
 * @param state The state of review of the CR.
 * @param implemented Whether or not the CR has been implemented.
 * @return The filtered list of change requests.
 */
export function filterCRs(
  changeRequests: ChangeRequest[],
  type: string,
  impact: number[],
  whyType: string,
  state: number[],
  implemented: string
): ChangeRequest[] {
  // Type filter
  if (type !== '') {
    changeRequests = changeRequests.filter(
      (changeRequest: ChangeRequest) => changeRequest.type === type
    );
  }

  // Impact Filter
  if (impact.length !== 0) {
    changeRequests = changeRequests.filter((changeRequest: ChangeRequest) => {
      let filterBool = false;
      const standard = changeRequest as StandardChangeRequest;
      if (impact.indexOf(0) !== -1) {
        filterBool =
          filterBool || (standard.scopeImpact !== '' && standard.scopeImpact !== undefined);
      }
      if (impact.indexOf(1) !== -1) {
        filterBool =
          filterBool || (standard.budgetImpact !== 0 && standard.budgetImpact !== undefined);
      }
      if (impact.indexOf(2) !== -1) {
        filterBool =
          filterBool || (standard.timelineImpact !== 0 && standard.timelineImpact !== undefined);
      }
      return filterBool;
    });
  }

  // State filter
  if (state.length !== 0) {
    changeRequests = changeRequests.filter((changeRequest: ChangeRequest) => {
      let filterBool = false;
      if (state.indexOf(0) !== -1) {
        filterBool = filterBool || changeRequest.dateReviewed === undefined;
      }
      if (state.indexOf(1) !== -1) {
        filterBool = filterBool || changeRequest.accepted === true;
      }
      if (state.indexOf(2) !== -1) {
        filterBool = filterBool || changeRequest.accepted === false;
      }
      return filterBool;
    });
  }

  // whyType filter
  if (whyType !== '') {
    changeRequests = changeRequests.filter((changeRequest: ChangeRequest) => {
      const standard = changeRequest as StandardChangeRequest;
      if (standard.why === undefined) {
        return false;
      }
      return (
        standard.why.filter((exp: ChangeRequestExplanation) => {
          if (exp.type === whyType) {
            return exp.explain !== '';
          }
          return false;
        }).length !== 0
      );
    });
  }

  // Implemented Filter
  if (implemented !== '') {
    changeRequests = changeRequests.filter(
      (changeRequest: ChangeRequest) =>
        (implemented === 'Yes') === (changeRequest.dateImplemented !== undefined)
    );
  }

  return changeRequests;
}

const ChangeRequestsTable: React.FC = () => {
  const [type, setType] = useState('');
  const [impact, setImpact] = useState<number[]>([]);
  const [whyType, setWhyType] = useState('');
  const [state, setState] = useState<number[]>([]);
  const [implemented, setImplemented] = useState('');
  const { isLoading, isError, data, error } = useAllChangeRequests();

  if (isLoading) return <LoadingIndicator />;

  if (isError) return <ErrorPage message={error?.message} />;

  const transformToDisplayChangeRequests = (changeRequests: ChangeRequest[]) => {
    return changeRequests.map((cr: ChangeRequest) => {
      return {
        id: cr.crId,
        dateSubmitted: datePipe(cr.dateSubmitted),
        submitterName: fullNamePipe(cr.submitter),
        wbsNum: wbsPipe(cr.wbsNum),
        type: cr.type,
        dateReviewed: cr.dateReviewed ? datePipe(new Date(cr.dateReviewed)) : '',
        accepted: cr.accepted !== undefined ? booleanPipe(cr.accepted) : '',
        dateImplemented: cr.dateImplemented ? datePipe(new Date(cr.dateImplemented)) : ''
      };
    }) as DisplayChangeRequest[];
  };

  const sendDataToParent = (
    type: string,
    impact: number[],
    whyType: string,
    state: number[],
    implemented: string
  ) => {
    setType(type);
    setImpact(impact);
    setWhyType(whyType);
    setState(state);
    setImplemented(implemented);
  };
  return (
    <Container fluid>
      <PageTitle
        title={'Change Requests'}
        previousPages={[]}
        actionButton={
          <ActionButton
            link={routes.CHANGE_REQUESTS_NEW}
            icon={faPlus}
            text={'New Change Request'}
          />
        }
      />
      <Row>
        <Col sm={4} md={3} lg={3} xl={2}>
          <ChangeRequestsFilter update={sendDataToParent} />
        </Col>
        <Col>
          <CRTable
            changeRequests={transformToDisplayChangeRequests(
              filterCRs(data!, type, impact, whyType, state, implemented)
            )}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default ChangeRequestsTable;
