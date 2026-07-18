import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../api/client';

export default function Cart() {
  const { cart, updateItem, removeItem } = useCart();
  const navigate = useNavigate();

  if (cart.items.length === 0) {
    return (
      <div className="container">
        <div className="empty-state">
          Your cart is empty.
          <div style={{ marginTop: 16 }}>
            <Link to="/" className="btn btn-outline">
              Browse the catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '48px 24px 80px', maxWidth: 780 }}>
      <h2 style={{ marginBottom: 24 }}>Your cart</h2>
      {cart.items.map((item) => (
        <div className="cart-line" key={item.product_id}>
          <img src={item.image_url} alt={item.name} />
          <div>
            <div style={{ fontWeight: 600 }}>{item.name}</div>
            <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>
              SKU {item.sku}
            </div>
          </div>
          <input
            className="qty-input"
            type="number"
            min="1"
            value={item.quantity}
            onChange={(e) => updateItem(item.product_id, Math.max(1, Number(e.target.value)))}
          />
          <span className="mono">{formatPrice(item.subtotal_cents)}</span>
          <button className="btn btn-danger" onClick={() => removeItem(item.product_id)}>
            Remove
          </button>
        </div>
      ))}

      <div className="cart-summary">
        <span>Total</span>
        <span>{formatPrice(cart.total_cents)}</span>
      </div>

      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={() => navigate('/checkout')}>
          Proceed to checkout
        </button>
      </div>
    </div>
  );
}
