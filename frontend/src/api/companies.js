import api from './axios'

export const companiesApi = {
  getAll:   (params) => api.get('/companies/', { params }),
  getById:  (id)     => api.get(`/companies/${id}/`),
  create:   (data)   => api.post('/companies/', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update:   (id, d)  => api.patch(`/companies/${id}/`, d, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMine:  ()       => api.get('/companies/mine/'),
}