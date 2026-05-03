import api from './axios'

export const notificationsApi = {
  getAll:              ()     => api.get('/notifications/'),
  getUnreadCount:      ()     => api.get('/notifications/unread-count/'),
  markRead:            (id)   => api.patch(`/notifications/${id}/read/`),
  markAllRead:         ()     => api.post('/notifications/mark-all-read/'),
  deleteNotification:  (id)   => api.delete(`/notifications/${id}/delete/`),
  deleteAll:           ()     => api.delete('/notifications/delete-all/'),
  getAlerts:           ()     => api.get('/notifications/alerts/'),
  createAlert:         (data) => api.post('/notifications/alerts/', data),
  updateAlert:         (id,d) => api.patch(`/notifications/alerts/${id}/`, d),
  deleteAlert:         (id)   => api.delete(`/notifications/alerts/${id}/`),
}