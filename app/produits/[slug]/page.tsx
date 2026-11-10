
import { getProductBySlug } from "@/lib/products";
import { siteConfig, buildWhatsAppLink } from "@/lib/config";

import Image from "next/image";
import { notFound } from "next/navigation";

type ProductDetailPageProps = {
  params: {
    slug: string;
  };
};

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps): Promise<JSX.Element> {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const price = product.price ?? 0;
  const priceText = price.toLocaleString("fr-FR");

  const message: string =
    "Bonjour " +
    siteConfig.shopName +
    ", je souhaite commander : " +
    product.name +
    " - " +
    priceText +
    " " +
    siteConfig.currency;

  const whatsappLink: string = buildWhatsAppLink(message);

  return (
    <main className="px-6 py-12 max-w-4xl mx-auto grid md:grid-cols-2 gap-10">
      <div className="relative w-full h-80 bg-beige rounded-xl2 overflow-hidden">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-softbrown">
            Photo a venir
          </div>
        )}
      </div>

      <div>
        <h1 className="text-3xl font-serif text-charcoal mb-2">
          {product.name}
        </h1>

        <p className="text-2xl font-semibold text-charcoal mb-4">
          {priceText} {siteConfig.currency}
        </p>

        <p className="text-softbrown mb-6">
          {product.description}
        </p>

        <p className="text-sm mb-6">
          {product.stock ? (
            <span className="text-green-700">En stock</span>
          ) : (
            <span className="text-red-600">Rupture de stock</span>
          )}
        </p>

        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center border border-green-600 text-green-700 rounded-full py-2 text-sm hover:bg-green-600 hover:text-white transition"
        >
          Commander sur WhatsApp
        </a>
      </div>
    </main>
  )
}
