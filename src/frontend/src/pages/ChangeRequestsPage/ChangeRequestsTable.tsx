/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useHistory } from 'react-router-dom';
import { Col, Container, Row } from 'react-bootstrap';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import { routes } from '../../utils/Routes';
import { booleanPipe, datePipe, fullNamePipe, wbsPipe } from '../../utils/Pipes';
import { useAllChangeRequests } from '../../hooks/change-requests.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import PageTitle from '../../layouts/PageTitle/PageTitle';
import { useAuth } from '../../hooks/auth.hooks';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import Add from '@mui/icons-material/Add';

const ChangeRequestsTable: React.FC = () => {
  const history = useHistory();
  const { isLoading, isError, data, error } = useAllChangeRequests();

  const baseColDef: any = {
    flex: 1,
    align: 'center',
    headerAlign: 'center'
  };

  const auth = useAuth();

  if (isLoading) return <LoadingIndicator />;

  if (isError) return <ErrorPage message={error?.message} />;

  const columns: GridColDef[] = [
    {
      ...baseColDef,
      field: 'crId',
      headerName: 'ID',
      maxWidth: 100
    },
    {
      ...baseColDef,
      field: 'type',
      headerName: 'Type',
      maxWidth: 150
    },
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
      field: 'dateSubmitted',
      headerName: 'Date Submitted',
      valueFormatter: (params) => datePipe(params.value),
      maxWidth: 200
    },
    {
      ...baseColDef,
      field: 'submitter',
      headerName: 'Submitter',
      valueFormatter: (params) => fullNamePipe(params.value),
      maxWidth: 200
    },
    {
      ...baseColDef,
      field: 'dateReviewed',
      headerName: 'Date Reviewed',
      valueFormatter: (params) => (params.value ? datePipe(params.value) : ''),
      maxWidth: 200
    },
    {
      ...baseColDef,
      field: 'reviewer',
      headerName: 'Reviewer',
      valueFormatter: (params) => fullNamePipe(params.value),
      maxWidth: 200
    },
    {
      ...baseColDef,
      field: 'accepted',
      headerName: 'Accepted',
      valueFormatter: (params) => (params.value ? booleanPipe(params.value) : ''),
      maxWidth: 100
    },
    {
      ...baseColDef,
      field: 'dateImplemented',
      headerName: 'Date Implemented',
      valueFormatter: (params) => (params.value ? datePipe(params.value) : ''),
      maxWidth: 200
    },
    {
      ...baseColDef,
      field: 'implementedChanges',
      headerName: '# Implemented Changes',
      valueFormatter: (params) => params.value.length,
      maxWidth: 200
    }
  ];

  return (
    <Container fluid>
      <PageTitle
        title={'Change Requests'}
        previousPages={[]}
        actionButton={
          <Link className={'row py-auto px-3 '} to={routes.CHANGE_REQUESTS_NEW} style={{ textDecoration: 'none' }}>
            <Button variant="text">
              New Change Request
              <IconButton onClick={() => (window.location.href = routes.CHANGE_REQUESTS_NEW)}>
                <Add />
              </IconButton>
            </Button>
          </Link>
        }
      />
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
            getRowId={(row) => row.crId}
            onRowClick={(params) => {
              history.push(`${routes.CHANGE_REQUESTS}/${params.row.crId}`);
            }}
            components={{ Toolbar: GridToolbar }}
            initialState={{
              sorting: {
                sortModel: [{ field: 'crId', sort: 'desc' }]
              },
              columns: {
                columnVisibilityModel: {
                  implementedChanges: false
                }
              }
            }}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default ChangeRequestsTable;
