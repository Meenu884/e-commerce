import { Link } from 'react-router-dom';
import { formatPrice } from '../api/client';

export default function ProductCard({ product }) {
  const lowStock = product.stock > 0 && product.stock <= 5;
  const outOfStock = product.stock === 0;

  return (
    <Link to={`/products/${product.id}`} className="tag-card">
      {product.image_url && <img className="tag-image" src={product.image_url} alt={product.name} loading="lazy" />}
      <div className="tag-category">{product.category}</div>
      <h3>{product.name}</h3>
      <div className="tag-sku">SKU {product.sku}</div>
      <div className="tag-row">
        <span className="price">{formatPrice(product.price_cents)}</span>
        <span className={`stock-flag ${lowStock ? 'low' : ''}`}>
          {outOfStock ? 'Out of stock' : lowStock ? `Only ${product.stock} left` : 'In stock'}
        </span>
      </div>
    </Link>
  );
}
