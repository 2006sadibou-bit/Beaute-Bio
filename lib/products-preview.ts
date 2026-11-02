export type ProductCategory =
  | "Savons"
  | "Soins du visage"
  | "Soins du corps"
  | "Cheveux"
  | "Packs";

export type PreviewProduct = {
  id: string;
  name: string;
  price: number;
  image: string;
  stock: boolean;
  category: ProductCategory;
  details?: string;
};

export const previewProducts: PreviewProduct[] = [
  {
    id: "1",
    name: "Savon vert au Mbeurbeuff",
    price: 1500,
    image: "/1%20(1).jpeg",
    stock: true,
    category: "Savons",
  },
  {
    id: "2",
    name: "Savon Mbeurbeuff beige",
    price: 1500,
    image: "/1%20(2).jpeg",
    stock: true,
    category: "Savons",
  },
  {
    id: "3",
    name: "Savon collagène",
    price: 2000,
    image: "/1%20(3).jpeg",
    stock: true,
    category: "Savons",
  },
  {
    id: "4",
    name: "Crème de visage hydratante anti-taches",
    price: 3500,
    image: "/1%20(4).jpeg",
    stock: true,
    category: "Soins du visage",
  },
  {
    id: "5",
    name: "Huile au Mbeurbeuff",
    price: 3500,
    image: "/1%20(5).jpeg",
    stock: true,
    category: "Soins du corps",
  },
  {
    id: "6",
    name: "Shampoing au Mbeurbeuff",
    price: 5500,
    image: "/1%20(6).jpeg",
    stock: true,
    category: "Cheveux",
  },
  {
    id: "7",
    name: "Gel de douche au Mbeurbeuff",
    price: 5500,
    image: "/1%20(7).jpeg",
    stock: true,
    category: "Soins du corps",
  },
  {
    id: "8",
    name: "Duo crème + huile",
    price: 6500,
    image: "/1%20(8).jpeg",
    stock: true,
    category: "Packs",
  },
  {
    id: "9",
    name: "Savon au curcuma",
    price: 1500,
    image: "/1%20(9).jpeg",
    stock: true,
    category: "Savons",
  },
  {
    id: "10",
    name: "Savon nep nep",
    price: 1500,
    image: "/1%20(10).jpeg",
    stock: true,
    category: "Savons",
  },
  {
    id: "11",
    name: "Gamme complète au Mbeurbeuff",
    price: 28000,
    image: "/1%20(11).jpeg",
    stock: true,
    category: "Packs",
  },
];