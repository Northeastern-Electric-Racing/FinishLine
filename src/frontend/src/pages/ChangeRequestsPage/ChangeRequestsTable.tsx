/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Link } from '@mui/material';
import { Box, useTheme } from '@mui/system';
import { DataGrid, GridColDef, GridFilterModel, GridRow, GridRowProps } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ChangeRequest, ChangeRequestType, WbsElement } from 'shared';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useAllChangeRequests } from '../../hooks/change-requests.hooks';
import { datePipe, displayEnum, fullNamePipe, wbsPipe } from '../../utils/pipes';
import { routes } from '../../utils/routes';
import { GridColDefStyle } from '../../utils/tables';
import ErrorPage from '../ErrorPage';
import TableCustomToolbar from '../../components/TableCustomToolbar';

function isWBSElement(value: any): value is WbsElement {
  return value && 'wbsNum' in value;
}

const ChangeRequestsTable: React.FC = () => {
  const [windowSize, setWindowSize] = useState(window.innerWidth);
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

  useEffect(() => {
    const handleResize = () => {
      setWindowSize(window.innerWidth);
    };

    // Attach the event listener to the window object
    window.addEventListener('resize', handleResize);

    // Remove the event listener when the component unmounts
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (isLoading || !data) return <LoadingIndicator />;

  if (isError) return <ErrorPage message={error?.message} />;

  const idColumn: GridColDef = {
    ...baseColDef,
    field: 'identifier',
    type: 'number',
    headerName: 'ID',
    maxWidth: 75
  };

  const dateReviewedColumn: GridColDef = {
    ...baseColDef,
    field: 'dateReviewed',
    headerName: 'Date Reviewed',
    type: 'date',
    valueFormatter: (params) => (params.value ? datePipe(params.value) : ''),
    maxWidth: 200
  };

  const dynamicColumn: GridColDef = {
    ...baseColDef,
    field: 'wbsOrCategoryOrAccountCode',
    headerName: 'WBS / Category / AccountCode',
    filterable: true,
    sortable: true,
    maxWidth: 300,
    valueGetter: (params) => {
      const { value } = params;
      if (isWBSElement(value)) {
        return `${wbsPipe(value.wbsNum)} - ${value.name}`;
      }
      return `${value?.name ? displayEnum(value?.name) : ''}`;
    },
    sortComparator: (_v1, _v2, param1, param2) => {
      const val1 = param1.value;
      const val2 = param2.value;

      if (isWBSElement(val1) && isWBSElement(val2)) {
        const wbs1 = val1.wbsNum;
        const wbs2 = val2.wbsNum;

        if (wbs1.carNumber !== wbs2.carNumber) return wbs1.carNumber - wbs2.carNumber;
        if (wbs1.projectNumber !== wbs2.projectNumber) return wbs1.projectNumber - wbs2.projectNumber;
        return wbs1.workPackageNumber - wbs2.workPackageNumber;
      }

      if (!isWBSElement(val1) && !isWBSElement(val2)) {
        return val1.budget - val2.budget;
      }

      // Prefer WBS entries first, or reverse depending on your preference
      return isWBSElement(val1) ? -1 : 1;
    }
  };

  const submitterColumn: GridColDef = {
    ...baseColDef,
    field: 'submitter',
    headerName: 'Submitter',
    maxWidth: 200
  };

  const smallColumns: GridColDef[] = [idColumn, dateReviewedColumn, dynamicColumn, submitterColumn];

  const columns: GridColDef[] = [
    idColumn,
    {
      ...baseColDef,
      field: 'type',
      type: 'singleSelect',
      valueOptions: Object.values(ChangeRequestType),
      headerName: 'Type',
      maxWidth: 150
    },
    { ...baseColDef, field: 'carNumber', headerName: 'Car #', type: 'number', maxWidth: 50 },
    dynamicColumn,
    {
      ...baseColDef,
      field: 'dateSubmitted',
      headerName: 'Date Submitted',
      type: 'date',
      valueFormatter: (params) => datePipe(params.value),
      maxWidth: 200
    },
    submitterColumn,
    dateReviewedColumn,
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
    localStorage.getItem('changeRequestsTableFilter') ?? '{"columnField": "identifier", "operatorValue": "=", "value": ""}'
  );

  return (
    <Box
      sx={{
        '& .Mui-even': {
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : '#303030'}`
        },
        '& .Mui-odd': { border: `1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : '#303030'}` }
      }}
      data-testid={'Change Request Table'}
    >
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
          data.map((v) => ({
            ...v,
            carNumber: v.wbsNum ? v.wbsNum.carNumber : undefined,
            wbsOrCategoryOrAccountCode: v.wbsNum
              ? { wbsNum: v.wbsNum, name: v.wbsName }
              : v.category
                ? { category: v.category, name: v.category.name }
                : v.accountCode
                  ? { accountCode: v.accountCode, name: v.accountCode.name }
                  : undefined,
            submitter: fullNamePipe(v.submitter),
            reviewer: fullNamePipe(v.reviewer)
          })) || []
        }
        columns={windowSize < 900 ? smallColumns : columns}
        getRowId={(row) => row.crId}
        sx={{
          border: 0,
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'rgba(239, 67, 69, 0.6)'
          },
          '& .MuiDataGrid-columnHeader': {
            borderRight: `1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : '#303030'}`,
            borderLeft: `1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : '#303030'}`
          },
          '& .MuiDataGrid-columnHeaders': {
            border: `1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : '#303030'}`
          },
          '.MuiDataGrid-columnSeparator': {
            display: 'none'
          }
        }}
        getRowClassName={(params) => (params.indexRelativeToCurrentPage % 2 === 0 ? 'Mui-even' : 'Mui-odd')}
        components={{
          Toolbar: TableCustomToolbar,
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
            sortModel: [{ field: 'identifier', sort: 'desc' }]
          },
          columns: {
            columnVisibilityModel: {
              carNumber: false,
              implementedChanges: false
            }
          }
        }}
      />
    </Box>
  );
};

export default ChangeRequestsTable;
