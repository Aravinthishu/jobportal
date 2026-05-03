import api from './axios'

export const profileApi = {
  getMe:              ()     => api.get('/auth/me/'),
  getJobseekerProfile:()     => api.get('/auth/profile/jobseeker/'),
  updateJobseekerProfile:(d) => api.patch('/auth/profile/jobseeker/', d, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getRecruiterProfile:()     => api.get('/auth/profile/recruiter/'),
  updateRecruiterProfile:(d) => api.patch('/auth/profile/recruiter/', d, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  changePassword:     (d)    => api.post('/auth/change-password/', d),
}