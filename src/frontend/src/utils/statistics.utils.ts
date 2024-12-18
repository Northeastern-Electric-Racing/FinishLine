import { GraphCollection, GraphType, SpecialPermission } from 'shared';
import { displayEnum } from './pipes';

export const graphCollectionToAutoCompleteValue = (collection: GraphCollection): { label: string; id: string } => {
  return {
    label: collection.title,
    id: collection.id
  };
};

export const graphTypeToAutoCompleteValue = (graphType: GraphType): { label: string; id: string } => {
  return {
    label: displayEnum(graphType),
    id: graphType
  };
};

export const specialPermissionToAutoCompleteValue = (
  specialPermission: SpecialPermission
): { label: string; id: string } => {
  return {
    label: displayEnum(specialPermission),
    id: specialPermission
  };
};
