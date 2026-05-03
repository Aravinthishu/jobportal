import api from './axios'

export const jobsApi = {
  getAll:    (params) => api.get('/jobs/', { params }),
  getBySlug: (slug)   => api.get(`/jobs/${slug}/`),
  create:    (data)   => api.post('/jobs/', data),
  update:    (slug, data) => api.patch(`/jobs/${slug}/`, data),
  delete:    (slug)   => api.delete(`/jobs/${slug}/`),
  toggleSave:(slug)   => api.post(`/jobs/${slug}/save/`),
  getSaved:  ()       => api.get('/jobs/saved/'),
  getMine:   ()       => api.get('/jobs/recruiter/mine/'),
}