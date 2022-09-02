/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Col, Container, Row } from 'react-bootstrap';
import { useAllProjects } from '../../hooks/Projects.hooks';
import { fullNamePipe, wbsPipe } from '../../utils/Pipes';
import PageTitle from '../../layouts/PageTitle/PageTitle';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

/**
 * Parent component for the projects page housing the filter table and projects table.
 */
const ProjectsView: React.FC = () => {
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
      type: 'number',
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
      field: 'status',
      headerName: 'Status',
      maxWidth: 100
    }
  ];

  return (
    <Container fluid>
      <PageTitle title={'Projects'} previousPages={[]} />
      <Row>
        <Col>
          <DataGrid
            density="compact"
            pageSize={15}
            rowsPerPageOptions={[15, 30, 50, 100]}
            autoHeight
            loading={isLoading}
            error={error}
            rows={data || []}
            columns={columns}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default ProjectsView;
