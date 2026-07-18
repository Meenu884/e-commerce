const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function getToken() {
  return localStorage.getItem('fg_token');
}

async function request(path, { method = 'GET', body, auth = false, form = false } = {}) {
  const headers = {};
  if (!form) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: form ? body : body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.detail || 'Something went wrong. Please try again.';
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }
  return data;
}

export const api = {
  // Auth
  register: (payload) => request('/api/auth/register', { method: 'POST', body: payload }),
  login: (email, password) => {
    const form = new URLSearchParams();
    form.append('username', email);
    form.append('password', password);
    return request('/api/auth/login', { method: 'POST', body: form, form: true });
  },
  me: () => request('/api/auth/me', { auth: true }),

  // Products
  listProducts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/products${qs ? `?${qs}` : ''}`);
  },
  getProduct: (id) => request(`/api/products/${id}`),
  listCategories: () => request('/api/products/categories'),
  createProduct: (payload) => request('/api/products', { method: 'POST', body: payload, auth: true }),
  updateProduct: (id, payload) => request(`/api/products/${id}`, { method: 'PUT', body: payload, auth: true }),
  deleteProduct: (id) => request(`/api/products/${id}`, { method: 'DELETE', auth: true }),

  // Cart
  getCart: () => request('/api/cart', { auth: true }),
  addToCart: (productId, quantity = 1) =>
    request('/api/cart/items', { method: 'POST', body: { product_id: productId, quantity }, auth: true }),
  updateCartItem: (productId, quantity) =>
    request(`/api/cart/items/${productId}`, { method: 'PUT', body: { product_id: productId, quantity }, auth: true }),
  removeCartItem: (productId) => request(`/api/cart/items/${productId}`, { method: 'DELETE', auth: true }),
  clearCart: () => request('/api/cart', { method: 'DELETE', auth: true }),

  // Orders
  checkout: (shipping) => request('/api/orders', { method: 'POST', body: { shipping }, auth: true }),
  myOrders: () => request('/api/orders/mine', { auth: true }),
  allOrders: () => request('/api/orders', { auth: true }),
};

export function formatPrice(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}
