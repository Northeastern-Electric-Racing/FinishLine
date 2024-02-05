import { Material } from 'shared';
import { GridColDefStyle } from './tables';
import { centsToDollar } from './pipes';

export interface BomRow {
  id: string;
  materialId: string;
  status: string;
  type: string;
  name: string;
  manufacturer: string;
  manufacturerPN: string;
  pdmFileName: string;
  quantity: string;
  price: string;
  subtotal: string;
  link: string;
  notes?: string;
}

export const materialToRow = (material: Material, idx: number): BomRow => {
  return {
    id: idx + (material.assemblyId ?? ''),
    materialId: material.materialId,
    status: material.status,
    type: material.materialTypeName,
    name: material.name,
    manufacturer: material.manufacturerName,
    manufacturerPN: material.manufacturerPartNumber,
    pdmFileName: material.pdmFileName ?? 'None',
    quantity: material.quantity + (material.unitName ? ' ' + material.unitName : ''),
    price: `$${centsToDollar(material.price)}`,
    subtotal: `$${centsToDollar(material.subtotal)}`,
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
