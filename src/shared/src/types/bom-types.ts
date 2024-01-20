import { User, UserPreview } from './user-types';
import { Decimal } from 'decimal.js'

export enum MaterialStatus {
  Ordered = 'ORDERED',
  Received = 'RECEIVED',
  Unordered = 'UNORDERED',
  Shipped = 'SHIPPED'
}

export interface Unit {
  name: string;
  materials: MaterialPreview[];
}

export type UnitPreview = Omit<Unit, 'materials'>;

export interface MaterialType {
  name: string;
  dateCreated: Date;
  userCreatedId: number;
  userCreated: UserPreview;
  dateDeleted?: Date;
  materials: MaterialPreview[];
}
export type MaterialTypePreview = Omit<MaterialType, 'materials' | 'userCreated'>;

export interface Assembly {
  assemblyId: string;
  name: string;
  pdmFileName?: string;
  dateDeleted?: Date;
  userDeletedId?: number;
  userDeleted?: UserPreview;
  userCreatedId: number;
  userCreated: UserPreview;
  wbsElementId: number;
  materials: MaterialPreview[];
}

export type AssemblyPreview = Omit<Assembly, 'materials' | 'userCreated' | 'userDeleted'>;

export interface Manufacturer {
  name: string;
  dateCreated: Date;
  userCreatedId: number;
  userCreated: User;
  dateDeleted?: Date;
  materials: MaterialPreview[];
}

export type ManufacturerPreview = Omit<Manufacturer, 'materials' | 'userCreated'>;

export interface Material {
  materialId: string;
  assemblyId?: string;
  assembly?: AssemblyPreview;
  name: string;
  wbsElementId: number;
  dateDeleted?: Date;
  userDeletedId?: number;
  userDeleted?: UserPreview;
  dateCreated: Date;
  userCreatedId: number;
  userCreated: UserPreview;
  status: MaterialStatus;
  materialTypeName: string;
  materialType: MaterialTypePreview;
  manufacturerName: string;
  manufacturer: ManufacturerPreview;
  manufacturerPartNumber: string;
  pdmFileName?: string;
  quantity: Decimal;
  unitName?: string;
  quantityUnit?: UnitPreview;
  price: number;
  subtotal: number;
  linkUrl: string;
  notes: string;
}

export type MaterialPreview = Omit<
  Material,
  'quantityUnit' | 'manufacturer' | 'materialType' | 'userCreated' | 'userDeleted' | 'wbsElement'
>;
