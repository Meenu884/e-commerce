import { useEffect, useState } from 'react';
import { api } from '../api/client';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (category) params.category = category;
    if (search) params.search = search;
    api
      .listProducts(params)
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [category, search]);

  return (
    <>
      <div className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="eyebrow">Est. workshop supply co.</div>
            <h1>Goods built to be used, not admired.</h1>
            <p>
              Hand tools, workwear, and shop essentials sourced from small-batch makers.
              Every piece in the catalog is stocked, tagged, and ready to ship from the warehouse floor.
            </p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div className="stamp">{products.length} items catalogued</div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="catalog-toolbar">
          <div className="category-pills">
            <button className={`pill ${category === '' ? 'active' : ''}`} onClick={() => setCategory('')}>
              All
            </button>
            {categories.map((c) => (
              <button key={c} className={`pill ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>
                {c}
              </button>
            ))}
          </div>
          <input
            className="search-input"
            placeholder="Search the catalog…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="loading-state">Pulling inventory…</div>
        ) : products.length === 0 ? (
          <div className="empty-state">No items match that search. Try a different term or category.</div>
        ) : (
          <div className="product-grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
