import api from './customizeApi';

export const getBuildPcTemplates = (params) => {
  return api.get('/build-pc-template', { params });
};

export const getBuildPcTemplateById = (id) => {
  return api.get(`/build-pc-template/${id}`);
};

export const createBuildPcTemplate = (data) => {
  return api.post('/build-pc-template', data);
};

export const updateBuildPcTemplate = (id, data) => {
  return api.put(`/build-pc-template/${id}`, data);
};

export const deleteBuildPcTemplate = (id) => {
  return api.delete(`/build-pc-template/${id}`);
};

