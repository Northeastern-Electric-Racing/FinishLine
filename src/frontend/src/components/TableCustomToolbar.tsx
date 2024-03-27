import { GridToolbarContainer, GridToolbarFilterButton, GridToolbarQuickFilter } from '@mui/x-data-grid';

const TableCustomToolbar = () => (
  <GridToolbarContainer>
    <GridToolbarQuickFilter />
    <GridToolbarFilterButton />
  </GridToolbarContainer>
);

export default TableCustomToolbar;
