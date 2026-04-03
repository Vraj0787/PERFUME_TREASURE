import {Platform} from 'react-native';

const API_HOST = Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';
const API_BASE_URL = `http://${API_HOST}:5000/api`;

const MANUAL_DEV_JWT = '';
let authToken = MANUAL_DEV_JWT;

export function setAuthToken(token) {
  authToken = token || '';
}

export function clearAuthToken() {
  authToken = MANUAL_DEV_JWT;
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(authToken ? {Authorization: `Bearer ${authToken}`} : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      ...headers,
    },
    ...options,
  });

  let data = null;
  try {
    data = await response.json();
  } catch (_error) {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

function mapProduct(product) {
  return {
    id: product.id,
    name: product.name,
    category: product.category?.name || 'Shop',
    categorySlug: product.category?.slug || '',
    price: Number(product.price),
    image:
      product.image ||
      product.images?.[0]?.image_url ||
      'https://via.placeholder.com/400x400.png?text=Perfume+Treasure',
    description: product.description,
    slug: product.slug,
    stockQuantity: product.stock_quantity,
  };
}

export async function fetchCategories() {
  const response = await request('/categories');
  const orderMap = {
    Men: 0,
    Women: 1,
    Sets: 2,
    'Shop All': 3,
  };

  const categoryItems = (response.data || [])
    .map(category => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    }))
    .sort((firstCategory, secondCategory) => {
      return (
        (orderMap[firstCategory.name] ?? 999) - (orderMap[secondCategory.name] ?? 999)
      );
    });

  return categoryItems;
}

export async function fetchProducts({category, search = '', sort = 'price_asc'} = {}) {
  const searchParams = new URLSearchParams();

  if (category && category !== 'Shop All') {
    searchParams.append('category', category.toLowerCase());
  }

  if (search.trim()) {
    searchParams.append('search', search.trim());
  }

  if (sort) {
    searchParams.append('sort', sort);
  }

  const queryString = searchParams.toString();
  const response = await request(`/products${queryString ? `?${queryString}` : ''}`);

  return (response.data || []).map(mapProduct);
}

export async function fetchFeaturedProducts() {
  const response = await request('/products?featured=true');
  return (response.data || []).map(mapProduct);
}

export async function signupUser({fullName, email, password, phone = ''}) {
  const response = await request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      full_name: fullName,
      email,
      password,
      phone,
    }),
  });

  const token = response.data?.token || '';
  if (token) {
    setAuthToken(token);
  }

  return response.data;
}

export async function loginUser({email, password}) {
  const response = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({email, password}),
  });

  const token = response.data?.token || '';
  if (token) {
    setAuthToken(token);
  }

  return response.data;
}

export async function fetchCart() {
  const response = await request('/cart');
  return response.data || {items: [], totals: {subtotal: 0, shipping_amount: 0, tax_amount: 0, total_amount: 0}};
}

export async function addCartItem(productId, quantity = 1) {
  const response = await request('/cart/items', {
    method: 'POST',
    body: JSON.stringify({
      product_id: productId,
      quantity,
    }),
  });

  return response.data;
}

export async function updateCartItem(itemId, quantity) {
  const response = await request(`/cart/items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify({quantity}),
  });

  return response.data;
}

export async function removeCartItem(itemId) {
  await request(`/cart/items/${itemId}`, {method: 'DELETE'});
}

export async function clearCart() {
  await request('/cart', {method: 'DELETE'});
}

export async function fetchAddresses() {
  const response = await request('/addresses');
  return response.data || [];
}

export async function createAddress(payload) {
  const response = await request('/addresses', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return response.data;
}

export async function updateAddress(addressId, payload) {
  const response = await request(`/addresses/${addressId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  return response.data;
}

export async function deleteAddress(addressId) {
  await request(`/addresses/${addressId}`, {method: 'DELETE'});
}

export async function createCheckout({addressId, paymentMethod = 'cash_on_delivery'}) {
  const response = await request('/checkout', {
    method: 'POST',
    body: JSON.stringify({
      address_id: addressId,
      payment_method: paymentMethod,
    }),
  });

  return response.data;
}

export async function fetchOrders() {
  const response = await request('/orders');
  return response.data || [];
}

export async function fetchOrder(orderId) {
  const response = await request(`/orders/${orderId}`);
  return response.data;
}
