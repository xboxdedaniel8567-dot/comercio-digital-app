export const categories = [
  {
    name: "Tecnologia",
    slug: "tecnologia",
    description: "Celulares, audifonos, computadores y accesorios.",
  },
  {
    name: "Calzado",
    slug: "calzado",
    description: "Zapatillas, tenis, botas y calzado urbano.",
  },
  {
    name: "Perfumeria",
    slug: "perfumeria",
    description: "Fragancias, cuidado personal y cosmetica.",
  },
  {
    name: "Ferreteria",
    slug: "ferreteria",
    description: "Herramientas, taladros, tornilleria y hogar.",
  },
];

export const businesses = [
  {
    name: "Tecno Centro Cali",
    slug: "tecno-centro-cali",
    category: "Tecnologia",
    city: "Cali",
    address: "Centro de Cali, local 214",
    whatsapp: "573225840281",
    status: "Activo",
  },
  {
    name: "Sneaker House",
    slug: "sneaker-house",
    category: "Calzado",
    city: "Cali",
    address: "Calle 13, local 80",
    whatsapp: "573225840281",
    status: "Activo",
  },
  {
    name: "Aromas del Centro",
    slug: "aromas-del-centro",
    category: "Perfumeria",
    city: "Cali",
    address: "Pasaje comercial, piso 2",
    whatsapp: "573225840281",
    status: "Pendiente",
  },
];

export const products = [
  {
    name: "iPhone 15 Pro 256 GB",
    slug: "iphone-15-pro-256gb",
    businessSlug: "tecno-centro-cali",
    businessName: "Tecno Centro Cali",
    category: "Tecnologia",
    city: "Cali",
    price: "$4.800.000",
    attributes: ["256 GB", "Titanio", "Garantia"],
    description: "Equipo disponible en tienda fisica con contacto directo.",
  },
  {
    name: "Zapatillas urbanas blancas",
    slug: "zapatillas-urbanas-blancas",
    businessSlug: "sneaker-house",
    businessName: "Sneaker House",
    category: "Calzado",
    city: "Cali",
    price: "$240.000",
    attributes: ["Tallas 38-43", "Blanco", "Casual"],
    description: "Calzado urbano para uso diario, consultar disponibilidad.",
  },
  {
    name: "Perfume hombre intenso",
    slug: "perfume-hombre-intenso",
    businessSlug: "aromas-del-centro",
    businessName: "Aromas del Centro",
    category: "Perfumeria",
    city: "Cali",
    price: "$180.000",
    attributes: ["100 ml", "Amaderado", "Importado"],
    description: "Fragancia masculina con entrega en tienda.",
  },
  {
    name: "Taladro percutor 850 W",
    slug: "taladro-percutor-850w",
    businessSlug: "tecno-centro-cali",
    businessName: "Tecno Centro Cali",
    category: "Ferreteria",
    city: "Cali",
    price: "$320.000",
    attributes: ["850 W", "110 V", "Percutor"],
    description: "Herramienta para trabajo profesional y hogar.",
  },
];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug) ?? products[0];
}

export function getBusiness(slug: string) {
  return businesses.find((business) => business.slug === slug) ?? businesses[0];
}
