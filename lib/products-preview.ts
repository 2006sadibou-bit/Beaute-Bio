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
  description?: string;
  availability?: "sur-commande";
};

export const previewProducts: PreviewProduct[] = [
  {
    id: "1",
    name: "Savon vert au Mbeurbeuff",
    price: 1500,
    image: "/1%20(1).jpeg",
    stock: true,
    category: "Savons",
    description:
      "Nos savons à base de Mbeurbeuff (Momordica charantia) sont des produits antiseptiques et anti-bactériens 100 % bio qui traitent tous les problèmes de peau : boutons, taches, vergetures, eczéma, démangeaisons, irritations, « siti », « kham », etc. Le savon vert est fait à base de feuilles de Mbeurbeuff. Il exfolie la peau et répare la barrière cutanée.",
  },
  {
    id: "2",
    name: "Savon Mbeurbeuff beige",
    price: 1500,
    image: "/1%20(2).jpeg",
    stock: true,
    category: "Savons",
    description:
      "Nos savons à base de Mbeurbeuff (Momordica charantia) sont des produits antiseptiques et anti-bactériens 100 % bio qui traitent tous les problèmes de peau : boutons, taches, vergetures, eczéma, démangeaisons, irritations, « siti », « kham », etc. Le savon beige est fait à base de fruits secs de la plante. Il exfolie la peau et répare la barrière cutanée.",
  },
  {
    id: "3",
    name: "Savon collagène",
    price: 2000,
    image: "/1%20(3).jpeg",
    stock: true,
    category: "Savons",
    description:
      "Le savon au collagène à la vitamine C traite les boutons et les taches pigmentaires, rend la peau élastique et la rajeunit en éliminant vos rides.",
  },
  {
    id: "4",
    name: "Crème de visage hydratante anti-taches",
    price: 3500,
    image: "/1%20(4).jpeg",
    stock: true,
    category: "Soins du visage",
    description:
      "La crème au Mbeurbeuff est un produit formulé pour l’hydratation de votre peau, mais aussi pour vous débarrasser de vos imperfections (taches, hyperpigmentation, etc.). Elle répare votre barrière cutanée et laisse une odeur incroyable sur votre peau.",
  },
  {
    id: "5",
    name: "Huile au Mbeurbeuff",
    price: 3500,
    image: "/1%20(5).jpeg",
    stock: true,
    category: "Soins du corps",
    description:
      "Notre huile au Mbeurbeuff est conçue pour tout type de peau. Elle élimine les taches pigmentaires, lutte contre les boutons et hydrate votre peau en profondeur grâce à la vitamine E et au jus d’Aloe vera qu’elle contient.\n\nMode d’utilisation : la nuit sur une peau propre. Applicable sur le visage, sur le corps et le cuir chevelu.\n\nComposition : huiles essentielles de tea tree, huile de touloucouna et jus d’Aloe vera.",
  },
  {
    id: "6",
    name: "Shampoing au Mbeurbeuff",
    price: 5500,
    image: "/1%20(6).jpeg",
    stock: true,
    category: "Cheveux",
    description:
      "Le shampoing au Mbeurbeuff a des propriétés naturelles. Il combat les chutes de cheveux, les pellicules et la casse, nettoie vos cheveux en profondeur et leur donne une belle texture.",
  },
  {
    id: "7",
    name: "Gel de douche au Mbeurbeuff",
    price: 5500,
    image: "/1%20(7).jpeg",
    stock: true,
    category: "Soins du corps",
    description:
      "Le gel de douche au Mbeurbeuff est un gel moussant et exfoliant qui embellit votre peau tout en traitant vos problèmes de peau grâce à la plante naturelle et aux ingrédients naturels qu’il contient.",
  },
  {
    id: "8",
    name: "Duo crème + huile",
    price: 6500,
    image: "/1%20(8).jpeg",
    stock: true,
    category: "Packs",
    description:
      "Ce duo réunit la crème et l’huile au Mbeurbeuff. La crème est formulée pour l’hydratation de votre peau et pour vous débarrasser de vos imperfections (taches, hyperpigmentation, etc.). Elle répare votre barrière cutanée. L’huile est conçue pour tout type de peau : elle élimine les taches pigmentaires, lutte contre les boutons et hydrate votre peau en profondeur.\n\nMode d’utilisation de l’huile : la nuit sur une peau propre. Applicable sur le visage, le corps et le cuir chevelu.",
  },
  {
    id: "9",
    name: "Savon au curcuma",
    price: 1500,
    image: "/1%20(9).jpeg",
    stock: true,
    category: "Savons",
    description:
      "Ce savon au curcuma lutte contre les imperfections, combat l’acné, apaise les irritations et lutte contre le vieillissement de la peau."
  },
  {
    id: "10",
    name: "Savon nep nep",
    price: 1500,
    image: "/1%20(10).jpeg",
    stock: true,
    category: "Savons",
    description:
    "Le savon au nep nep a des propriétés anti-bactériennes qui lutte contre les infections cutanées et les boutons. Il est idéal pour les peaux grasses et combat les mauvaises odeurs."
  },
  {
    id: "11",
    name: "Gamme complète au Mbeurbeuff",
    price: 28000,
    image: "/1%20(11).jpeg",
    stock: true,
    category: "Packs",
    availability: "sur-commande",
    description:
      "La gamme au Mbeurbeuff est composée de crème de visage anti- tache et hydratante, d’une huile anti- imperfections et hydratante, d’un gel de douche exfoliant, d’un shampooing démêlant, d’un lait de corps ulliminateur de teint et de 3 savons ( mbeurbeuf vert , beige et d’un savon collagène ). Chaque produit agit sur le corps et traite en profondeur toutes les imperfections que ce soit les boutons, les taches, les irritations , l’excès de sébum, l’hyperpigmentation, l’eczéma, le « xam » et le « ndokhoum Siti» etc.",
  },
  {
    id: "12",
    name: "Lait de corps au Mbeurbeuff",
    price: 8000,
    image: "/1%20(12).jpeg",
    stock: true,
    category: "Soins du corps",
    description:
      "Le lait de corps à base de Mbeurbeuff est conçu pour tout type de peau. C’est un produit naturel qui traite les problèmes de peau et les imperfections (boutons, irritations, démangeaisons, « siti », « kham », etc.) et donne à votre corps l’hydratation dont il a besoin.\n\nComposition : hibiscus, Aloe vera, huiles essentielles, protéines et vitamines.",
  },
];
