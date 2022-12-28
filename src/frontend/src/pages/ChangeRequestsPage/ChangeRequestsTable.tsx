/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useHistory } from 'react-router-dom';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import { routes } from '../../utils/routes';
import { datePipe, fullNamePipe, wbsPipe } from '../../utils/pipes';
import { useAllChangeRequests } from '../../hooks/change-requests.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { Add } from '@mui/icons-material';
import PageTitle from '../../layouts/PageTitle/PageTitle';
import { useAuth } from '../../hooks/auth.hooks';
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';
import { useTheme } from '@mui/system';
import { useState } from 'react';
import { ChangeRequestType } from 'shared';

const ChangeRequestsTable: React.FC = () => {
  const history = useHistory();
  const { isLoading, isError, data, error } = useAllChangeRequests();
  const [pageSize, setPageSize] = useState(50);

  const baseColDef: any = {
    flex: 1,
    align: 'center',
    headerAlign: 'center'
  };

  const auth = useAuth();
  const theme = useTheme();

  if (isLoading) return <LoadingIndicator />;

  if (isError) return <ErrorPage message={error?.message} />;

  const columns: GridColDef[] = [
    {
      ...baseColDef,
      field: 'crId',
      type: 'number',
      headerName: 'ID',
      maxWidth: 100
    },
    {
      ...baseColDef,
      field: 'type',
      type: 'singleSelect',
      valueOptions: Object.values(ChangeRequestType),
      headerName: 'Type',
      maxWidth: 150
    },
    { ...baseColDef, field: 'carNumber', headerName: 'Car #', type: 'number', maxWidth: 50 },
    {
      ...baseColDef,
      field: 'wbsNum',
      headerName: 'WBS #',
      filterable: false,
      maxWidth: 100,
      valueFormatter: (params) => wbsPipe(params.value),
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
      type: 'date',
      valueFormatter: (params) => datePipe(params.value),
      maxWidth: 200
    },
    {
      ...baseColDef,
      field: 'submitter',
      headerName: 'Submitter',
      maxWidth: 200
    },
    {
      ...baseColDef,
      field: 'dateReviewed',
      headerName: 'Date Reviewed',
      type: 'date',
      valueFormatter: (params) => (params.value ? datePipe(params.value) : ''),
      maxWidth: 200
    },
    {
      ...baseColDef,
      field: 'reviewer',
      headerName: 'Reviewer',
      maxWidth: 200
    },
    {
      ...baseColDef,
      field: 'accepted',
      headerName: 'Accepted',
      type: 'boolean',
      maxWidth: 100
    },
    {
      ...baseColDef,
      field: 'dateImplemented',
      headerName: 'Date Implemented',
      type: 'date',
      valueFormatter: (params) => (params.value ? datePipe(params.value) : ''),
      maxWidth: 200
    },
    {
      ...baseColDef,
      field: 'implementedChanges',
      headerName: '# Implemented Changes',
      filterable: false,
      valueFormatter: (params) => params.value.length,
      maxWidth: 200
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: 15 }}>
        <PageTitle
          title={'Change Requests'}
          previousPages={[]}
          actionButton={
            <Button
              style={{
                textTransform: 'none',
                fontSize: 16,
                backgroundColor: '#ff0000',
                borderColor: '#0062cc',
                boxShadow: 'none'
              }}
              component={Link}
              to={routes.CHANGE_REQUESTS_NEW}
              variant="contained"
              disabled={auth.user?.role === 'GUEST'}
              startIcon={<Add />}
            >
              New Change Request
            </Button>
          }
        />
      </div>
      <DataGrid
        autoHeight
        disableSelectionOnClick
        density="compact"
        pageSize={pageSize}
        rowsPerPageOptions={[25, 50, 75, 100]}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        loading={isLoading}
        error={error}
        rows={
          // flatten some complex data to allow MUI to sort/filter yet preserve the original data being available to the front-end
          data?.map((v) => ({
            ...v,
            carNumber: v.wbsNum.carNumber,
            submitter: fullNamePipe(v.submitter),
            reviewer: fullNamePipe(v.reviewer)
          })) || []
        }
        columns={columns}
        getRowId={(row) => row.crId}
        sx={{ background: theme.palette.background.paper }}
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
              carNumber: false,
              implementedChanges: false
            }
          }
        }}
      />
    </div>
  );
};

export default ChangeRequestsTable;
