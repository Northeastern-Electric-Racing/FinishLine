import { Material } from 'shared';
import { GridColDefStyle } from './tables';
import { centsToDollar } from './pipes';
import { DataGrid, GridValidRowModel } from '@mui/x-data-grid';
import { styled } from '@mui/system';
import { wrap } from 'module';

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
    type: material.materialTypeName,
    name: material.name,
    manufacturer: material.manufacturerName,
    manufacturerPN: material.manufacturerPartNumber,
    pdmFileName: material.pdmFileName ?? 'None',
    quantity: material.quantity + (material.unitName ? ' ' + material.unitName : ''),
    price: `$${centsToDollar(material.price)}`,
    subtotal: `$${centsToDollar(material.subtotal)}`,
    link: material.linkUrl,
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
      whiteSpace: "normal",
      lineHeight: "normal"
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
  whitespace: 'wrap',
  align: 'center',
  headerAlign: 'center',
  headerClassName: 'super-app-theme--header'
};
