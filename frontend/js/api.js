const BASE_URL = 'http://localhost:3001/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    }
  };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(BASE_URL + endpoint, options);
  return res.json();
}

const api = {
  login:      (data) => request('/auth/login', 'POST', data),
  register:   (data) => request('/auth/register', 'POST', data),
  getTasks:   ()     => request('/tasks'),
  getToday:   ()     => request('/tasks/today'),
  createTask: (data) => request('/tasks', 'POST', data),
  updateStatus:(id, status) => request(`/tasks/${id}/status`, 'PATCH', { status }),
  deleteTask: (id)   => request(`/tasks/${id}`, 'DELETE'),
  getProjects: ()    => request('/projects'),
  createProject:(data) => request('/projects', 'POST', data),
  getAchievements: () => request('/achievements'),
  createProject: (data) => request('/projects', 'POST', data),
deleteProject: (id) => request(`/projects/${id}`, 'DELETE'),
getStats: () => request('/stats'),
};