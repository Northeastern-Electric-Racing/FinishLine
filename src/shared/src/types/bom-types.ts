import { Decimal } from 'decimal.js';
import { User, UserPreview } from './user-types';

export enum MaterialStatus {
  Ordered = 'ORDERED',
  Received = 'RECEIVED',
  Shipped = 'SHIPPED',
  NotReadyToOrder = 'NOT_READY_TO_ORDER',
  ReadyToOrder = 'READY_TO_ORDER'
}

export interface Unit {
  name: string;
  materials: MaterialPreview[];
}

export type UnitPreview = Omit<Unit, 'materials'>;

export interface MaterialType {
  name: string;
  dateCreated: Date;
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
  userDeleted?: UserPreview;
  userCreated: UserPreview;
  wbsElementId: string;
  materials: MaterialPreview[];
}

export type AssemblyPreview = Omit<Assembly, 'materials' | 'userCreated' | 'userDeleted'>;

export interface Manufacturer {
  name: string;
  dateCreated: Date;
  dateDeleted?: Date;
  userCreated: User;
  materials: MaterialPreview[];
}

export type ManufacturerPreview = Omit<Manufacturer, 'materials' | 'userCreated'>;

export interface Material {
  materialId: string;
  assemblyId?: string;
  assembly?: AssemblyPreview;
  name: string;
  wbsElementId: string;
  dateDeleted?: Date;
  userDeleted?: UserPreview;
  dateCreated: Date;
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
  notes?: string;
}

export type MaterialPreview = Omit<
  Material,
  'quantityUnit' | 'manufacturer' | 'materialType' | 'userCreated' | 'userDeleted' | 'wbsElement'
>;
