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
import { useTheme } from '@mui/system';
import { useState } from 'react';
import { ChangeRequestType, validateWBS, WbsNumber } from 'shared';
import { NERButton } from '../../components/NERButton';

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
      maxWidth: 75
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
      field: 'wbs',
      headerName: 'WBS',
      filterable: true,
      sortable: true,
      maxWidth: 300,
      valueGetter: (params) => `${wbsPipe(params.value.wbsNum)} - ${params.value.name}`,
      sortComparator: (_v1, _v2, param1, param2) => {
        const wbs1: WbsNumber = validateWBS((param1.value as string).split(' ')[0]);
        const wbs2: WbsNumber = validateWBS((param2.value as string).split(' ')[0]);

        if (wbs1.carNumber !== wbs2.carNumber) {
          return wbs1.carNumber - wbs2.carNumber;
        } else if (wbs1.projectNumber !== wbs2.projectNumber) {
          return wbs1.projectNumber - wbs2.projectNumber;
        } else if (wbs1.workPackageNumber !== wbs2.workPackageNumber) {
          return wbs1.workPackageNumber - wbs2.workPackageNumber;
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
            <NERButton
              variant="contained"
              disabled={auth.user?.role === 'GUEST'}
              startIcon={<Add />}
              onClick={() => history.push(routes.CHANGE_REQUESTS_NEW)}
            >
              New Change Request
            </NERButton>
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
            wbs: { wbsNum: v.wbsNum, name: v.wbsName },
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
        componentsProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 500 }
          }
        }}
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
