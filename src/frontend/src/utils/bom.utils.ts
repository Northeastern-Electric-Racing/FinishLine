import { Material } from 'shared';

export const materialToRow = (material: Material, idx: number) => {
  return {
    id: idx,
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
