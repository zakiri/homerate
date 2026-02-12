export const formatCurrency = (value) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
};

export const formatNumber = (value, decimals = 2) => {
  return parseFloat(value).toFixed(decimals);
};

export const shortenAddress = (address, length = 10) => {
  if (!address) return '';
  return `${address.slice(0, length)}...${address.slice(-length)}`;
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  });
};

export const getTokenFromLocalStorage = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const setTokenInLocalStorage = (token) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
};

export const removeTokenFromLocalStorage = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
};
