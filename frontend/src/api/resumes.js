import api from './axios'

export const resumesApi = {
  getAll:      ()       => api.get('/profile/resumes/'),
  upload:      (data)   => api.post('/profile/resumes/', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete:      (id)     => api.delete(`/profile/resumes/${id}/`),
  setPrimary:  (id)     => api.patch(`/profile/resumes/${id}/primary/`),
  getEducation:()       => api.get('/profile/education/'),
  addEducation:(data)   => api.post('/profile/education/', data),
  updateEducation:(id,d)=> api.patch(`/profile/education/${id}/`, d),
  deleteEducation:(id)  => api.delete(`/profile/education/${id}/`),
  getExperience:()      => api.get('/profile/experience/'),
  addExperience:(data)  => api.post('/profile/experience/', data),
  updateExperience:(id,d)=>api.patch(`/profile/experience/${id}/`, d),
  deleteExperience:(id) => api.delete(`/profile/experience/${id}/`),
  getPublicProfile:(uid)=> api.get(`/profile/profile/${uid}/`),
}