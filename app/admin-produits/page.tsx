"use client";

import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

/* =========================================================
   TYPES
========================================================= */

type Category = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  category_id: string | null;
  category?: string | null;
  active: boolean;
  created_at?: string;
};

type ProductForm = {
  name: string;
  slug: string;
  description: string;
  price: string;
  stock: string;
  image_url: string;
  category_id: string;
  active: boolean;
};

type ApiResponse = {
  products?: Product[];
  categories?: Category[];
  product?: Product;
  error?: string;
  message?: string;
  warning?: string;
  photo_deleted?: boolean;
};

const emptyForm: ProductForm = {
  name: "",
  slug: "",
  description: "",
  price: "",
  stock: "0",
  image_url: "",
  category_id: "",
  active: true,
};

/* =========================================================
   STYLES
========================================================= */

const inputStyle =
  "w-full rounded-xl border border-green-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100";

const labelStyle =
  "mb-2 block text-sm font-semibold text-gray-700";

const buttonPrimary =
  "inline-flex items-center justify-center rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50";

const buttonSecondary =
  "inline-flex items-center justify-center rounded-xl border border-green-200 bg-white px-4 py-2.5 text-sm font-semibold text-green-800 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50";

/* =========================================================
   PAGE ADMIN PRODUITS
========================================================= */

