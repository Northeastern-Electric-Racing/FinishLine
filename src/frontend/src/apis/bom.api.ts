import axios from 'axios';
import { WbsNumber } from 'shared';
import { MaterialFormInput } from '../pages/BOMsPage/MaterialForm/MaterialForm';
import { apiUrls } from '../utils/urls';
import { manufacturerTransformer, materialTransformer, materialTypeTransformer } from './transformers/bom.transformers';

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
 * Requests all the units from the backend.
 * @returns All the units
 */
export const getAllUnits = async () => {
  const { data } = await axios.get(apiUrls.bomGetAllUnits());
  return data;
};

/**
 * Requests all materials for the given wbsNum.
 * @param wbsNum The wbsNum to get materials for
 * @returns All the materials within the wbsnum
 */
export const getMaterialsByWbsNum = async (wbsNum: WbsNumber) => {
  const { data } = await axios.get(apiUrls.bomGetMaterialsByWbsNum(wbsNum), {
    transformResponse: (data) => JSON.parse(data).map(materialTransformer)
  });
  return data;
};

/**
 * Requests all assemblies for the given wbsNum.
 * @param wbsNum The wbsNum to get assemblies for
 * @returns All the assemblies within the wbsnum
 */
export const getAssembliesByWbsNum = async (wbsNum: WbsNumber) => {
  const { data } = await axios.get(apiUrls.bomGetAssembliesByWbsNum(wbsNum));
  return data;
};

/**
 * Requests to create a material.
 * @param material The material to create
 * @returns The created material
 */
export const createMaterial = async (wbsNum: WbsNumber, material: MaterialFormInput) => {
  const { data } = await axios.post(apiUrls.bomCreateMaterial(wbsNum), material);
  return data;
};

/**
 * Requests to edit a material.
 * @param material The material to edit
 * @returns The edited material
 */
export const editMaterial = async (materialId: string, material: MaterialFormInput) => {
  const { data } = await axios.put(apiUrls.bomEditMaterial(materialId), material);
  return data;
};
