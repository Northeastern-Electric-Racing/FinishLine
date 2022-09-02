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
      maxWidth: 100
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
      valueFormatter: (params) => fullNamePipe(params.value),
      maxWidth: 250
    },
    {
      ...baseColDef,
      field: 'projectManager',
      headerName: 'Project Manager',
      valueFormatter: (params) => fullNamePipe(params.value),
      maxWidth: 250
    },
    {
      ...baseColDef,
      field: 'team',
      headerName: 'Team',
      valueFormatter: (params) => params.value?.teamName || 'No Team'
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
