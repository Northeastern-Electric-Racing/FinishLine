import { WbsNumber } from 'shared';
import { MaterialFormInput } from '../pages/BOMsPage/MaterialForm/MaterialForm';
import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';
import { manufacturerTransformer, materialTypeTransformer } from './transformers/bom.transformers';

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
  console.log(data);
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
