// ============================================================
// Core TypeScript interfaces — derived from Go backend models
// Every field name matches the JSON tags in the Go structs.
// ============================================================

// =================== AUTH ===================

export interface User {
  user_id: number;
  username: string;
  email: string;
  password?: string; // write-only; never returned by server
  isAdmin?: boolean; // client-side flag only
}

export interface AuthTokens {
  message: string;
  token: string;
  refresh: string;
  user_id: number;
  username: string;
  email: string;
  is_admin: boolean;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// =================== CATEGORY ===================

export interface Category {
  category_id: number;
  name: string;
  /** Full URL to the category image served by the Go backend */
  image_url: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryPayload {
  name: string;
  image_url?: string;
}

export interface UpdateCategoryPayload {
  name?: string;
  image_url?: string;
}

// =================== PRODUCT ===================

export interface Product {
  product_id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  /** Full URL to the product image served by the Go backend */
  image_url: string;
  /** Nested category — included in GET /products and GET /products/{id} */
  category: Category;
  created_at: string;
  updated_at: string;
}

export interface CreateProductPayload {
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  /** category_id (integer) */
  category: number;
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {}

// =================== CART ===================

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  cart_id: number;
  user_id: number;
  items: CartItem[];
}

export interface AddToCartPayload {
  user_id: number;
  product_id: number;
  quantity: number;
}

export interface UpdateCartPayload {
  cart_id: number;
  product_id: number;
  quantity: number;
}

export interface RemoveFromCartPayload {
  cart_id: number;
  product_id: number;
}

// =================== WISHLIST ===================

export interface WishlistItem {
  wishlist_id: number;
  product: Product;
}

export interface WishlistPayload {
  user_id: number;
  product_id: number;
}

// =================== FAVORITE ===================

export interface FavoriteItem {
  favorite_id: number;
  product: Product;
}

export interface FavoritePayload {
  user_id: number;
  product_id: number;
}

// =================== ORDER ===================

export interface Order {
  order_id: number;
  user_id: number;
  items: CartItem[];
  total_amount: number;
  status: string;
}

export interface CreateOrderPayload {
  user_id: number;
  cart_id: number;
}

// =================== API RESPONSE WRAPPERS ===================
// Go handlers wrap list responses in an object

/** GET /products → { "products": [...] } */
export interface ProductsResponse {
  products: Product[];
}

/** GET /categories → { "categories": [...] } */
export interface CategoriesResponse {
  categories: Category[];
}

export interface ApiError {
  message: string;
  status: number;
}

export type ApiResponse<T> =
  | { data: T; error: null }
  | { data: null; error: ApiError };
