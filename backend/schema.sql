create table users (
  id char(36) primary key,
  email varchar(255) not null unique,
  password_hash varchar(255) not null,
  is_active boolean not null default true,
  loyalty_points_balance int not null default 0,
  created_at datetime not null default current_timestamp,
  updated_at datetime not null default current_timestamp on update current_timestamp
);

create table profiles (
  id char(36) primary key,
  user_id char(36) not null unique,
  full_name varchar(255) not null,
  phone varchar(32),
  created_at datetime not null default current_timestamp,
  updated_at datetime not null default current_timestamp on update current_timestamp,
  constraint fk_profiles_user foreign key (user_id) references users(id) on delete cascade
);

create table categories (
  id char(36) primary key,
  name varchar(120) not null unique,
  slug varchar(120) not null unique,
  description text,
  created_at datetime not null default current_timestamp,
  updated_at datetime not null default current_timestamp on update current_timestamp
);

create table products (
  id char(36) primary key,
  category_id char(36),
  name varchar(255) not null,
  slug varchar(255) not null unique,
  description text not null,
  price decimal(10, 2) not null,
  compare_at_price decimal(10, 2),
  is_active boolean not null default true,
  is_featured boolean not null default false,
  stock_quantity int not null default 0,
  created_at datetime not null default current_timestamp,
  updated_at datetime not null default current_timestamp on update current_timestamp,
  constraint fk_products_category foreign key (category_id) references categories(id) on delete set null
);

create table product_images (
  id char(36) primary key,
  product_id char(36) not null,
  image_url text not null,
  alt_text varchar(255),
  sort_order int not null default 0,
  created_at datetime not null default current_timestamp,
  updated_at datetime not null default current_timestamp on update current_timestamp,
  constraint fk_product_images_product foreign key (product_id) references products(id) on delete cascade
);

create table addresses (
  id char(36) primary key,
  user_id char(36) not null,
  full_name varchar(255) not null,
  line1 varchar(255) not null,
  line2 varchar(255),
  city varchar(120) not null,
  state varchar(120),
  postal_code varchar(20) not null,
  country varchar(120) not null,
  phone varchar(32),
  is_default boolean not null default false,
  created_at datetime not null default current_timestamp,
  updated_at datetime not null default current_timestamp on update current_timestamp,
  constraint fk_addresses_user foreign key (user_id) references users(id) on delete cascade
);

create table cart_items (
  id char(36) primary key,
  user_id char(36) not null,
  product_id char(36) not null,
  quantity int not null,
  created_at datetime not null default current_timestamp,
  updated_at datetime not null default current_timestamp on update current_timestamp,
  constraint fk_cart_items_user foreign key (user_id) references users(id) on delete cascade,
  constraint fk_cart_items_product foreign key (product_id) references products(id) on delete cascade,
  constraint uq_cart_user_product unique (user_id, product_id)
);

create table orders (
  id char(36) primary key,
  user_id char(36) not null,
  address_id char(36),
  status varchar(32) not null default 'pending',
  payment_status varchar(32) not null default 'pending',
  subtotal decimal(10, 2) not null,
  shipping_amount decimal(10, 2) not null default 0,
  tax_amount decimal(10, 2) not null default 0,
  total_amount decimal(10, 2) not null,
  points_earned int not null default 0,
  points_redeemed int not null default 0,
  payment_method varchar(64),
  transaction_reference varchar(255),
  created_at datetime not null default current_timestamp,
  updated_at datetime not null default current_timestamp on update current_timestamp,
  constraint fk_orders_user foreign key (user_id) references users(id),
  constraint fk_orders_address foreign key (address_id) references addresses(id) on delete set null
);

create table order_items (
  id char(36) primary key,
  order_id char(36) not null,
  product_id char(36),
  product_name varchar(255) not null,
  unit_price decimal(10, 2) not null,
  quantity int not null,
  created_at datetime not null default current_timestamp,
  updated_at datetime not null default current_timestamp on update current_timestamp,
  constraint fk_order_items_order foreign key (order_id) references orders(id) on delete cascade,
  constraint fk_order_items_product foreign key (product_id) references products(id) on delete set null
);