export default function AdminProduitsPage() {
  const [connected, setConnected] = useState(false);
  const [pin, setPin] = useState("");

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<ProductForm>(emptyForm);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingPhoto, setDeletingPhoto] = useState(false);

  const [imagePreview, setImagePreview] = useState("");

  const [search, setSearch] = useState("");

  /* =======================================================
     NOTIFICATIONS
  ======================================================= */

  const showMessage = (text: string) => {
    setMessage(text);
    setErrorMessage("");
  };

  const showError = (text: string) => {
    setErrorMessage(text);
    setMessage("");
  };

  /* =======================================================
     CHARGEMENT DES PRODUITS ET CATÉGORIES
  ======================================================= */

  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);

    try {
      const response = await fetch("/api/admin/products", {
        method: "GET",
        cache: "no-store",
      });

      const data = (await response.json()) as ApiResponse;

      if (!response.ok) {
        throw new Error(
          data.error || "Impossible de charger les produits."
        );
      }

      setProducts(Array.isArray(data.products) ? data.products : []);

      if (Array.isArray(data.categories)) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Erreur chargement produits :", error);

      showError(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue pendant le chargement."
      );
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    if (connected) {
      void loadProducts();
    }
  }, [connected, loadProducts]);

  /* =======================================================
     CONNEXION ADMINISTRATEUR
  ======================================================= */

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!pin.trim()) {
      showError("Veuillez saisir votre code administrateur.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
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
        throw new Error(
          data.error || "Code administrateur incorrect."
        );
      }

      setConnected(true);
      setPin("");
      showMessage("Connexion réussie.");

      await loadProducts();
    } catch (error) {
      console.error("Erreur connexion admin :", error);

      showError(
        error instanceof Error
          ? error.message
          : "Impossible de se connecter."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     MODIFICATION DU FORMULAIRE
  ======================================================= */

  function updateForm<K extends keyof ProductForm>(
    field: K,
    value: ProductForm[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function createSlug(value: string) {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  /* =======================================================
     SÉLECTION D'UNE IMAGE
  ======================================================= */

  async function uploadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showError("Veuillez sélectionner une image valide.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showError("L'image ne doit pas dépasser 5 Mo.");
      event.target.value = "";
      return;
    }

    setUploadingImage(true);
    setErrorMessage("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/products/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Impossible de télécharger l'image."
        );
      }

      if (!data.url) {
        throw new Error("Le serveur n'a pas retourné l'adresse de l'image.");
      }

      setForm((previous) => ({
        ...previous,
        image_url: data.url,
      }));

      setImagePreview(data.url);

      showMessage("Image téléchargée avec succès.");
    } catch (error) {
      console.error("Erreur upload image :", error);

      showError(
        error instanceof Error
          ? error.message
          : "Erreur pendant le téléchargement de l'image."
      );
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  }

  /* =======================================================
     RETIRER LA PHOTO SANS SUPPRIMER LE PRODUIT
  ======================================================= */

  async function removePhoto() {
    if (deletingPhoto || uploadingImage) return;

    if (!form.image_url && !imagePreview) {
      showError("Ce produit ne possède aucune photo.");
      return;
    }

    /*
      Nouveau produit :
      la photo n'est pas encore associée à un produit enregistré.
      On retire simplement la sélection du formulaire.
    */

    if (!editingId) {
      setForm((previous) => ({
        ...previous,
        image_url: "",
      }));

      setImagePreview("");

      showMessage(
        "Photo retirée du formulaire. Le produit n'a pas été supprimé."
      );

      return;
    }

    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer cette photo ? Le produit et ses autres informations seront conservés."
    );

    if (!confirmed) return;

    setDeletingPhoto(true);
    setErrorMessage("");
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/products/${encodeURIComponent(editingId)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image_url: null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Impossible de supprimer la photo."
        );
      }

      /*
        On ne supprime pas le produit.
        Seul son champ image_url est vidé.
      */

      setForm((previous) => ({
        ...previous,
        image_url: "",
      }));

      setImagePreview("");

      setProducts((previous) =>
        previous.map((product) =>
          product.id === editingId
            ? {
              ...product,
              image_url: null,
            }
            : product
        )
      );

      if (data.warning) {
        showError(data.warning);
      } else {
        showMessage(
          data.message || "Photo supprimée avec succès."
        );
      }

      await loadProducts();
    } catch (error) {
      console.error("Erreur suppression photo :", error);

      showError(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue pendant la suppression de la photo."
      );
    } finally {
      setDeletingPhoto(false);
    }
  }

  /* =======================================================
     RÉINITIALISER LE FORMULAIRE
  ======================================================= */

  function resetForm() {
    setForm(emptyForm);
    setImagePreview("");
    setEditingId(null);
    setMessage("");
    setErrorMessage("");
  }

  /* =======================================================
     AJOUTER OU MODIFIER UN PRODUIT
  ======================================================= */

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading || uploadingImage || deletingPhoto) return;

    const name = form.name.trim();
    const price = Number(form.price);
    const stock = Number(form.stock);

    if (!name) {
      showError("Veuillez saisir le nom du produit.");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      showError("Veuillez saisir un prix valide.");
      return;
    }

    if (!Number.isFinite(stock) || stock < 0) {
      showError("Veuillez saisir une quantité de stock valide.");
      return;
    }

    const slug = form.slug.trim() || createSlug(name);

    if (!slug) {
      showError("Impossible de générer le lien du produit.");
      return;
    }

    setLoading(true);
    setMessage("");
    setErrorMessage("");

    try {
      const payload = {
        name,
        slug,
        description: form.description.trim() || null,
        price,
        stock,
        image_url: form.image_url.trim() || null,
        category_id: form.category_id || null,
        active: form.active,
      };

      const url = editingId
        ? `/api/admin/products/${encodeURIComponent(editingId)}`
        : "/api/admin/products";

      const response = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
          (editingId
            ? "Impossible de modifier le produit."
            : "Impossible d'ajouter le produit.")
        );
      }

      showMessage(
        editingId
          ? "Produit modifié avec succès."
          : "Produit ajouté avec succès."
      );

      resetForm();

      await loadProducts();
    } catch (error) {
      console.error("Erreur enregistrement produit :", error);

      showError(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue pendant l'enregistrement."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     MODIFIER UN PRODUIT
  ======================================================= */

  function editProduct(product: Product) {
    setEditingId(product.id);

    setForm({
      name: product.name || "",
      slug: product.slug || "",
      description: product.description || "",
      price: String(product.price ?? ""),
      stock: String(product.stock ?? 0),
      image_url: product.image_url || "",
      category_id: product.category_id || "",
      active: product.active ?? true,
    });

    setImagePreview(product.image_url || "");

    setMessage("");
    setErrorMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* =======================================================
     SUPPRIMER UN PRODUIT
  ======================================================= */

  async function deleteProduct(product: Product) {
    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer le produit "${product.name}" ? Cette action est irréversible.`
    );

    if (!confirmed) return;

    setLoading(true);
    setMessage("");
    setErrorMessage("");

    try {
      const response = await fetch(
        `/api/admin/products/${encodeURIComponent(product.id)}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Impossible de supprimer ce produit."
        );
      }

      if (editingId === product.id) {
        resetForm();
      }

      showMessage("Produit supprimé avec succès.");

      await loadProducts();
    } catch (error) {
      console.error("Erreur suppression produit :", error);

      showError(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue pendant la suppression."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     PUBLIER / MASQUER UN PRODUIT
  ======================================================= */

  async function toggleProduct(product: Product) {
    setLoading(true);
    setMessage("");
    setErrorMessage("");

    try {
      const response = await fetch(
        `/api/admin/products/${encodeURIComponent(product.id)}`,
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
        throw new Error(
          data.error || "Impossible de modifier la visibilité."
        );
      }

      showMessage(
        product.active
          ? "Produit masqué de la boutique."
          : "Produit publié dans la boutique."
      );

      await loadProducts();
    } catch (error) {
      console.error("Erreur visibilité produit :", error);

      showError(
        error instanceof Error
          ? error.message
          : "Impossible de modifier la visibilité du produit."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     RECHERCHE
  ======================================================= */

  const filteredProducts = products.filter((product) => {
    const query = search.toLowerCase().trim();

    if (!query) return true;

    return (
      product.name.toLowerCase().includes(query) ||
      product.slug?.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query)
    );
  });

  const publishedCount = products.filter(
    (product) => product.active
  ).length;

  const hiddenCount = products.length - publishedCount;

  /* =======================================================
     INTERFACE : CONNEXION
  ======================================================= */

  if (!connected) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-green-50 px-4 py-12">
        <div className="w-full max-w-md rounded-3xl border border-green-100 bg-white p-8 shadow-xl">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-green-100 text-3xl font-bold text-green-800">
            BG
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-green-900">
              Espace administrateur
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Beauté Bio by Gnilane
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Connectez-vous pour gérer vos produits.
            </p>
          </div>

          {errorMessage && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <form onSubmit={login} className="mt-7 space-y-5">
            <div>
              <label className={labelStyle}>
                Code administrateur
              </label>

              <input
                type="password"
                value={pin}
                onChange={(event) => setPin(event.target.value)}
                placeholder="Saisissez votre code"
                className={inputStyle}
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`${buttonPrimary} w-full`}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  /* =======================================================
     INTERFACE : TABLEAU DE BORD
  ======================================================= */

  return (
    <main className="min-h-screen bg-green-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* EN-TÊTE */}

        <header className="mb-8 flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-green-900 to-green-700 p-6 text-white shadow-lg sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="text-sm font-medium text-green-100">
              BEAUTÉ BIO BY GNILANE
            </p>

            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
              Gestion des produits
            </h1>

            <p className="mt-2 text-sm text-green-100">
              Gérez votre catalogue, vos photos et la disponibilité de vos produits.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadProducts()}
            disabled={loadingProducts}
            className="rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20 disabled:opacity-50"
          >
            {loadingProducts ? "Actualisation..." : "Actualiser"}
          </button>
        </header>

        {/* NOTIFICATIONS */}

        {message && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-100 px-4 py-3 text-sm font-medium text-green-900">
            {message}
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        )}

        {/* STATISTIQUES */}

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Total des produits
            </p>

            <p className="mt-2 text-3xl font-bold text-green-900">
              {products.length}
            </p>
          </div>

          <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Produits publiés
            </p>

            <p className="mt-2 text-3xl font-bold text-green-700">
              {publishedCount}
            </p>
          </div>

          <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Produits masqués
            </p>

            <p className="mt-2 text-3xl font-bold text-orange-600">
              {hiddenCount}
            </p>
          </div>
        </section>

        {/* FORMULAIRE */}

        <section className="mb-10 rounded-3xl border border-green-100 bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-green-900">
                {editingId ? "Modifier le produit" : "Ajouter un produit"}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Remplissez les informations de votre produit.
              </p>
            </div>

            {editingId && (
              <span className="w-fit rounded-full bg-orange-100 px-4 py-2 text-xs font-bold text-orange-800">
                MODE MODIFICATION
              </span>
            )}
          </div>

          <form onSubmit={saveProduct} className="space-y-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* NOM */}

              <div>
                <label className={labelStyle}>
                  Nom du produit *
                </label>

                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => {
                    const name = event.target.value;

                    setForm((previous) => ({
                      ...previous,
                      name,
                      slug: previous.slug
                        ? previous.slug
                        : createSlug(name),
                    }));
                  }}
                  placeholder="Exemple : Savon naturel au Mbeurbeuff"
                  className={inputStyle}
                  required
                />
              </div>

              {/* SLUG */}

              <div>
                <label className={labelStyle}>
                  Identifiant URL
                </label>

                <input
                  type="text"
                  value={form.slug}
                  onChange={(event) =>
                    updateForm("slug", createSlug(event.target.value))
                  }
                  placeholder="savon-naturel"
                  className={inputStyle}
                />
              </div>

              {/* PRIX */}

              <div>
                <label className={labelStyle}>
                  Prix (FCFA) *
                </label>

                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.price}
                  onChange={(event) =>
                    updateForm("price", event.target.value)
                  }
                  placeholder="1500"
                  className={inputStyle}
                  required
                />
              </div>

              {/* STOCK */}

              <div>
                <label className={labelStyle}>
                  Quantité en stock *
                </label>

                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.stock}
                  onChange={(event) =>
                    updateForm("stock", event.target.value)
                  }
                  placeholder="10"
                  className={inputStyle}
                  required
                />
              </div>

              {/* CATÉGORIE */}

              <div>
                <label className={labelStyle}>
                  Catégorie
                </label>

                <select
                  value={form.category_id}
                  onChange={(event) =>
                    updateForm("category_id", event.target.value)
                  }
                  className={inputStyle}
                >
                  <option value="">
                    Sélectionner une catégorie
                  </option>

                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                {categories.length === 0 && (
                  <p className="mt-2 text-xs text-orange-600">
                    Aucune catégorie disponible ou retournée par l'API.
                  </p>
                )}
              </div>

              {/* VISIBILITÉ */}

              <div>
                <label className={labelStyle}>
                  Visibilité dans la boutique
                </label>

                <select
                  value={form.active ? "true" : "false"}
                  onChange={(event) =>
                    updateForm("active", event.target.value === "true")
                  }
                  className={inputStyle}
                >
                  <option value="true">
                    Publié
                  </option>

                  <option value="false">
                    Masqué
                  </option>
                </select>
              </div>
            </div>

            {/* DESCRIPTION */}

            <div>
              <label className={labelStyle}>
                Description du produit
              </label>

              <textarea
                value={form.description}
                onChange={(event) =>
                  updateForm("description", event.target.value)
                }
                placeholder="Décrivez les bienfaits et les caractéristiques du produit..."
                rows={4}
                className={inputStyle}
              />
            </div>

            {/* IMAGE */}

            <div>
              <label className={labelStyle}>
                Photo du produit
              </label>

              <div className="rounded-2xl border-2 border-dashed border-green-200 bg-green-50/50 p-5">
                {imagePreview ? (
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    <div className="flex h-40 w-40 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-green-100 bg-white">
                      <img
                        src={imagePreview}
                        alt="Aperçu du produit"
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-green-900">
                        Photo sélectionnée
                      </p>

                      <p className="max-w-md break-all text-xs text-gray-500">
                        {form.image_url || "Photo en cours de retrait"}
                      </p>

                      <div className="flex flex-wrap gap-3">
                        <label
                          className={`${buttonSecondary} cursor-pointer`}
                        >
                          {uploadingImage
                            ? "Téléchargement..."
                            : "Changer la photo"}

                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={uploadImage}
                            disabled={uploadingImage || deletingPhoto}
                            className="hidden"
                          />
                        </label>

                        <button
                          type="button"
                          onClick={removePhoto}
                          disabled={deletingPhoto || uploadingImage}
                          className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingPhoto
                            ? "Suppression..."
                            : "Retirer la photo"}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-5 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">
                      +
                    </div>

                    <p className="font-semibold text-green-900">
                      Ajouter une photo
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      JPG, PNG, WEBP ou GIF — 5 Mo maximum
                    </p>

                    <label className="mt-5 inline-flex cursor-pointer items-center justify-center rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800">
                      {uploadingImage
                        ? "Téléchargement..."
                        : "Choisir une image"}

                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={uploadImage}
                        disabled={uploadingImage || deletingPhoto}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* ACTIONS FORMULAIRE */}

            <div className="flex flex-col gap-3 border-t border-green-100 pt-6 sm:flex-row">
              <button
                type="submit"
                disabled={loading || uploadingImage || deletingPhoto}
                className={`${buttonPrimary} flex-1`}
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
                  onClick={resetForm}
                  disabled={loading || deletingPhoto}
                  className={buttonSecondary}
                >
                  Annuler la modification
                </button>
              )}
            </div>
          </form>
        </section>

        {/* LISTE DES PRODUITS */}

        <section className="rounded-3xl border border-green-100 bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-green-900">
                Tous les produits
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Modifiez, publiez, masquez ou supprimez vos produits.
              </p>
            </div>

            <div className="w-full sm:max-w-xs">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher un produit..."
                className={inputStyle}
              />
            </div>
          </div>

          {loadingProducts ? (
            <div className="py-12 text-center">
              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-green-200 border-t-green-700" />

              <p className="mt-4 text-sm text-gray-500">
                Chargement des produits...
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-2xl bg-green-50 px-5 py-12 text-center">
              <p className="text-lg font-semibold text-green-900">
                Aucun produit trouvé
              </p>

              <p className="mt-2 text-sm text-gray-500">
                {search
                  ? "Essayez une autre recherche."
                  : "Ajoutez votre premier produit pour commencer."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <article
                  key={product.id}
                  className="overflow-hidden rounded-2xl border border-green-100 bg-white transition hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* PHOTO */}

                  <div className="relative h-52 bg-green-50">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <div className="text-center">
                          <div className="text-4xl">BG</div>

                          <p className="mt-2 text-xs text-green-800">
                            Aucune photo
                          </p>
                        </div>
                      </div>
                    )}

                    <span
                      className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${product.active
                          ? "bg-green-100 text-green-800"
                          : "bg-orange-100 text-orange-800"
                        }`}
                    >
                      {product.active ? "Publié" : "Masqué"}
                    </span>
                  </div>

                  {/* INFORMATIONS */}

                  <div className="p-5">
                    <h3 className="line-clamp-1 text-lg font-bold text-gray-900">
                      {product.name}
                    </h3>

                    <p className="mt-2 line-clamp-2 min-h-10 text-sm text-gray-500">
                      {product.description || "Aucune description."}
                    </p>

                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-lg font-bold text-green-800">
                        {Number(product.price).toLocaleString("fr-FR")} FCFA
                      </p>

                      <span className="rounded-lg bg-green-50 px-3 py-1 text-xs font-semibold text-green-800">
                        Stock : {product.stock}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => editProduct(product)}
                        disabled={loading}
                        className="rounded-xl border border-green-200 bg-green-50 px-3 py-2.5 text-sm font-semibold text-green-800 transition hover:bg-green-100 disabled:opacity-50"
                      >
                        Modifier
                      </button>

                      <button
                        type="button"
                        onClick={() => void toggleProduct(product)}
                        disabled={loading}
                        className="rounded-xl border border-orange-200 bg-orange-50 px-3 py-2.5 text-sm font-semibold text-orange-800 transition hover:bg-orange-100 disabled:opacity-50"
                      >
                        {product.active ? "Masquer" : "Publier"}
                      </button>

                      <button
                        type="button"
                        onClick={() => void deleteProduct(product)}
                        disabled={loading}
                        className="col-span-2 rounded-xl border border-red-200 bg-white px-3 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        Supprimer le produit
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* PIED DE PAGE */}

        <footer className="py-8 text-center text-xs text-gray-500">
          Beauté Bio by Gnilane — Espace de gestion sécurisé
        </footer>
      </div>
    </main>
  );
}