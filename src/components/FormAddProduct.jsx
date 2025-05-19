import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const FormAddProduct = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [file, setFile] = useState(null); // ubah ke null karena file adalah objek
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const saveProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('file', file); // nama "file" harus sama dengan req.files.file di backend

    try {
      await axios.post('http://localhost:5000/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true, // jika kamu pakai cookie login (optional)
      });
      navigate('/productlists');
    } catch (error) {
      if (error.response) {
        setMsg(error.response.data.msg);
      }
    }
  };

  return (
    <div>
      <h1 className="title">Products</h1>
      <h2 className="subtitle">Add New Product</h2>
      <div className="card is-shadowless">
        <div className="card-content">
          <div className="content">
            <form onSubmit={saveProduct}>
              <p className="has-text-danger">{msg}</p>

              <div className="field">
                <label className="label">Name</label>
                <div className="control">
                  <input
                    type="text"
                    className="input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Product Name"
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label className="label">Price</label>
                <div className="control">
                  <input
                    type="number"
                    className="input"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Price"
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label className="label">Image</label>
                <div className="control">
                  <div className="file has-name is-fullwidth">
                    <label className="file-label">
                      <input
                        className="file-input"
                        type="file"
                        name="file"
                        onChange={(e) => setFile(e.target.files[0])} // ambil objek file
                        required
                      />
                      <span className="file-cta">
                        <span className="file-icon">📁</span>
                        <span className="file-label">Choose a file…</span>
                      </span>
                      <span className="file-name">
                        {file ? file.name : 'No file selected'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="field">
                <div className="control">
                  <button type="submit" className="button is-success">
                    Save
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormAddProduct;
