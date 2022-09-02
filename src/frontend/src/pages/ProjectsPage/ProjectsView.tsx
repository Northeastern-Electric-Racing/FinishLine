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

  const columns: GridColDef[] = [
    {
      field: 'wbsNum',
      headerName: 'WBS #',
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => wbsPipe(params.value),
      maxWidth: 100
    },
    {
      field: 'name',
      headerName: 'Project Name',
      flex: 1,
      align: 'left',
      headerAlign: 'center',
      maxWidth: 300
    },
    {
      field: 'projectLead',
      headerName: 'Project Lead',
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => fullNamePipe(params.value),
      maxWidth: 250
    },
    {
      field: 'projectManager',
      headerName: 'Project Manager',
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => fullNamePipe(params.value),
      maxWidth: 250
    },
    {
      field: 'duration',
      headerName: 'Duration',
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      type: 'number',
      maxWidth: 100
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      align: 'center',
      headerAlign: 'center',
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
