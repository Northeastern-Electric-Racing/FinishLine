import { Material } from 'shared';
import { GridColDefStyle } from './tables';
import { GridRenderCellParams } from '@mui/x-data-grid';
import { Link } from '@mui/material';

export const materialToRow = (material: Material, idx: number) => {
  return {
    id: idx + (material.assemblyId ?? ''),
    materialId: material.materialId,
    status: material.status,
    type: material.materialTypeName,
    name: material.name,
    manufacturer: material.manufacturerName,
    manufacturerPN: material.manufacturerPartNumber,
    pdmFileName: material.pdmFileName ?? 'None',
    quantity: material.quantity + (material.unitName ?? ''),
    price: material.price,
    subtotal: material.subtotal,
    link: material.linkUrl,
    notes: material.notes
  };
};

export const bomTableStyles = {
  datagrid: {
    '&.MuiDataGrid-root .MuiDataGrid-cell:focus': {
      outline: 'none'
    },
    '.MuiDataGrid-columnSeparator': {
      display: 'none'
    },
    '.MuiDataGrid-cell': {
      borderBottom: 'none'
    },
    '&.MuiDataGrid-root': {
      border: 'none'
    },
    '.MuiDataGrid-cell:focus-within': {
      outline: 'none'
    },
    '.MuiDataGrid-columnHeader': {
      borderBottom: 1
    },
    '.MuiDataGrid-columnHeader:focus-within': {
      outline: 'none'
    }
  }
};

export const BOM_TABLE_ROW_COUNT = 'tl-table-row-count';

export const bomBaseColDef: GridColDefStyle = {
  flex: 1,
  align: 'center',
  headerAlign: 'center',
  headerClassName: 'super-app-theme--header'
};
