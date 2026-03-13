const BASE_URL = import.meta.env.PUBLIC_WC_URL;
const CK = import.meta.env.PUBLIC_WC_CONSUMER_KEY;
const CS = import.meta.env.PUBLIC_WC_CONSUMER_SECRET;

const authHeader = 'Basic ' + Buffer.from(`${CK}:${CS}`).toString('base64');

export interface WCImage {
  id: number;
  src: string;
  name: string;
  alt: string;
}

export interface WCProduct {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: string;
  regular_price: string;
  sale_price: string;
  images: WCImage[];
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  permalink: string;
}

export async function getProducts(): Promise<WCProduct[]> {
  const res = await fetch(
    `${BASE_URL}/wp-json/wc/v3/products?status=publish&per_page=100`,
    { headers: { Authorization: authHeader } }
  );
  if (!res.ok) throw new Error(`WC API error: ${res.status}`);
  return res.json();
}

export async function getProduct(id: number): Promise<WCProduct> {
  const res = await fetch(
    `${BASE_URL}/wp-json/wc/v3/products/${id}`,
    { headers: { Authorization: authHeader } }
  );
  if (!res.ok) throw new Error(`WC API error: ${res.status}`);
  return res.json();
}
