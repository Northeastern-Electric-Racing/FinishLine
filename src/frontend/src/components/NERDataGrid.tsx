import React, { useMemo, useState } from 'react';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import { Box, Button, Paper, TextField } from '@mui/material';
import type { SxProps } from '@mui/system';
import type { Theme } from '@mui/material/styles';

export type MapRowResult<T> = T & { id: string | number; raw?: T };

interface NERDataGridProps<T> {
  items: T[];
  // map an item to a row object (must include `id` and may include `raw`)
  mapRow: (item: T) => MapRowResult<T>;
  columns: GridColDef[];
  pageSizeDefault?: number;
  rowsPerPageOptions?: number[];
  onAdd?: () => void;
  addLabel?: string; // optional label for the add/create button (defaults to 'Add')
  onRowClick?: (item: T) => void;
  // optional simple search fields (keys of mapped row) or a custom filter function
  searchFields?: (keyof MapRowResult<T>)[];
  searchFilter?: (term: string, row: MapRowResult<T>) => boolean;
  // optional sort model to apply initially
  initialSortModel?: { field: string; sort: 'asc' | 'desc' }[];
  headerHeight?: number;
  rowHeight?: number;
  paperSx?: SxProps<Theme>;
  canEditRow?: (row: MapRowResult<T>) => boolean;
  // optional function to add custom CSS class names to rows
  getRowClassName?: (row: MapRowResult<T>) => string;
  // optional custom sx styles for the DataGrid
  dataGridSx?: SxProps<Theme>;
}

function NERDataGrid<T>({
  items,
  mapRow,
  columns,
  pageSizeDefault = 10,
  rowsPerPageOptions,
  onAdd,
  addLabel = 'Add',
  onRowClick,
  searchFields,
  searchFilter,
  initialSortModel = [{ field: 'name', sort: 'asc' }],
  headerHeight = 56,
  rowHeight = 52,
  paperSx,
  canEditRow,
  getRowClassName: customGetRowClassName,
  dataGridSx
}: NERDataGridProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState<number>(pageSizeDefault);

  // compute standard pagination options if caller didn't pass any
  const effectiveRowsPerPageOptions = useMemo(() => {
    const base = [5, 10, 25, 50, 100];
    const itemsCount = (items ?? []).length;
    if (rowsPerPageOptions && rowsPerPageOptions.length > 0) {
      const provided = Array.from(new Set(rowsPerPageOptions))
        .sort((a, b) => a - b)
        .filter((opt) => opt <= itemsCount);
      if (provided.length > 0) return provided;
      return itemsCount > 0 ? [itemsCount] : base;
    }

    // default behavior: include standard options up to the total number of items
    if (itemsCount === 0) return base;
    const opts = base.filter((opt) => opt <= itemsCount);
    if (itemsCount < 100 && !opts.includes(itemsCount)) opts.push(itemsCount);
    return Array.from(new Set(opts)).sort((a, b) => a - b);
  }, [rowsPerPageOptions, items]);

  const rows = useMemo(() => items.map(mapRow), [items, mapRow]);

  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return rows;
    if (searchFilter) return rows.filter((r) => searchFilter(term, r));
    if (searchFields && searchFields.length > 0) {
      return rows.filter((r) =>
        searchFields.some((f) =>
          String(((r as MapRowResult<T>)[f] as unknown) ?? '')
            .toLowerCase()
            .includes(term)
        )
      );
    }
    return rows.filter((r) => JSON.stringify(r).toLowerCase().includes(term));
  }, [rows, searchTerm, searchFields, searchFilter]);

  return (
    <Box>
      <Paper
        sx={{ borderRadius: '10px 10px 0 0', overflow: 'hidden', display: 'flex', flexDirection: 'column', ...paperSx }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2, py: 0.5, height: 48 }}>
          <TextField
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            placeholder="Search"
            sx={{ flex: 1 }}
          />
          {onAdd && (
            <Button variant="contained" size="small" onClick={onAdd} sx={{ ml: 1 }}>
              {addLabel}
            </Button>
          )}
        </Box>

        <Box sx={{ flex: 1, minHeight: 0 }}>
          <DataGrid
            rows={filteredRows}
            columns={columns}
            initialState={{ sorting: { sortModel: initialSortModel } }}
            pageSize={pageSize}
            onPageSizeChange={(newSize) => setPageSize(newSize)}
            rowsPerPageOptions={effectiveRowsPerPageOptions}
            pagination
            disableSelectionOnClick
            headerHeight={headerHeight}
            rowHeight={rowHeight}
            onRowClick={(params: GridRowParams<MapRowResult<T>>) => {
              if (!onRowClick) return;
              const row = params.row as MapRowResult<T>;
              const editable = canEditRow ? canEditRow(row) : true;
              if (!editable) return; // do not call onRowClick for non-editable rows
              const raw = params.row.raw as T | undefined;
              if (raw) onRowClick(raw);
            }}
            getRowClassName={(params) => {
              const row = params.row as MapRowResult<T>;
              const editable = canEditRow ? canEditRow(row) : true;
              const editableClass = editable ? 'editable-row' : 'non-editable-row';
              const customClass = customGetRowClassName ? customGetRowClassName(row) : '';
              return `${editableClass} ${customClass}`.trim();
            }}
            sx={{
              height: '100%',
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#ef4345',
                color: 'white',
                fontWeight: 'bold'
              },
              '& .MuiDataGrid-columnHeader': {
                borderTopLeftRadius: 10,
                borderTopRightRadius: 10
              },
              // per-row hover: mark editable rows with pointer and non-editable rows with default
              '& .editable-row:hover': {
                cursor: onRowClick ? 'pointer' : 'default'
              },
              '& .non-editable-row:hover': {
                cursor: 'default'
              },
              '& .non-editable-row': {
                opacity: 0.7
              },
              '& .MuiDataGrid-columnSeparator': {
                display: 'none'
              },
              ...dataGridSx
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
}

export default NERDataGrid;
