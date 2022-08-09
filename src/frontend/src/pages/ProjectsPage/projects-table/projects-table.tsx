/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useHistory } from 'react-router-dom';
import BootstrapTable, {
  ColumnDescription,
  RowEventHandlerProps,
  SortOrder
} from 'react-bootstrap-table-next';
import { validateWBS } from 'shared';

export interface DisplayProject {
  wbsNum: string;
  name: string;
  projectLead: string;
  projectManager: string;
  duration: string;
}

interface DisplayProjectProps {
  allProjects: DisplayProject[];
}

/**
 * Custom sorting order for wbsNums according to car, then project, then workPackage.
 * @param a 1st wbsNum in string form
 * @param b 2nd wbsNum in string form
 * @param order Imported SortOrder values 'asc' or 'desc'
 * @return number A number describing the value of a relative to b,
 *                according to the specified SortOrder.
 */
export function wbsNumSort(a: string, b: string, order: SortOrder) {
  const wbs_a = validateWBS(a);
  const wbs_b = validateWBS(b);
  if (wbs_a.carNumber !== wbs_b.carNumber) {
    if (order === 'asc') {
      return wbs_a.carNumber - wbs_b.carNumber;
    }
    return wbs_b.carNumber - wbs_a.carNumber;
  }
  if (wbs_a.projectNumber !== wbs_b.projectNumber) {
    if (order === 'asc') {
      return wbs_a.projectNumber - wbs_b.projectNumber;
    }
    return wbs_b.projectNumber - wbs_a.projectNumber;
  }
  if (wbs_a.workPackageNumber !== wbs_b.workPackageNumber) {
    if (order === 'asc') {
      return wbs_a.workPackageNumber - wbs_b.workPackageNumber;
    }
    return wbs_b.workPackageNumber - wbs_a.workPackageNumber;
  }
  return 0; // Both wbsNums are exactly equal.
}

/**
 * Interactive table for displaying all projects table data.
 */
const ProjectsTable: React.FC<DisplayProjectProps> = ({ allProjects }: DisplayProjectProps) => {
  const history = useHistory();

  // Configures display options for all data columns
  const columns: ColumnDescription[] = [
    {
      headerAlign: 'center',
      dataField: 'wbsNum',
      text: 'WBS #',
      align: 'center',
      sort: true,
      sortFunc: wbsNumSort
    },
    {
      headerAlign: 'center',
      dataField: 'name',
      text: 'Name',
      align: 'left',
      sort: true
    },
    {
      headerAlign: 'center',
      dataField: 'projectLead',
      text: 'Project Lead',
      align: 'left',
      sort: true
    },
    {
      headerAlign: 'center',
      dataField: 'projectManager',
      text: 'Project Manager',
      align: 'left',
      sort: true
    },
    {
      headerAlign: 'center',
      dataField: 'duration',
      text: 'Duration',
      align: 'center',
      sort: true
    }
  ];

  const defaultSort: [{ dataField: any; order: SortOrder }] = [
    {
      dataField: 'wbsNum',
      order: 'asc'
    }
  ];

  // define what happens during various row events
  const rowEvents: RowEventHandlerProps = {
    onClick: (e, row, rowIndex) => {
      history.push(`/projects/${row.wbsNum}`);
    }
  };

  return (
    <>
      <BootstrapTable
        striped
        hover
        condensed
        bootstrap4
        keyField="wbsNum"
        data={allProjects}
        columns={columns}
        defaultSorted={defaultSort}
        rowEvents={rowEvents}
        noDataIndication="No Projects to Display"
        rowStyle={{ cursor: 'pointer' }}
      />
    </>
  );
};

export default ProjectsTable;
