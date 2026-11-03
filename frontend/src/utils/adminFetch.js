let adminToken = '';

export const setAdminToken = (token) => {
  adminToken = token;
};

export const adminFetch = (url, options = {}) => {
  return fetch(url, {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${adminToken}` }
  });
};
