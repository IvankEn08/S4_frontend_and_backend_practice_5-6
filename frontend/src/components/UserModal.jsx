import React, { useEffect, useState } from "react";

const initialFormState = {
  name: "",
  category: "",
  description: "",
  price: "",
  count: "",
};

export default function UserModal({
  open,
  mode,
  initialProduct,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(initialFormState);

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm({
      name: initialProduct?.name ?? "",
      category: initialProduct?.category ?? "",
      description: initialProduct?.description ?? "",
      price: initialProduct?.price ?? "",
      count: initialProduct?.count ?? "",
    });
  }, [initialProduct, open]);

  if (!open) {
    return null;
  }

  const title = mode === "edit" ? "Редактирование товара" : "Создание товара";

  const handleChange = (field) => (event) => {
    setForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload = {
      name: form.name.trim(),
      category: form.category.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      count: Number(form.count),
    };

    if (!payload.name) {
      alert("Введите название товара");
      return;
    }

    if (!payload.category) {
      alert("Введите категорию");
      return;
    }

    if (!payload.description) {
      alert("Введите описание");
      return;
    }

    if (!Number.isFinite(payload.price) || payload.price < 0) {
      alert("Введите корректную цену");
      return;
    }

    if (!Number.isFinite(payload.count) || payload.count < 0) {
      alert("Введите корректное количество");
      return;
    }

    onSubmit({
      id: initialProduct?.id,
      ...payload,
    });
  };

  return (
    <div className="backdrop" onMouseDown={onClose}>
      <div
        className="modal"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal__header">
          <div className="modal__title">{title}</div>
          <button className="iconBtn" onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <label className="label">
            Название
            <input
              className="input"
              value={form.name}
              onChange={handleChange("name")}
              placeholder="Например, Брелок со звездой"
              autoFocus
            />
          </label>

          <label className="label">
            Категория
            <input
              className="input"
              value={form.category}
              onChange={handleChange("category")}
              placeholder="Например, Подарки"
            />
          </label>

          <label className="label">
            Описание
            <input
              className="input"
              value={form.description}
              onChange={handleChange("description")}
              placeholder="Коротко опишите товар"
            />
          </label>

          <label className="label">
            Цена
            <input
              className="input"
              value={form.price}
              onChange={handleChange("price")}
              placeholder="Например, 1500"
              inputMode="numeric"
            />
          </label>

          <label className="label">
            Количество на складе
            <input
              className="input"
              value={form.count}
              onChange={handleChange("count")}
              placeholder="Например, 10"
              inputMode="numeric"
            />
          </label>

          <div className="modal__footer">
            <button type="button" className="btn" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="btn btn--primary">
              {mode === "edit" ? "Сохранить" : "Создать"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
