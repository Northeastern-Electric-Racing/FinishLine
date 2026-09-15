import { Manufacturer, Material, MaterialType } from 'shared';

export const materialTypeTransformer = (materialType: MaterialType): MaterialType => {
  return {
    ...materialType,
    dateCreated: new Date(materialType.dateCreated)
  };
};

export const manufacturerTransformer = (manufacturer: Manufacturer): Manufacturer => {
  return {
    ...manufacturer,
    dateCreated: new Date(manufacturer.dateCreated)
  };
};

export const materialTransformer = (material: Material): Material => {
  return {
    ...material,
    dateCreated: new Date(material.dateCreated),
    dateDeleted: material.dateDeleted ? new Date(material.dateDeleted) : undefined
  };
};
