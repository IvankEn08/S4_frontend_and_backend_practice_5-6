import React, { useEffect, useState } from "react";
import "./ProductsPage.scss";
import ProductsList from "../../components/ProductsList";
import UserModal from "../../components/UserModal";
import { api } from "../../api";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await api.getProducts();
      setProducts(data);
    } catch (requestError) {
      console.error(requestError);
      setError("Не удалось загрузить список товаров");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setModalMode("create");
    setEditingProduct(null);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setModalMode("edit");
    setEditingProduct(product);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
  };

  const handleDelete = async (id) => {
    const shouldDelete = window.confirm("Удалить товар?");
    if (!shouldDelete) {
      return;
    }

    try {
      await api.deleteProduct(id);
      setProducts((prev) => prev.filter((product) => product.id !== id));
    } catch (requestError) {
      console.error(requestError);
      alert("Не удалось удалить товар");
    }
  };

  const handleSubmitModal = async (payload) => {
    try {
      if (modalMode === "create") {
        const newProduct = await api.createProduct(payload);
        setProducts((prev) => [...prev, newProduct]);
      } else {
        const updatedProduct = await api.updateProduct(payload.id, payload);
        setProducts((prev) =>
          prev.map((product) =>
            product.id === payload.id ? updatedProduct : product
          )
        );
      }

      closeModal();
    } catch (requestError) {
      console.error(requestError);
      alert("Не удалось сохранить товар");
    }
  };

  return (
    <div className="page">
      <header className="header">
        <div className="header__inner">
          <div className="brand">
            <span className="brand__title">Products App</span>
          </div>
          <a
            className="header__link"
            href="http://localhost:3000/api-docs"
            target="_blank"
            rel="noreferrer"
          >
          </a>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <div className="hero">
            <div>
              <h1 className="title">Управление товарами</h1>
            </div>

            <button className="btn btn--primary" onClick={openCreate}>
              + Добавить товар
            </button>
          </div>

          {loading && <div className="empty">Загрузка...</div>}
          {!loading && error && <div className="empty empty--error">{error}</div>}
          {!loading && !error && (
            <ProductsList
              products={products}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      </main>

      <UserModal
        open={modalOpen}
        mode={modalMode}
        initialProduct={editingProduct}
        onClose={closeModal}
        onSubmit={handleSubmitModal}
      />
    </div>
  );
}
