import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from "react-router-dom";
import axios from "axios";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [searchKeyword, setSearchKeyword] = useState("");
  const [totalFiltered, setTotalFiltered] = useState(0);
  const workerRef = useRef(null);

  useEffect(() => {
    // Initialize the web worker
    workerRef.current = new Worker('/workers/workerProduct.js');
    
    workerRef.current.onmessage = (event) => {
      if (event.data.type === "HASIL_PRODUK") {
        setFilteredProducts(event.data.payload.filteredProducts);
        setTotalFiltered(event.data.payload.totalFiltered);
      }
    };

    getProducts();

    // Cleanup the worker when component unmounts
    return () => {
      workerRef.current.terminate();
    };
  }, []);

  // useEffect(() => {
  //   if (products.length > 0) {
  //     processProducts();
  //   }
  // }, [products, sortBy, sortOrder, minPrice, maxPrice, searchKeyword]);

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

  const deleteProduct = async (productId) => {
    await axios.delete(`http://localhost:5000/products/${productId}`);
    getProducts();
  };

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
    // Hanya mengizinkan angka atau string kosong
    if (value === '' || /^[0-9\b]+$/.test(value)) {
      setMinPrice(value);
    }
  };

  const handleMaxPriceChange = (e) => {
    const value = e.target.value;
    // Hanya mengizinkan angka atau string kosong
    if (value === '' || /^[0-9\b]+$/.test(value)) {
      setMaxPrice(value);
    }
  };

  return (
    <div>
      <h1 className='title has-text-black'>Products</h1>
      <h2 className='subtitle has-text-black'>List of Products</h2>
      
      {/* Filter and Search Controls */}
      <div className="box mb-4">
        <div className="field is-horizontal">
          <div className="field-body">
            <div className="field">
              <label className="label">Search</label>
              <div className="control">
                <input
                  className="input"
                  type="text"
                  placeholder="Search products..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
              </div>
            </div>
            
            <div className="field">
              <label className="label">Min Price</label>
              <div className="control">
                <input
                  className="input"
                  type="text"
                  placeholder="Min price"
                  value={minPrice}
                  onChange={handleMinPriceChange}
                  pattern="[0-9]*" 
                />
              </div>
            </div>
            
            <div className="field">
              <label className="label">Max Price</label>
              <div className="control">
                <input
                  className="input"
                  type="number"
                  placeholder="Max price"
                  value={maxPrice}
                  onChange={handleMaxPriceChange}
                  pattern="[0-9]*"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="is-flex is-justify-content-space-between is-align-items-center mb-4">
        <div>
          <Link to="/products/add" className="button is-primary">
            Add New Product
          </Link>
        </div>
        <div className="has-text-weight-semibold">
          Showing {totalFiltered} of {products.length} products
        </div>
      </div>
      
      <table className='table is-striped is-fullwidth'>
        <thead>
          <tr>
            <th>No</th>
            <th>Picture Product</th>
            <th>
              <button 
                className="button is-ghost"
                onClick={() => handleSort("name")}
              >
                Name Product
                {sortBy === "name" && (
                  <span className="icon ml-1">
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </button>
            </th>
            <th>
              <button 
                className="button is-ghost"
                onClick={() => handleSort("price")}
              >
                Price
                {sortBy === "price" && (
                  <span className="icon ml-1">
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </button>
            </th>
            <th>Created By</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product, index) => (
            <tr key={product.uuid}>
              <td>{index + 1}</td>
              <td>
                <img src={product.url} alt={product.name} width="100" />
              </td>
              <td>{product.name}</td>
              <td>{product.price}</td>
              <td>{product.user.name}</td>
              <td>
                <Link
                  to={`/products/edit/${product.uuid}`}
                  className="button is-small is-info"
                >
                  Edit
                </Link>
                <button
                  onClick={() => deleteProduct(product.uuid)}
                  className="button is-small is-danger ml-2"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductList;