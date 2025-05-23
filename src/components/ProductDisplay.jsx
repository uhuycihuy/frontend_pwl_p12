import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import '../css/ProductDisplay.css';

const ProductDisplay = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [searchKeyword, setSearchKeyword] = useState("");
  const [produkDipilih, setProdukDipilih] = useState(null);
  const [pembeli, setPembeli] = useState('');
  const [jumlah, setJumlah] = useState(1);
  const workerRef = useRef(null);

  useEffect(() => {
    workerRef.current = new Worker('/workers/workerProduct.js');
    
    workerRef.current.onmessage = (event) => {
      if (event.data.type === "HASIL_PRODUK") {
        setFilteredProducts(event.data.payload.filteredProducts);
      }
    };

    getProducts();
      return () => {
        workerRef.current.terminate();
      };
    }, []);

  const getProducts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Error mengambil produk:", error);
      alert("Gagal memuat produk");
    }
  };

  const processProducts = useCallback(() => {
    workerRef.current.postMessage({
      type: "PROSES_PRODUK",
      payload: {
        products,
        sortBy,
        sortOrder,
        minPrice: minPrice === '' ? 0 : Number(minPrice),
        maxPrice: maxPrice === '' ? Infinity : Number(maxPrice),
        searchKeyword
      }
    });
  }, [products, sortBy, sortOrder, minPrice, maxPrice, searchKeyword]);

  useEffect(() => {
    if (products.length > 0) {
      processProducts();
    }
  }, [products.length, processProducts]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleMinPriceChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^[0-9\b]+$/.test(value)) {
      setMinPrice(value);
    }
  };

  const handleMaxPriceChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^[0-9\b]+$/.test(value)) {
      setMaxPrice(value);
    }
  };

  const handleBayar = async () => {
    if (!produkDipilih?.uuid || !pembeli || !jumlah) {
      return alert("Lengkapi semua data!");
    }

    if (jumlah < 1) {
      return alert("Jumlah harus minimal 1");
    }

    try {
      const paymentData = {
        nama_pembeli: pembeli,
        productId: produkDipilih.uuid,
        jumlah: Number(jumlah)
      };

      const response = await axios.post('http://localhost:5000/payments', paymentData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      alert(`Pembayaran berhasil!\n
             ID Transaksi: ${response.data.payment.uuid}\n
             Produk: ${response.data.payment.nama_produk}\n
             Total: Rp${response.data.payment.total_harga.toLocaleString()}`);

      setPembeli('');
      setJumlah(1);
      setProdukDipilih(null);

    } catch (error) {
      let errorMessage = "Pembayaran gagal";
      if (error.response?.data?.msg) {
        errorMessage = error.response.data.msg;
      }
      if (error.response?.data?.errors) {
        errorMessage += ": " + error.response.data.errors.join(", ");
      }
      alert(errorMessage);
    }
  };

  return (
    <div className="container mt-5">

      <h1 className="title has-text-black">Daftar Produk</h1>
      <h2 className="subtitle has-text-black">Pilih produk yang ingin dibeli</h2>
      <div className="box mb-4">
        <div className="field is-horizontal">
          <div className="field-body">
            <div className="field">
              <label className="label">Cari Produk</label>
              <div className="control">
                <input
                  className="input"
                  type="text"
                  placeholder="Cari produk..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
              </div>
            </div>
            
            <div className="field">
              <label className="label">Harga Minimal</label>
              <div className="control">
                <input
                  className="input"
                  type="text"
                  placeholder="Harga minimal"
                  value={minPrice}
                  onChange={handleMinPriceChange}
                  pattern="[0-9]*" 
                />
              </div>
            </div>
            
            <div className="field">
              <label className="label">Harga Maksimal</label>
              <div className="control">
                <input
                  className="input"
                  type="text"
                  placeholder="Harga maksimal"
                  value={maxPrice}
                  onChange={handleMaxPriceChange}
                  pattern="[0-9]*"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="buttons mb-4">
        <button 
          className={`button ${sortBy === 'name' ? 'is-primary' : ''}`}
          onClick={() => handleSort('name')}
        >
          Urutkan Nama {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button 
          className={`button ${sortBy === 'price' ? 'is-primary' : ''}`}
          onClick={() => handleSort('price')}
        >
          Urutkan Harga {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
      </div>

      <div className={produkDipilih ? 'blur-background' : ''}>
        <div className="columns is-multiline">
          {filteredProducts.map((product) => (
            <div className="column is-one-quarter" key={product.uuid}>
              <div className="card">
                <div className="card-image">
                  <figure className="image is-4by3">
                    <img src={product.url} alt={product.name} />
                  </figure>
                </div>
                <div className="card-content">
                  <div className="media-content">
                    <p className="title is-4">{product.name}</p>
                    <p className="subtitle is-6">Rp{product.price.toLocaleString()}</p>
                  </div>
                </div>
                <footer className="card-footer">
                  <button 
                    className="card-footer-item button is-text"
                    onClick={() => setProdukDipilih(product)}
                    style={{background: 'none', border: 'none', cursor: 'pointer'}}
                  >
                    Beli
                  </button>
                </footer>
              </div>
            </div>
          ))}
        </div>
      </div>

      {produkDipilih && (
        <div className="modal is-active">
          <div className="modal-background" onClick={() => setProdukDipilih(null)}></div>
          <div className="modal-card">
            <header className="modal-card-head">
              <p className="modal-card-title">Pembayaran</p>
              <button 
                className="delete" 
                aria-label="close" 
                onClick={() => setProdukDipilih(null)}
              ></button>
            </header>
            <section className="modal-card-body">
              <div className="field">
                <label className="label">Nama Pembeli</label>
                <div className="control">
                  <input
                    className="input"
                    type="text"
                    placeholder="Masukkan nama pembeli"
                    value={pembeli}
                    onChange={(e) => setPembeli(e.target.value)}
                  />
                </div>
              </div>

              <div className="field">
                <label className="label">Jumlah</label>
                <div className="control">
                  <input
                    className="input"
                    type="number"
                    placeholder="Masukkan jumlah"
                    value={jumlah}
                    onChange={(e) => setJumlah(parseInt(e.target.value) || 0)}
                    min="1"
                  />
                </div>
              </div>

              <div className="field">
                <p className="has-text-weight-semibold">
                  Total Harga: Rp{(produkDipilih.price * jumlah).toLocaleString()}
                </p>
              </div>
            </section>
            <footer className="modal-card-foot">
              <button className="button is-primary" onClick={handleBayar}>
                Bayar Sekarang
              </button>
              <button 
                className="button" 
                onClick={() => setProdukDipilih(null)}
              >
                Batal
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDisplay;