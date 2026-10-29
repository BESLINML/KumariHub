export const adminFetch = (url, options = {}) => {
  const token = localStorage.getItem('admin_api_token');
  return fetch(url, {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${token || ''}` }
  });
};
