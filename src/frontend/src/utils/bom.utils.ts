import { Material, MaterialStatus } from 'shared';
import { GridColDefStyle } from './tables';
import { centsToDollar } from './pipes';
import { DataGrid, GridValidRowModel } from '@mui/x-data-grid';
import { styled } from '@mui/system';

export interface BomRow extends GridValidRowModel {
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
  notes: string | undefined;
  assemblyId: string | undefined;
}

export const materialToRow = (material: Material, idx: number): BomRow => {
  return {
    id: idx + (material.assemblyId ?? ''),
    materialId: material.materialId,
    status: material.status,
    type: material.materialTypeName ?? '',
    name: material.name,
    manufacturer: material.manufacturerName ?? '',
    manufacturerPN: material.manufacturerPartNumber ?? '',
    pdmFileName: material.pdmFileName ?? 'None',
    quantity: material.quantity + (material.unitName ? ' ' + material.unitName : ''),
    price: `$${centsToDollar(material.price ?? 0)}`,
    subtotal: `$${centsToDollar(material.subtotal ?? 0)}`,
    link: material.linkUrl ?? '',
    notes: material.notes,
    assemblyId: material.assemblyId ?? 'assembly-misc'
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
    },
    '& .MuiDataGrid-columnHeaderTitle': {
      whiteSpace: 'normal',
      lineHeight: 'normal'
    }
  }
};

export const BomStyledDataGrid = styled(DataGrid)(({ theme }) => ({
  '& .super-app-theme--header': {
    backgroundColor: '#ef4345'
  },
  '& .super-app-theme--assembly': {
    backgroundColor: theme.palette.grey[600],
    '&:hover': {
      backgroundColor: theme.palette.grey[700]
    },
    '&.Mui-selected': {
      backgroundColor: '#997570',
      '&:hover': {
        backgroundColor: '#997570'
      }
    }
  },
  '& .super-app-theme--material': {
    backgroundColor: theme.palette.background.default,
    '&:hover': {
      backgroundColor: theme.palette.background.default
    },
    '&.Mui-selected': {
      backgroundColor: theme.palette.background.default,
      '&:hover': {
        backgroundColor: theme.palette.background.default
      }
    }
  }
}));

export const BOM_TABLE_ROW_COUNT = 'tl-table-row-count';

export const bomBaseColDef: GridColDefStyle = {
  flex: 1,
  align: 'center',
  headerAlign: 'center',
  headerClassName: 'super-app-theme--header'
};

export const getMaterialCost = (material: Material): number => {
  if (!material.price || !material.quantity) return 0;
  return material.price * material.quantity.toNumber();
};

export const getMaterialsSubtotal = (materials: Material[]): number => {
  return materials.reduce((acc, material) => acc + getMaterialCost(material), 0);
};

export const getMaterialsCount = (materials: Material[]): number => {
  return materials.length;
};

export const getMaterialsOrderedCount = (materials: Material[]): number => {
  return materials.filter((material) => material.status === MaterialStatus.Ordered).length;
};

export const getMaterialsReceivedCount = (materials: Material[]): number => {
  return materials.filter((material) => material.status === MaterialStatus.Received).length;
};

export const getMaterialsShippedCount = (materials: Material[]): number => {
  return materials.filter((material) => material.status === MaterialStatus.Shipped).length;
};

export const getMaterialsNotReadyToOrderCount = (materials: Material[]): number => {
  return materials.filter((material) => material.status === MaterialStatus.NotReadyToOrder).length;
};

export const getMaterialsReadyToOrderCount = (materials: Material[]): number => {
  return materials.filter((material) => material.status === MaterialStatus.ReadyToOrder).length;
};

export const getMaterialsOrderedSubtotal = (materials: Material[]): number => {
  return materials
    .filter((material) => material.status === MaterialStatus.Ordered)
    .reduce((acc, material) => acc + getMaterialCost(material), 0);
};

export const getMaterialsReceivedSubtotal = (materials: Material[]): number => {
  return materials
    .filter((material) => material.status === MaterialStatus.Received)
    .reduce((acc, material) => acc + getMaterialCost(material), 0);
};

export const getMaterialsShippedSubtotal = (materials: Material[]): number => {
  return materials
    .filter((material) => material.status === MaterialStatus.Shipped)
    .reduce((acc, material) => acc + getMaterialCost(material), 0);
};

export const getMaterialsNotReadyToOrderSubtotal = (materials: Material[]): number => {
  return materials
    .filter((material) => material.status === MaterialStatus.NotReadyToOrder)
    .reduce((acc, material) => acc + getMaterialCost(material), 0);
};

export const getMaterialsReadyToOrderSubtotal = (materials: Material[]): number => {
  return materials
    .filter((material) => material.status === MaterialStatus.ReadyToOrder)
    .reduce((acc, material) => acc + getMaterialCost(material), 0);
};
