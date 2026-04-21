import {Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_HOST = Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';
const API_BASE_URL = `http://${API_HOST}:5001/api`;
const AUTH_TOKEN_KEY = 'perfume_treasure.auth_token';
let authToken = '';

export async function hydrateAuthToken() {
  try {
    const storedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    authToken = storedToken || '';
    return authToken;
  } catch (_error) {
    authToken = '';
    return '';
  }
}

export function getAuthToken() {
  return authToken;
}

export function setAuthToken(token) {
  authToken = token || '';
}

async function persistAuthToken(token) {
  if (token) {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    return;
  }

  await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
}

export async function clearAuthToken() {
  authToken = '';
  await persistAuthToken('');
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(authToken ? {Authorization: `Bearer ${authToken}`} : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers,
    ...options,
  });

  const responseText = await response.text();
  let data = {};

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch (_error) {
      data = {};
    }
  }

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

export async function signup({fullName, email, password, phone}) {
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
    await persistAuthToken(token);
  }

  return response.data;
}

export async function login({email, password}) {
  const response = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const token = response.data?.token || '';
  if (token) {
    setAuthToken(token);
    await persistAuthToken(token);
  }

  return response.data;
}

export async function resetPassword({email, newPassword}) {
  const response = await request('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password: newPassword,
    }),
  });

  return response.data;
}

export async function fetchCurrentUser() {
  const response = await request('/auth/me');
  return response.data;
}

export async function fetchCart() {
  const response = await request('/cart');
  return (
    response.data || {
      items: [],
      totals: {
        subtotal: 0,
        discount_amount: 0,
        discount_code: null,
        discounted_subtotal: 0,
        shipping_amount: 0,
        tax_amount: 0,
        total_amount: 0,
      },
    }
  );
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

export async function fetchCheckoutQuote({addressId, discountCode}) {
  const response = await request('/checkout/quote', {
    method: 'POST',
    body: JSON.stringify({
      address_id: addressId,
      discount_code: discountCode || '',
    }),
  });

  return (
    response.data || {
      subtotal: 0,
      discount_amount: 0,
      discount_code: null,
      discounted_subtotal: 0,
      shipping_amount: 0,
      tax_amount: 0,
      total_amount: 0,
    }
  );
}

export async function createCheckout({
  addressId,
  paymentMethod = 'cash_on_delivery',
  discountCode,
}) {
  const response = await request('/checkout', {
    method: 'POST',
    body: JSON.stringify({
      address_id: addressId,
      payment_method: paymentMethod,
      discount_code: discountCode || '',
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

function mapProduct(product) {
  return {
    id: product.id,
    name: product.name,
    category: product.category?.name || 'Shop',
    categorySlug: product.category?.slug || '',
    price: Number(product.price),
    compareAtPrice: product.compare_at_price ? Number(product.compare_at_price) : null,
    image:
      product.image ||
      product.images?.[0]?.image_url ||
      'https://via.placeholder.com/400x400.png?text=Perfume+Treasure',
    images: product.images || [],
    subtitle: product.subtitle,
    description: product.description,
    howToApply: product.how_to_apply,
    sizeLabel: product.size_label,
    collection: product.collection,
    variants: product.variants || [],
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

export async function fetchProducts({
  category,
  search = '',
  sort = 'price_asc',
  minPrice,
  maxPrice,
} = {}) {
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

  if (typeof minPrice === 'number') {
    searchParams.append('min_price', String(minPrice));
  }

  if (typeof maxPrice === 'number') {
    searchParams.append('max_price', String(maxPrice));
  }

  const queryString = searchParams.toString();
  const response = await request(`/products${queryString ? `?${queryString}` : ''}`);

  return (response.data || []).map(mapProduct);
}

export async function fetchFeaturedProducts() {
  const response = await request('/products?featured=true');
  return (response.data || []).map(mapProduct);
}
