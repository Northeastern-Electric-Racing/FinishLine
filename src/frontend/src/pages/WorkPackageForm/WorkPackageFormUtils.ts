import { WPFormType } from 'shared';

export const isCreateCr = (formType: WPFormType): boolean => {
  return formType === WPFormType.CrCreate;
};

export const isCreate = (formType: WPFormType): boolean => {
  return formType === WPFormType.Create;
};

export const isEdit = (formType: WPFormType): boolean => {
  return formType === WPFormType.Edit;
};
