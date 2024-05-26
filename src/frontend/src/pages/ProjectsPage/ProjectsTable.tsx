/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Link, useTheme } from '@mui/material';
import { DataGrid, GridColDef, GridFilterModel, GridRow, GridRowProps } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Project, WbsElementStatus } from 'shared';
import { useAllProjects } from '../../hooks/projects.hooks';
import { fullNamePipe, wbsPipe, weeksPipe } from '../../utils/pipes';
import { routes } from '../../utils/routes';
import { GridColDefStyle } from '../../utils/tables';
import { getProjectTeamsName } from '../../utils/gantt.utils';
import TableCustomToolbar from '../../components/TableCustomToolbar';

/**
 * Table of all projects.
 */
const ProjectsTable: React.FC = () => {
  const { isLoading, data, error } = useAllProjects();
  if (!localStorage.getItem('projectsTableRowCount')) localStorage.setItem('projectsTableRowCount', '30');
  const [pageSize, setPageSize] = useState(localStorage.getItem('projectsTableRowCount'));
  const [windowSize, setWindowSize] = useState(window.innerWidth);

  const baseColDef: GridColDefStyle = {
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

  const wbsNumColumn: GridColDef = {
    ...baseColDef,
    field: 'wbsNum',
    headerName: 'WBS #',
    valueFormatter: (params) => wbsPipe(params.value),
    maxWidth: 100,
    filterable: false,
    sortComparator: (v1, v2, param1, param2) => {
      if (param1.value.carNumber !== param2.value.carNumber) {
        return param1.value.carNumber - param2.value.carNumber;
      } else if (param1.value.projectNumber !== param2.value.projectNumber) {
        return param1.value.projectNumber - param2.value.projectNumber;
      } else if (param1.value.workPackageNumber !== param2.value.workPackageNumber) {
        return param1.value.workPackageNumber - param2.value.workPackageNumber;
      }
      return 0;
    }
  };

  const projectNameColumn: GridColDef = {
    ...baseColDef,
    field: 'name',
    headerName: 'Project Name'
  };

  const durationColumn: GridColDef = {
    ...baseColDef,
    field: 'duration',
    headerName: 'Duration',
    type: 'number',
    valueFormatter: (params) => weeksPipe(params.value),
    maxWidth: 100
  };

  const budgetColumn: GridColDef = {
    ...baseColDef,
    field: 'budget',
    headerName: 'Budget',
    type: 'number',
    valueFormatter: (params) => dollars(params.value),
    maxWidth: 100
  };

  const statusColumn: GridColDef = {
    ...baseColDef,
    field: 'status',
    headerName: 'Status',
    type: 'singleSelect',
    valueOptions: Object.values(WbsElementStatus),
    maxWidth: 100
  };

  const smallColumns: GridColDef[] = [wbsNumColumn, projectNameColumn, durationColumn, budgetColumn, statusColumn];

  const columns: GridColDef[] = [
    { ...baseColDef, field: 'carNumber', headerName: 'Car #', type: 'number', maxWidth: 50 },
    wbsNumColumn,
    projectNameColumn,
    {
      ...baseColDef,
      field: 'lead',
      headerName: 'Lead',
      maxWidth: 250
    },
    {
      ...baseColDef,
      field: 'manager',
      headerName: 'Manager',
      maxWidth: 250
    },
    {
      ...baseColDef,
      field: 'team',
      headerName: 'Team',
      maxWidth: 200
    },
    durationColumn,
    budgetColumn,
    {
      ...baseColDef,
      field: 'workPackages',
      headerName: '# Work Packages',
      filterable: false,
      maxWidth: 150,
      valueFormatter: (params) => params.value.length
    },
    statusColumn
  ];

  const localFilter = localStorage.getItem('projectsTableFilter');
  const filterValues = JSON.parse(
    // sets filter to a default value if no filter is stored in local storage
    localFilter ? localFilter : '{"columnField": "carNumber", "operatorValue": "=", "value": ""}'
  );

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

  return (
    <Box
      sx={{
        '& .Mui-even': {
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : '#303030'}`
        },
        '& .Mui-odd': { border: `1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : '#303030'}` }
      }}
    >
      <DataGrid
        autoHeight
        disableSelectionOnClick
        density="compact"
        pageSize={Number(pageSize)}
        rowsPerPageOptions={[15, 30, 60, 100]}
        onPageSizeChange={(newPageSize) => {
          localStorage.setItem('projectsTableRowCount', newPageSize.toString());
          setPageSize(newPageSize.toString());
        }}
        loading={isLoading}
        error={error}
        rows={
          // flatten some complex data to allow MUI to sort/filter yet preserve the original data being available to the front-end
          data?.map((v) => ({
            ...v,
            carNumber: v.wbsNum.carNumber,
            lead: fullNamePipe(v.lead),
            manager: fullNamePipe(v.manager),
            team: getProjectTeamsName(v)
          })) || []
        }
        columns={windowSize < 900 ? smallColumns : columns}
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
          Row: (props: GridRowProps & { row: Project }) => {
            const { wbsNum } = props.row;
            return (
              <Link
                component={RouterLink}
                to={`${routes.PROJECTS}/${wbsPipe(wbsNum)}/overview`}
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
          const [filterItems] = filterModel.items;
          if (filterItems) localStorage.setItem('projectsTableFilter', JSON.stringify(filterItems));
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
            sortModel: [{ field: 'status', sort: 'asc' }]
          },
          columns: {
            columnVisibilityModel: {
              carNumber: false,
              workPackages: false
            }
          }
        }}
      />
    </Box>
  );
};

export default ProjectsTable;
