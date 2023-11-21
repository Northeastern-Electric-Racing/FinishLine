import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Manufacturer, Material, MaterialType, Unit, WbsNumber } from 'shared';
import {
  createMaterial,
  deleteSingleMaterial,
  editMaterial,
  getAllManufacturers,
  getAllMaterialTypes,
  getAllUnits
} from '../apis/bom.api';
import { MaterialFormInput } from '../pages/BOMsPage/MaterialForm/MaterialForm';

/**
 * Custom React hook to supply all material types.
 * @returns All the material types
 */
export const useGetAllMaterialTypes = () => {
  return useQuery<MaterialType[], Error>(['materials', 'materialTypes'], async () => {
    const data = await getAllMaterialTypes();
    return data;
  });
};

/**
 * Custom React hook to supply all manufacturers.
 * @returns All the manufacturers
 */
export const useGetAllManufacturers = () => {
  return useQuery<Manufacturer[], Error>(['materials', 'manufacturers'], async () => {
    const data = await getAllManufacturers();
    return data;
  });
};

/**
 * Custom React hook to supply all units.
 * @returns All the units
 */
export const useGetAllUnits = () => {
  return useQuery<Unit[], Error>(['materials', 'units'], async () => {
    const data = await getAllUnits();
    return data;
  });
};

/**
 * Custom React hook to edit a material.
 * @param materialId The material to edit's id
 * @returns mutation function to edit a material
 */
export const useEditMaterial = (materialId: string) => {
  const queryClient = useQueryClient();
  return useMutation<Material, Error, MaterialFormInput>(
    ['materials', 'edit'],
    async (editPayload: MaterialFormInput) => {
      const data = await editMaterial(materialId, editPayload);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['projects']);
      }
    }
  );
};

/**
 * Custom React hook to create a material.
 * @param wbsNum The wbs num to create the material in
 * @returns the mutation function to create a material
 */
export const useCreateMaterial = (wbsNum: WbsNumber) => {
  const queryClient = useQueryClient();
  return useMutation<Material, Error, MaterialFormInput>(
    ['materials', 'create'],
    async (createPayload: MaterialFormInput) => {
      const data = await createMaterial(wbsNum, createPayload);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['projects']);
      }
    }
  );
};

/**
 * Custom React hook to delete a material.
 * @param materialId The material to delete's id
 * @returns mutation function to delete a material
 */
export const useDeleteMaterial = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { materialId: string }>(
    ['materials', 'delete'],
    async (payload: { materialId: string }) => {
      const data = await deleteSingleMaterial(payload.materialId);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['projects']);
      }
    }
  );
};
