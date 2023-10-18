/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { DataGrid, GridColDef, GridFilterModel, GridRow, GridRowProps, GridToolbar } from '@mui/x-data-grid';
import { routes } from '../../utils/routes';
import { datePipe, fullNamePipe, wbsPipe } from '../../utils/pipes';
import { useAllChangeRequests } from '../../hooks/change-requests.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { useTheme } from '@mui/system';
import { useState } from 'react';
import { ChangeRequest, ChangeRequestType, validateWBS, WbsNumber } from 'shared';
import { GridColDefStyle } from '../../utils/tables';
import { Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const ChangeRequestsTable: React.FC = () => {
  const { isLoading, isError, data, error } = useAllChangeRequests();
  if (localStorage.getItem('cr-table-row-count') === null) {
    localStorage.setItem('cr-table-row-count', '50');
  }

  const [pageSize, setPageSize] = useState(Number(localStorage.getItem('cr-table-row-count')));

  const baseColDef: GridColDefStyle = {
    flex: 1,
    align: 'center',
    headerAlign: 'center'
  };

  const theme = useTheme();

  if (isLoading || !data) return <LoadingIndicator />;

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
    },
    {
      ...baseColDef,
      field: 'status',
      headerName: 'Status',
      maxWidth: 150
    }
  ];

  const filterValues = JSON.parse(
    // sets filter to a default value if no filter is stored in local storage
    localStorage.getItem('changeRequestsTableFilter') ?? '{"columnField": "crId", "operatorValue": "=", "value": ""}'
  );

  return (
    <div>
      <DataGrid
        autoHeight
        disableSelectionOnClick
        density="compact"
        pageSize={pageSize}
        rowsPerPageOptions={[25, 50, 75, 100]}
        onPageSizeChange={(newPageSize) => {
          localStorage.setItem('cr-table-row-count', String(newPageSize));
          setPageSize(newPageSize);
        }}
        loading={isLoading}
        error={error}
        rows={
          // flatten some complex data to allow MUI to sort/filter yet preserve the original data being available to the front-end
          data.map((v) => ({
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
        components={{
          Toolbar: GridToolbar,
          Row: (props: GridRowProps & { row: ChangeRequest }) => {
            return (
              <Link
                component={RouterLink}
                to={`${routes.CHANGE_REQUESTS}/${props.row.crId}`}
                sx={{ color: 'inherit', textDecoration: 'none' }}
              >
                <GridRow {...props} />
              </Link>
            );
          }
        }}
        componentsProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 500 }
          }
        }}
        onFilterModelChange={(filterModel: GridFilterModel) => {
          localStorage.setItem('changeRequestsTableFilter', JSON.stringify(filterModel.items[0]));
        }}
        initialState={{
          filter: {
            filterModel: {
              items: [
                {
                  columnField: filterValues.columnField,
                  operatorValue: filterValues.operatorValue,
                  value: filterValues.value
                }
              ]
            }
          },
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
