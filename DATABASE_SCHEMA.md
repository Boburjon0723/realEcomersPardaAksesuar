# TechGear Database Schema

This document contains the exact SQL definition of the Supabase database tables used by the application.

## 1. Settings (`settings`)
Stores global website configuration.
```sql
CREATE TABLE public.settings (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  site_name text DEFAULT 'My Shop'::text,
  logo_url text,
  banner_text text,
  phone text,
  address text,
  work_hours text,
  telegram_url text,
  instagram_url text,
  facebook_url text,
  humo_card text,
  uzcard_card text,
  visa_card text,
  CONSTRAINT settings_pkey PRIMARY KEY (id)
);
```

## 2. Orders (`orders`)
Stores customer orders from website and other sources.
```sql
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  order_number text UNIQUE,
  customer_id uuid,
  customer_name text,
  customer_phone text,
  customer_address text,
  total numeric,
  status text DEFAULT 'yangi'::text CHECK (status = ANY (ARRAY['new'::text, 'pending'::text, 'completed'::text, 'cancelled'::text, 'yangi'::text, 'jarayonda'::text, 'yakunlangan'::text, 'bekor_qilingan'::text])),
  payment_status text DEFAULT 'to''lanmagan'::text CHECK (payment_status = ANY (ARRAY['unpaid'::text, 'pending'::text, 'paid'::text, 'cancelled'::text, 'to''lanmagan'::text, 'to''langan'::text, 'kutilmoqda'::text])),
  source text DEFAULT 'do''kon'::text CHECK (source = ANY (ARRAY['do''kon'::text, 'website'::text, 'telefon'::text])),
  notes text,
  created_at timestamp without time zone DEFAULT now(),
  note text,
  receipt_url text,
  payment_method_detail text,
  payment_method text,
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id)
);
```

## 3. Order Items (`order_items`)
Links products to orders.
```sql
CREATE TABLE public.order_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  order_id uuid,
  product_id uuid,
  product_name text,
  quantity integer NOT NULL,
  price numeric NOT NULL,
  subtotal numeric NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
```

## 4. Products (`products`)
Stores product inventory.
```sql
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  category_id uuid,
  purchase_price numeric,
  sale_price numeric,
  stock integer DEFAULT 0,
  min_stock integer DEFAULT 10,
  size text,
  color text,
  image_url text,
  description text,
  created_at timestamp without time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  category text,
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);
```

## 5. Categories (`categories`)
Product categories.
```sql
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);
```

## 6. Customers (`customers`)
Customer database.
```sql
CREATE TABLE public.customers (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  phone text NOT NULL,
  address text,
  notes text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT customers_pkey PRIMARY KEY (id)
);
```

## 7. Banners (`banners`)
Website hero banners.
```sql
CREATE TABLE public.banners (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  title text,
  subtitle text,
  image_url text,
  link_url text,
  is_active boolean DEFAULT true,
  CONSTRAINT banners_pkey PRIMARY KEY (id)
);
```

## Other Tables
- `attendance`: Employee attendance tracking.
- `employees`: Employee records.
- `expenses`: Business expenses.
- `salary_payments`: Employee salary history.
- `stock_history`: Inventory movement logs.
- `transactions`: General income/expense transactions.
