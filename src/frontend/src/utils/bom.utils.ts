import { Material } from 'shared';

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
