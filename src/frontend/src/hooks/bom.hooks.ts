import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Assembly, Manufacturer, Material, MaterialType, Unit, WbsNumber } from 'shared';
import {
  assignMaterialToAssembly,
  createAssembly,
  createManufacturer,
  deleteManufacturer,
  createMaterial,
  createMaterialType,
  createUnit,
  deleteSingleMaterial,
  editMaterial,
  getAllManufacturers,
  getAllMaterialTypes,
  getAllUnits
} from '../apis/bom.api';
import { MaterialDataSubmission } from '../pages/ProjectDetailPage/ProjectViewContainer/BOM/MaterialForm/MaterialForm';
import { AssemblyFormInput } from '../pages/ProjectDetailPage/ProjectViewContainer/BOM/AssemblyForm/AssemblyForm';

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
  return useMutation<Material, Error, MaterialDataSubmission>(
    ['materials', 'edit'],
    async (editPayload: MaterialDataSubmission) => {
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
  return useMutation<Material, Error, MaterialDataSubmission>(
    ['materials', 'create'],
    async (createPayload: MaterialDataSubmission) => {
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

/**
 * Custom React hook to create an assembly.
 * @param wbsNum The wbs num to create the assembly in
 * @returns the mutation function to create an assembly
 */
export const useCreateAssembly = (wbsNum: WbsNumber) => {
  const queryClient = useQueryClient();
  return useMutation<Assembly, Error, AssemblyFormInput>(
    ['assembly', 'create'],
    async (createPayload: AssemblyFormInput) => {
      const data = await createAssembly(wbsNum, createPayload);
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
 * Custom React hook to assign a material to an assembly.
 * @param materialId The id of the material to assign
 * @param assemblyId The id of the assembly being assigned to
 * @returns mutation function to delete a material
 */
export const useAssignMaterialToAssembly = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { materialId: string; assemblyId?: string }>(
    ['material', 'assign'],
    async (payload: { materialId: string; assemblyId?: string }) => {
      const data = await assignMaterialToAssembly(payload.materialId, { assemblyId: payload.assemblyId });
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
 * Custom React hook to create a manufacturer.
 * @returns mutation function to create a manufacturer
 */
export const useCreateManufacturer = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { name: string }>(
    ['manufacturer', 'create'],
    async (payload: { name: string }) => {
      const data = await createManufacturer(payload.name);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['materials', 'manufacturers']);
      }
    }
  );
};

/**
 * Custom React hook to delete a material.
 * @param materialId The material to delete's id
 * @returns mutation function to delete a material
 */
export const useDeleteManufacturer = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { manufacturerName: string }>(
    ['manufacturer', 'delete'],
    async (payload: { manufacturerName: string }) => {
      const data = await deleteManufacturer(payload.manufacturerName);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['materials', 'manufacturers']);
      }
    }
  );
};

/**
 * Custom React hook to create a unit.
 * @returns mutation function to create a unit
 */
export const useCreateUnit = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { name: string }>(
    ['unit', 'create'],
    async (payload: { name: string }) => {
      const data = await createUnit(payload.name);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['materials', 'units']);
      }
    }
  );
};

/**
 * Custom React hook to create a material type.
 * @returns mutation function to create a material type
 */
export const useCreateMaterialType = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { name: string }>(
    ['materialType', 'create'],
    async (payload: { name: string }) => {
      const data = await createMaterialType(payload.name);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['materials', 'materialTypes']);
      }
    }
  );
};
