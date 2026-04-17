import React from "react";
import ProductsItem from "./ProductsItem";

export default function ProductsList({ products, onEdit, onDelete }) {
  if (!products.length) {
    return <div className="empty">Товаров пока нет</div>;
  }

  return (
    <div className="list">
      {products.map((product) => (
        <ProductsItem
          key={product.id}
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
