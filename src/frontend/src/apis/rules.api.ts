import axios from '../utils/axios';

export const deleteRule = (ruleId: string) => {
  return axios.post(`/rules/rule/${ruleId}/delete`);
};
