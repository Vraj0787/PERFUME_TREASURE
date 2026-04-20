import {Platform} from 'react-native';

const API_HOST = Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';
const API_BASE_URL = `http://${API_HOST}:5001/api`;

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json();

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
