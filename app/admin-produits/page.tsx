"use client";

import {
  useEffect,
  useState,
  type FormEvent,
  type ChangeEvent,
} from "react";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  category_id: string | null;
  active: boolean;
};

type Category = {
  id: string;
  name: string;
};

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  price: "",
  stock: "0",
  image_url: "",
  category_id: "",
  active: true,
};

// =====================================================
// STYLES PARTAGÉS (design uniquement)
// Vert bio : #2E7D32 (principal) · #1B5E20 (foncé) · #F1F8F2 (fond doux)
// text-base = pas de zoom automatique sur iPhone
// Les flèches haut/bas des champs nombre et de la liste sont retirées
// =====================================================

const inputClass =
  "w-full min-h-[48px] appearance-none rounded-xl border border-[#CFE3D1] bg-white px-4 py-3 text-base text-gray-800 outline-none placeholder:text-gray-400 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#C8E6C9]";

const noSpinClass =
  "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

const labelClass = "mb-1.5 block text-sm font-semibold text-[#1B5E20]";

export default function AdminProduitsPage() {
  const [connected, setConnected] = useState(false);
  const [pin, setPin] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [form, setForm] = useState(emptyForm);

  // =====================================================
  // CHARGEMENT DES PRODUITS
  // =====================================================

  async function loadProducts() {
    try {
      const response = await fetch("/api/admin/products");
      const data = await response.json();

      if (!response.ok) {
        setConnected(false);
        setMessage(
          data.details || data.error || "Session expirée."
        );
        return;
      }

      setProducts(data.products || []);
      setCategories(data.categories || []);
      setConnected(true);
    } catch {
      setMessage("Erreur de connexion au serveur.");
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  // =====================================================
  // CONNEXION ADMIN
  // =====================================================

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pin }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.details || data.error || "Code incorrect."
        );
        return;
      }

      setPin("");
      await loadProducts();
    } catch {
      setMessage("Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // APERÇU LOCAL DE LA PHOTO
  // =====================================================

  function readImagePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Lecture de la photo impossible."));
        }
      };

      reader.onerror = () => {
        reject(new Error("Impossible de lire cette image."));
      };

      reader.readAsDataURL(file);
    });
  }

  // =====================================================
  // ENVOI DE LA PHOTO VERS SUPABASE
  // =====================================================

  async function uploadImage(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const input = event.currentTarget;
    const file = input.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Choisis un fichier image valide.");
      input.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("La photo ne doit pas dépasser 5 Mo.");
      input.value = "";
      return;
    }

    setUploadingImage(true);
    setMessage("Préparation de la photo...");

    try {
      // 1. Afficher immédiatement une vraie prévisualisation.
      const preview = await readImagePreview(file);

      setImagePreview(preview);

      // 2. Envoyer le fichier à l'API.
      setMessage("Envoi de la photo vers Supabase...");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "/api/admin/products/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.error || "Impossible d'envoyer la photo."
        );

        // On conserve l'aperçu local même en cas d'erreur.
        return;
      }

      if (!data.image_url) {
        setMessage(
          "La photo a été envoyée, mais son adresse est introuvable."
        );
        return;
      }

      // 3. Enregistrer l'adresse publique de la photo.
      setForm((previous) => ({
        ...previous,
        image_url: data.image_url,
      }));

      // 4. Remplacer l'aperçu local par l'image Supabase.
      setImagePreview(data.image_url);

      setMessage("Photo envoyée avec succès !");
    } catch (error) {
      console.error("Erreur photo :", error);

      setMessage(
        "Erreur pendant la lecture ou l'envoi de la photo."
      );
    } finally {
      setUploadingImage(false);
      input.value = "";
    }
  }

  // =====================================================
  // ENREGISTREMENT DU PRODUIT
  // =====================================================

  async function saveProduct(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (uploadingImage) {
      setMessage("Attends la fin de l'envoi de la photo.");
      return;
    }

    if (imagePreview && !form.image_url) {
      setMessage(
        "La photo est encore sur ton ordinateur. Réessaie son envoi avant d'enregistrer."
      );
      return;
    }

    setLoading(true);
    setMessage("");

    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      category_id: form.category_id || null,
    };

    try {
      const response = await fetch(
        editingId
          ? `/api/admin/products/${editingId}`
          : "/api/admin/products",
        {
          method: editingId ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.error || "Enregistrement impossible."
        );
        return;
      }

      setMessage("Produit enregistré avec succès !");

      setForm(emptyForm);
      setImagePreview("");
      setEditingId(null);

      await loadProducts();
    } catch {
      setMessage("Erreur lors de l'enregistrement.");
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // MODIFICATION D'UN PRODUIT
  // =====================================================

  function editProduct(product: Product) {
    setEditingId(product.id);

    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      price: String(product.price),
      stock: String(product.stock),
      image_url: product.image_url || "",
      category_id: product.category_id || "",
      active: product.active,
    });

    setImagePreview(product.image_url || "");
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // =====================================================
  // ANNULER LA MODIFICATION
  // =====================================================

  function cancelEditing() {
    setEditingId(null);
    setForm(emptyForm);
    setImagePreview("");
    setMessage("");
  }

  // =====================================================
  // SUPPRIMER UN PRODUIT
  // =====================================================

  async function deleteProduct(id: string) {
    if (!confirm("Voulez-vous vraiment supprimer ce produit ?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/products/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.error || "Suppression impossible."
        );
        return;
      }

      setMessage("Produit supprimé avec succès.");

      await loadProducts();
    } catch {
      setMessage("Erreur pendant la suppression.");
    }
  }

  // =====================================================
  // PUBLIER OU MASQUER UN PRODUIT
  // =====================================================

  async function toggleProduct(product: Product) {
    try {
      const response = await fetch(
        `/api/admin/products/${product.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            active: !product.active,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.error || "Modification impossible."
        );
        return;
      }

      setMessage(
        product.active
          ? "Produit masqué."
          : "Produit publié."
      );

      await loadProducts();
    } catch {
      setMessage("Erreur pendant la modification.");
    }
  }

  // =====================================================
  // PAGE DE CONNEXION
  // =====================================================

  if (!connected) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F1F8F2] px-4 py-8">
        <form
          onSubmit={login}
          className="w-full max-w-sm rounded-2xl border border-[#CFE3D1] bg-white p-6 shadow-sm"
        >
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#2E7D32] text-3xl font-bold text-white">
              BG
            </div>

            <h1 className="text-2xl font-bold text-[#1B5E20]">
              Espace privé Gnilane
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Administration de Beauté Bio
            </p>
          </div>

          <label className={labelClass}>
            Code administrateur
          </label>

          <input
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onChange={(e) =>
              setPin(
                e.target.value.replace(/\D/g, "").slice(0, 6)
              )
            }
            placeholder="Code PIN"
            className={`${inputClass} text-center text-xl tracking-[0.4em]`}
            required
          />

          {message && (
            <p className="mt-4 rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || pin.length !== 6}
            className="mt-5 min-h-[52px] w-full rounded-xl bg-[#2E7D32] px-4 text-base font-bold text-white active:bg-[#1B5E20] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </main>
    );
  }

  // =====================================================
  // TABLEAU DE BORD
  // =====================================================

  return (
    <main className="min-h-screen bg-[#F1F8F2] px-3 py-4 sm:px-6 md:py-8">
      <div className="mx-auto max-w-5xl">

        {/* EN-TÊTE */}

        <header className="mb-4 flex flex-col gap-4 rounded-2xl bg-[#2E7D32] p-5 text-white sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold text-[#C8E6C9]">
              Beauté Bio by Gnilane
            </p>

            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
              Administration
            </h1>

            <p className="mt-1 text-sm text-[#E8F5E9]">
              Gérez votre catalogue de produits.
            </p>
          </div>

          <a
            href="/produits"
            className="flex min-h-[48px] items-center justify-center rounded-xl bg-white px-6 text-base font-bold text-[#1B5E20] active:bg-[#E8F5E9]"
          >
            Voir la boutique
          </a>
        </header>

        {/* MESSAGE */}

        {message && (
          <div className="mb-4 rounded-xl border border-[#A5D6A7] bg-white p-4 text-sm font-semibold text-[#1B5E20]">
            {message}
          </div>
        )}

        {/* FORMULAIRE */}

        <section className="mb-4 rounded-2xl border border-[#CFE3D1] bg-white p-4 sm:p-6">

          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-bold text-[#1B5E20]">
              {editingId
                ? "Modifier le produit"
                : "Ajouter un produit"}
            </h2>

            <span className="rounded-full bg-[#E8F5E9] px-3 py-1 text-xs font-bold text-[#2E7D32]">
              {editingId ? "Modification" : "Nouveau produit"}
            </span>
          </div>

          <form
            onSubmit={saveProduct}
            className="grid gap-4 md:grid-cols-2"
          >

            {/* NOM */}

            <div>
              <label className={labelClass}>
                Nom du produit
              </label>

              <input
                required
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
                className={inputClass}
              />
            </div>

            {/* SLUG */}

            <div>
              <label className={labelClass}>
                Rappel produit
              </label>

              <input
                required
                value={form.slug}
                onChange={(e) =>
                  setForm({
                    ...form,
                    slug: e.target.value,
                  })
                }
                className={inputClass}
              />
            </div>

            {/* PRIX */}

            <div>
              <label className={labelClass}>
                Prix (FCFA)
              </label>

              <input
                required
                type="number"
                inputMode="numeric"
                min="0"
                value={form.price}
                onChange={(e) =>
                  setForm({
                    ...form,
                    price: e.target.value,
                  })
                }
                className={`${inputClass} ${noSpinClass}`}
              />
            </div>

            {/* STOCK */}

            <div>
              <label className={labelClass}>
                Quantité en stock
              </label>

              <input
                required
                type="number"
                inputMode="numeric"
                min="0"
                value={form.stock}
                onChange={(e) =>
                  setForm({
                    ...form,
                    stock: e.target.value,
                  })
                }
                className={`${inputClass} ${noSpinClass}`}
              />
            </div>

            {/* CATÉGORIE */}

            <div className="md:col-span-2">
              <label className={labelClass}>
                Catégorie
              </label>

              <select
                value={form.category_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category_id: e.target.value,
                  })
                }
                className={inputClass}
              >
                <option value="">
                  Choisir une catégorie
                </option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* PHOTO */}

            <div className="rounded-xl border-2 border-dashed border-[#A5D6A7] bg-[#F1F8F2] p-4 md:col-span-2">

              <label className={labelClass}>
                Photo du produit
              </label>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={uploadImage}
                disabled={uploadingImage}
                className="w-full cursor-pointer text-sm text-gray-600 file:mr-3 file:min-h-[44px] file:rounded-lg file:border-0 file:bg-[#2E7D32] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
              />

              <p className="mt-2 text-xs text-gray-500">
                JPG, PNG, WEBP ou GIF · 5 Mo maximum
              </p>

              {uploadingImage && (
                <div className="mt-3 rounded-xl bg-white p-3">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#1B5E20]">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#C8E6C9] border-t-[#2E7D32]" />
                    Envoi de la photo...
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-[#E8F5E9]">
                    <div className="h-full w-1/2 rounded-full bg-[#2E7D32]" />
                  </div>
                </div>
              )}

              {/* APERÇU PHOTO */}

              {imagePreview && (
                <div className="mt-4 rounded-xl bg-white p-3">

                  <p className="mb-3 text-sm font-bold text-[#1B5E20]">
                    Aperçu de votre photo
                  </p>

                  <div className="flex flex-wrap items-center gap-4">

                    <img
                      src={imagePreview}
                      alt="Aperçu du produit"
                      className="h-28 w-28 rounded-xl border border-[#CFE3D1] object-cover"
                    />

                    <div className="min-w-0 flex-1">

                      <p className="text-sm font-semibold text-[#2E7D32]">
                        {form.image_url
                          ? "Photo enregistrée sur Supabase"
                          : "Aperçu local : envoi à effectuer"}
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          setForm((previous) => ({
                            ...previous,
                            image_url: "",
                          }));

                          setImagePreview("");
                          setMessage("Photo retirée.");
                        }}
                        className="mt-3 min-h-[44px] rounded-lg bg-red-50 px-4 text-sm font-semibold text-red-600 active:bg-red-100"
                      >
                        Retirer la photo
                      </button>

                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* DESCRIPTION */}

            <div className="md:col-span-2">

              <label className={labelClass}>
                Description du produit
              </label>

              <textarea
                rows={4}
                placeholder="Présentez votre produit..."
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
                className={`${inputClass} resize-y`}
              />

            </div>

            {/* VISIBILITÉ */}

            <label className="flex min-h-[52px] cursor-pointer items-center gap-3 rounded-xl bg-[#E8F5E9] p-4 md:col-span-2">

              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) =>
                  setForm({
                    ...form,
                    active: e.target.checked,
                  })
                }
                className="h-6 w-6 accent-[#2E7D32]"
              />

              <span className="font-semibold text-[#1B5E20]">
                Produit visible dans la boutique
              </span>

            </label>

            {/* BOUTONS */}

            <div className="flex flex-col gap-3 sm:flex-row md:col-span-2">

              <button
                type="submit"
                disabled={loading || uploadingImage}
                className="min-h-[52px] rounded-xl bg-[#2E7D32] px-7 text-base font-bold text-white active:bg-[#1B5E20] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Enregistrement..."
                  : editingId
                    ? "Enregistrer les modifications"
                    : "Ajouter le produit"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="min-h-[52px] rounded-xl border border-gray-300 bg-white px-6 text-base font-semibold text-gray-600 active:bg-gray-100"
                >
                  Annuler
                </button>
              )}

            </div>

          </form>
        </section>

        {/* CATALOGUE */}

        <section className="rounded-2xl border border-[#CFE3D1] bg-white p-4 sm:p-6">

          <div className="mb-5 flex items-center justify-between gap-3">

            <h2 className="text-xl font-bold text-[#1B5E20]">
              Catalogue des produits
            </h2>

            <div className="rounded-xl bg-[#E8F5E9] px-4 py-2 text-center">
              <p className="text-2xl font-bold leading-none text-[#2E7D32]">
                {products.length}
              </p>

              <p className="mt-1 text-xs font-semibold text-[#1B5E20]">
                Produits
              </p>
            </div>

          </div>

          {products.length === 0 && (
            <div className="rounded-xl bg-[#F1F8F2] p-8 text-center">

              <p className="text-lg font-bold text-[#1B5E20]">
                Aucun produit enregistré
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Ajoutez votre premier produit avec le formulaire ci-dessus.
              </p>

            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">

            {products.map((product) => (
              <article
                key={product.id}
                className="flex flex-col gap-3 rounded-xl border border-[#CFE3D1] bg-white p-3 sm:flex-row"
              >

                {/* IMAGE */}

                <div className="h-44 w-full flex-shrink-0 overflow-hidden rounded-lg bg-[#F1F8F2] sm:h-28 sm:w-28">

                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-gray-400">
                      Sans photo
                    </div>
                  )}

                </div>

                {/* INFORMATIONS */}

                <div className="min-w-0 flex-1">

                  <h3 className="break-words text-lg font-bold text-[#1B5E20]">
                    {product.name}
                  </h3>

                  <p className="mt-1 font-bold text-[#2E7D32]">
                    {Number(product.price).toLocaleString("fr-FR")} FCFA
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Stock : {product.stock}
                  </p>

                  <span
                    className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold ${product.active
                      ? "bg-[#E8F5E9] text-[#2E7D32]"
                      : "bg-gray-100 text-gray-600"
                      }`}
                  >
                    {product.active ? "Publié" : "Masqué"}
                  </span>

                  {/* ACTIONS */}

                  <div className="mt-3 grid grid-cols-3 gap-2">

                    <button
                      type="button"
                      onClick={() => editProduct(product)}
                      className="min-h-[44px] rounded-lg bg-[#2E7D32] px-2 text-sm font-semibold text-white active:bg-[#1B5E20]"
                    >
                      Modifier
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleProduct(product)}
                      className="min-h-[44px] rounded-lg bg-[#E8F5E9] px-2 text-sm font-semibold text-[#1B5E20] active:bg-[#C8E6C9]"
                    >
                      {product.active ? "Masquer" : "Publier"}
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteProduct(product.id)}
                      className="min-h-[44px] rounded-lg bg-red-50 px-2 text-sm font-semibold text-red-600 active:bg-red-100"
                    >
                      Supprimer
                    </button>

                  </div>

                </div>

              </article>
            ))}

          </div>

        </section>

        {/* PIED DE PAGE */}

        <footer className="mt-6 pb-4 text-center text-xs text-gray-500">
          Beauté Bio by Gnilane · Administration sécurisée
        </footer>

      </div>
    </main>
  );
}