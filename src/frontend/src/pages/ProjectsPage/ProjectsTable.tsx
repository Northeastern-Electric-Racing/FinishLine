/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Grid, Link, useTheme } from '@mui/material';
import { DataGrid, GridColDef, GridRow, GridRowProps, GridToolbar } from '@mui/x-data-grid';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Project, WbsElementStatus } from 'shared';
import { useAllProjects } from '../../hooks/projects.hooks';
import { fullNamePipe, wbsPipe, weeksPipe } from '../../utils/pipes';
import { routes } from '../../utils/routes';
import { GridColDefStyle } from '../../utils/tables';

/**
 * Table of all projects.
 */
const ProjectsTable: React.FC = () => {
  const { isLoading, data, error } = useAllProjects();
  if (!localStorage.getItem('projectsTableRowCount')) localStorage.setItem('projectsTableRowCount', '30');
  const [pageSize, setPageSize] = useState(localStorage.getItem('projectsTableRowCount'));

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

  const columns: GridColDef[] = [
    { ...baseColDef, field: 'carNumber', headerName: 'Car #', type: 'number', maxWidth: 50 },
    {
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
        } else {
          return 0;
        }
      }
    },
    {
      ...baseColDef,
      field: 'name',
      headerName: 'Project Name'
    },
    {
      ...baseColDef,
      field: 'projectLead',
      headerName: 'Project Lead',
      maxWidth: 250
    },
    {
      ...baseColDef,
      field: 'projectManager',
      headerName: 'Project Manager',
      maxWidth: 250
    },
    {
      ...baseColDef,
      field: 'team',
      headerName: 'Team',
      maxWidth: 200
    },
    {
      ...baseColDef,
      field: 'duration',
      headerName: 'Duration',
      type: 'number',
      valueFormatter: (params) => weeksPipe(params.value),
      maxWidth: 100
    },
    {
      ...baseColDef,
      field: 'budget',
      headerName: 'Budget',
      type: 'number',
      valueFormatter: (params) => dollars(params.value),
      maxWidth: 100
    },
    {
      ...baseColDef,
      field: 'workPackages',
      headerName: '# Work Packages',
      filterable: false,
      maxWidth: 150,
      valueFormatter: (params) => params.value.length
    },
    {
      ...baseColDef,
      field: 'status',
      headerName: 'Status',
      type: 'singleSelect',
      valueOptions: Object.values(WbsElementStatus),
      maxWidth: 100
    }
  ];

  const theme = useTheme();
  return (
    <Grid container xs={12}>
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
            projectLead: fullNamePipe(v.projectLead),
            projectManager: fullNamePipe(v.projectManager),
            team: v.team?.teamName || 'No Team'
          })) || []
        }
        columns={columns}
        sx={{ background: theme.palette.background.paper }}
        components={{
          Toolbar: GridToolbar,
          Row: (props: GridRowProps & { row: Project }) => {
            const wbsNum = props.row.wbsNum;
            return (
              <Link
                component={RouterLink}
                to={`${routes.PROJECTS}/${wbsPipe(wbsNum)}`}
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
        initialState={{
          sorting: {
            sortModel: [{ field: 'wbsNum', sort: 'asc' }]
          },
          columns: {
            columnVisibilityModel: {
              carNumber: false,
              workPackages: false
            }
          }
        }}
      />
    </Grid>
  );
};

export default ProjectsTable;
