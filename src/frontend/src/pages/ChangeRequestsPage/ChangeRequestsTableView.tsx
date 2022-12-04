/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useHistory } from 'react-router-dom';
import BootstrapTable, { ColumnDescription, RowEventHandlerProps, SortOrder } from 'react-bootstrap-table-next';
import { routes } from '../../utils/Routes';

export interface DisplayChangeRequest {
  id: number;
  dateSubmitted: string;
  submitterName: string;
  wbsNum: string;
  type: string;
  dateReviewed: string;
  accepted: string;
  dateImplemented: string;
}

interface ChangeRequestsTableProps {
  changeRequests: DisplayChangeRequest[];
}

/**
 * Interactive table for displaying all change request data.
 */
const ChangeRequestsTableView: React.FC<ChangeRequestsTableProps> = ({ changeRequests }: ChangeRequestsTableProps) => {
  const history = useHistory();

  // Configures display options for all data columns
  const columns: ColumnDescription[] = [
    {
      headerAlign: 'center',
      dataField: 'id',
      text: 'ID',
      align: 'center',
      sort: true,
      headerStyle: { overflowWrap: 'anywhere' }
    },
    {
      headerAlign: 'center',
      dataField: 'dateSubmitted',
      text: 'Date Submitted',
      align: 'left',
      sort: true,
      headerStyle: { overflowWrap: 'anywhere' }
    },
    {
      headerAlign: 'center',
      dataField: 'submitterName',
      text: 'Submitter',
      align: 'left',
      sort: true,
      headerStyle: { overflowWrap: 'anywhere' }
    },
    {
      headerAlign: 'center',
      dataField: 'wbsNum',
      text: 'WBS #',
      align: 'left',
      sort: true,
      headerStyle: { overflowWrap: 'anywhere' }
    },
    {
      headerAlign: 'center',
      dataField: 'type',
      text: 'Type',
      align: 'left',
      sort: true,
      headerStyle: { overflowWrap: 'anywhere' }
    },
    {
      headerAlign: 'center',
      dataField: 'dateReviewed',
      text: 'Reviewed',
      align: 'left',
      sort: true,
      headerStyle: { overflowWrap: 'anywhere' }
    },
    {
      headerAlign: 'center',
      dataField: 'accepted',
      text: 'Accepted',
      align: 'center',
      sort: true,
      headerStyle: { overflowWrap: 'anywhere' }
    },
    {
      headerAlign: 'center',
      dataField: 'dateImplemented',
      text: 'Implemented',
      align: 'left',
      sort: true,
      headerStyle: { overflowWrap: 'anywhere' }
    }
  ];

  const defaultSort: [{ dataField: any; order: SortOrder }] = [
    {
      dataField: 'id',
      order: 'desc'
    }
  ];

  // define what happens during various row events
  const rowEvents: RowEventHandlerProps = {
    onClick: (e, row, rowIndex) => {
      history.push(`${routes.CHANGE_REQUESTS}/${row.id}`);
    }
  };

  return (
    <>
      <BootstrapTable
        striped
        hover
        condensed
        bootstrap4={true}
        keyField="id"
        data={changeRequests}
        columns={columns}
        defaultSorted={defaultSort}
        rowEvents={rowEvents}
        noDataIndication="No Change Requests to Display"
        rowStyle={{ cursor: 'pointer', overflowWrap: 'anywhere' }}
      />
    </>
  );
};

export default ChangeRequestsTableView;
