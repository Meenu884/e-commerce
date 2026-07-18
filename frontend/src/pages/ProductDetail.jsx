import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, formatPrice } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState(null);
  const { user } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    api.getProduct(id).then(setProduct);
  }, [id]);

  if (!product) return <div className="loading-state">Loading item…</div>;

  async function handleAdd() {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await addItem(product.id, quantity);
      setStatus({ type: 'success', message: 'Added to cart.' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    }
  }

  return (
    <div className="container product-detail">
      <img src={product.image_url} alt={product.name} />
      <div className="detail-meta">
        <div className="eyebrow">
          {product.category} — SKU {product.sku}
        </div>
        <h1 style={{ fontSize: '2.4rem' }}>{product.name}</h1>
        <p style={{ color: 'var(--ink-soft)', maxWidth: '48ch' }}>{product.description}</p>

        <table className="spec-table">
          <tbody>
            <tr>
              <td>Price</td>
              <td className="mono">{formatPrice(product.price_cents)}</td>
            </tr>
            <tr>
              <td>Material</td>
              <td>{product.material || '—'}</td>
            </tr>
            <tr>
              <td>Availability</td>
              <td>{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</td>
            </tr>
          </tbody>
        </table>

        {status && <div className={status.type === 'error' ? 'error-banner' : 'success-banner'}>{status.message}</div>}

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input
            className="qty-input"
            type="number"
            min="1"
            max={product.stock}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            disabled={product.stock === 0}
          />
          <button className="btn btn-primary" onClick={handleAdd} disabled={product.stock === 0}>
            {product.stock === 0 ? 'Out of stock' : 'Add to cart'}
          </button>
        </div>

        <Link to="/" className="mono" style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>
          ← Back to catalog
        </Link>
      </div>
    </div>
  );
}
