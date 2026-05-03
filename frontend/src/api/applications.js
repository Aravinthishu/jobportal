import api from './axios'

export const applicationsApi = {
  getMyApplications: (params) => api.get('/applications/', { params }),
  apply:             (data)   => api.post('/applications/', data),
  withdraw:          (id)     => api.delete(`/applications/${id}/`),
  getStats:          ()       => api.get('/applications/stats/'),
  getRecruiterApps:  (params) => api.get('/applications/recruiter/', { params }),
  updateStatus:      (id, data) => api.patch(`/applications/recruiter/${id}/status/`, data),
  sendInvite:        (data)   => api.post('/applications/invite/', data),
  searchCandidates:  (params) => api.get('/applications/candidates/', { params }),
}