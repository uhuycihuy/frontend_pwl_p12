import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/ProductDisplay.css';

const ProductDisplay = () => {
  const [products, setProducts] = useState([]);
  const [produkDipilih, setProdukDipilih] = useState(null);
  const [pembeli, setPembeli] = useState('');
  const [jumlah, setJumlah] = useState(1);

  const getProducts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Error mengambil produk:", error);
      alert("Gagal memuat produk");
    }
  };

  const handleBayar = async () => {
    console.log("Produk yang akan dibayar:", produkDipilih);

    if (!produkDipilih?.uuid || !pembeli || !jumlah) {
        console.log("Data yang kurang:", {
            productId: produkDipilih?.uuid,
            nama_pembeli: pembeli,
            jumlah: jumlah
        });
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

        console.log("Data yang dikirim ke backend:", paymentData);

        const response = await axios.post('http://localhost:5000/payments', paymentData, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });

        alert(`Pembayaran berhasil!\n
               ID Transaksi: ${response.data.payment.uuid}\n
               Produk: ${response.data.payment.nama_produk}\n
               Total: Rp${response.data.payment.total_harga.toLocaleString()}`);

        // Reset form
        setPembeli('');
        setJumlah(1);
        setProdukDipilih(null);

    } catch (error) {
        console.error("Detail error:", error.response?.data || error.message);
        
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

  useEffect(() => {
    getProducts();
  }, []);

  return (
    <div className="container mt-5">
      {/* Tampilan Produk */}
      <div className={produkDipilih ? 'blur-background' : ''}>
        <h1 className="title">Daftar Produk</h1>
        <h2 className="subtitle">Pilih produk yang ingin dibeli</h2>

        <div className="columns is-multiline">
          {products.map((product) => (
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

      {/* Form Pembayaran */}
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