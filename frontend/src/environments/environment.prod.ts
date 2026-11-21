// Production environment – the API is expected behind the same domain (reverse proxy).
// Adjust `apiUrl` if the Django backend is hosted on a separate domain.
export const environment = {
  production: true,
  apiUrl: '/api',
};
