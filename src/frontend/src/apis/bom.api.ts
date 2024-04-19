import { Material, WbsNumber } from 'shared';
import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';
import { manufacturerTransformer, materialTypeTransformer } from './transformers/bom.transformers';
import { MaterialDataSubmission } from '../pages/ProjectDetailPage/ProjectViewContainer/BOM/MaterialForm/MaterialForm';
import { AssemblyFormInput } from '../pages/ProjectDetailPage/ProjectViewContainer/BOM/AssemblyForm/AssemblyForm';

/**
 * Requests all the material types from the backend.
 * @returns All the material types
 */
export const getAllMaterialTypes = async () => {
  const { data } = await axios.get(apiUrls.bomGetAllMaterialTypes(), {
    transformResponse: (data) => JSON.parse(data).map(materialTypeTransformer)
  });
  return data;
};

/**
 * Requests all the manufacturers from the backend.
 * @returns All the manufacturers
 */
export const getAllManufacturers = async () => {
  const { data } = await axios.get(apiUrls.bomGetAllManufacturers(), {
    transformResponse: (data) => JSON.parse(data).map(manufacturerTransformer)
  });
  return data;
};

/**
 * Requests to create a manufacturer.
 * @param manufacturer The manufacturer to create
 * @returns The created manufacturer
 */
export const createManufacturer = async (name: string) => {
  const { data } = await axios.post(apiUrls.bomCreateManufacturer(), { name });
  return data;
};

/**
 * Requests to delete a manufacturer.
 * @param manufacturer The manufacturer to delete
 * @returns The deleted manufacturer
 */
export const deleteManufacturer = async (name: string) => {
  const { data } = await axios.delete(apiUrls.bomDeleteManufacturer(name));
  return data;
};

/**
 * Requests to create a material type.
 * @param materialType The material type to create
 * @returns The created material type
 */
export const createMaterialType = async (name: string) => {
  const { data } = await axios.post(apiUrls.bomCreateMaterialType(), { name });
  return data;
};

/**
 * Requests to create a unit.
 * @param unit The unit to create
 * @returns The created unit
 */
export const createUnit = async (name: string) => {
  const { data } = await axios.post(apiUrls.bomCreateUnit(), { name });
  return data;
};

/**
 * Soft deletes a unit.
 * @param unitId
 * @returns
 */
export const deleteUnit = async (id: string) => {
  return axios.delete(apiUrls.bomDeleteUnit(id));
};

/**
 * Requests all the units from the backend.
 * @returns All the units
 */
export const getAllUnits = async () => {
  const { data } = await axios.get(apiUrls.bomGetAllUnits());
  return data;
};

/**
 * Requests to create a material.
 * @param material The material to create
 * @returns The created material
 */
export const createMaterial = async (wbsNum: WbsNumber, material: MaterialDataSubmission) => {
  const { data } = await axios.post(apiUrls.bomCreateMaterial(wbsNum), material);
  return data;
};

/**
 * Requests to edit a material.
 * @param material The material to edit
 * @returns The edited material
 */
export const editMaterial = async (materialId: string, material: MaterialDataSubmission) => {
  const { data } = await axios.post(apiUrls.bomEditMaterial(materialId), material);
  return data;
};

/**
 * Soft deletes a material.
 * @param materialId
 * @returns
 */
export const deleteSingleMaterial = async (materialId: string) => {
  return axios.post<Material>(apiUrls.bomDeleteMaterial(materialId), {});
};

/**
 * Requests to create an assmebly.
 * @param material The assembly to create
 * @returns The created assembly
 */
export const createAssembly = async (wbsNum: WbsNumber, assembly: AssemblyFormInput) => {
  const { data } = await axios.post(apiUrls.bomCreateAssembly(wbsNum), assembly);
  return data;
};

/**
 * Assigns a material to an assembly.
 * @param materialId the material being assigned
 * @param payload containing the id of the assembly being assigned to
 * @returns
 */
export const assignMaterialToAssembly = async (materialId: string, payload: { assemblyId?: string }) => {
  return axios.post(apiUrls.bomAssignAssembly(materialId), payload);
};
