import React from "react";

export default function ProductsItem({ product, onEdit, onDelete }) {
  return (
    <article className="productCard">
      <div className="productCard__top">
        <div>
          <div className="productCard__id">#{product.id}</div>
          <h2 className="productCard__name">{product.name}</h2>
        </div>
        <span className="productCard__category">{product.category}</span>
      </div>

      <p className="productCard__description">{product.description}</p>

      <div className="productCard__meta">
        <div className="metaItem">
          <span className="metaItem__label">Цена</span>
          <span className="metaItem__value">{product.price} ₽</span>
        </div>
        <div className="metaItem">
          <span className="metaItem__label">Остаток</span>
          <span className="metaItem__value">{product.count} шт.</span>
        </div>
      </div>

      <div className="productCard__actions">
        <button className="btn" onClick={() => onEdit(product)}>
          Редактировать
        </button>
        <button className="btn btn--danger" onClick={() => onDelete(product.id)}>
          Удалить
        </button>
      </div>
    </article>
  );
}
