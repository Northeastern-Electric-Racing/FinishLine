/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useHistory } from 'react-router-dom';
import { Col, Row } from 'react-bootstrap';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import { routes } from '../../utils/Routes';
import { useAllProjects } from '../../hooks/Projects.hooks';
import { fullNamePipe, wbsPipe, weeksPipe } from '../../utils/Pipes';
import PageTitle from '../../layouts/PageTitle/PageTitle';

/**
 * Table of all projects.
 */
const ProjectsTable: React.FC = () => {
  const history = useHistory();
  const { isLoading, data, error } = useAllProjects();

  const baseColDef: any = {
    flex: 1,
    align: 'center',
    headerAlign: 'center'
  };

  const dollars = (amount: number) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    });
    return formatter.format(amount);
  };

  const columns: GridColDef[] = [
    {
      ...baseColDef,
      field: 'wbsNum',
      headerName: 'WBS #',
      valueFormatter: (params) => wbsPipe(params.value),
      maxWidth: 100,
      sortComparator: (v1, v2, param1, param2) => {
        if (param1.value.carNumber !== param2.value.carNumber) {
          return param1.value.carNumber - param2.value.carNumber;
        } else if (param1.value.projectNumber !== param2.value.projectNumber) {
          return param1.value.projectNumber - param2.value.projectNumber;
        } else if (param1.value.workPackageNumber !== param2.value.workPackageNumber) {
          return param1.value.workPackageNumber - param2.value.workPackageNumber;
        } else {
          return 0;
        }
      }
    },
    {
      ...baseColDef,
      field: 'name',
      headerName: 'Project Name',
      align: 'left'
    },
    {
      ...baseColDef,
      field: 'projectLead',
      headerName: 'Project Lead',
      align: 'left',
      valueFormatter: (params) => fullNamePipe(params.value),
      maxWidth: 250
    },
    {
      ...baseColDef,
      field: 'projectManager',
      headerName: 'Project Manager',
      align: 'left',
      valueFormatter: (params) => fullNamePipe(params.value),
      maxWidth: 250
    },
    {
      ...baseColDef,
      field: 'team',
      headerName: 'Team',
      align: 'left',
      valueFormatter: (params) => params.value?.teamName || 'No Team',
      maxWidth: 200
    },
    {
      ...baseColDef,
      field: 'duration',
      headerName: 'Duration',
      valueFormatter: (params) => weeksPipe(params.value),
      maxWidth: 100
    },
    {
      ...baseColDef,
      field: 'budget',
      headerName: 'Budget',
      align: 'right',
      valueFormatter: (params) => dollars(params.value),
      maxWidth: 100
    },
    {
      ...baseColDef,
      field: 'workPackages',
      headerName: '# Work Packages',
      type: 'number',
      maxWidth: 150,
      valueFormatter: (params) => params.value.length
    },
    {
      ...baseColDef,
      field: 'status',
      headerName: 'Status',
      maxWidth: 100
    }
  ];

  return (
    <>
      <PageTitle title={'Projects'} previousPages={[]} />
      <Row>
        <Col>
          <DataGrid
            autoHeight
            disableSelectionOnClick
            density="compact"
            pageSize={15}
            rowsPerPageOptions={[15, 30, 50, 100]}
            loading={isLoading}
            error={error}
            rows={data || []}
            columns={columns}
            onRowClick={(params) => {
              history.push(`${routes.PROJECTS}/${wbsPipe(params.row.wbsNum)}`);
            }}
            components={{ Toolbar: GridToolbar }}
            initialState={{
              sorting: {
                sortModel: [{ field: 'wbsNum', sort: 'asc' }]
              },
              columns: {
                columnVisibilityModel: {
                  workPackages: false
                }
              }
            }}
          />
        </Col>
      </Row>
    </>
  );
};

export default ProjectsTable;
