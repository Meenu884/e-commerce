import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, formatPrice } from '../../api/client';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function load() {
    setLoading(true);
    api
      .listProducts({ include_inactive: true })
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDelete(id, name) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await api.deleteProduct(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <div className="loading-state">Loading products…</div>;

  return (
    <div>
      <div className="admin-toolbar">
        <h2 style={{ fontSize: '1.6rem' }}>Products ({products.length})</h2>
        <Link to="/admin/products/new" className="btn btn-primary">
          + Add product
        </Link>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {products.length === 0 ? (
        <div className="empty-state">No products yet. Add your first one.</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td className="mono">{p.sku}</td>
                <td>{p.category}</td>
                <td className="mono">{formatPrice(p.price_cents)}</td>
                <td>{p.stock}</td>
                <td>
                  <span className={`badge ${p.is_active ? 'active' : 'inactive'}`}>
                    {p.is_active ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td style={{ display: 'flex', gap: 8 }}>
                  <Link to={`/admin/products/${p.id}/edit`} className="btn btn-outline" style={{ padding: '6px 12px' }}>
                    Edit
                  </Link>
                  <button className="btn btn-danger" style={{ padding: '6px 12px' }} onClick={() => handleDelete(p.id, p.name)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
