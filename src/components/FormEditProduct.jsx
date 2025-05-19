import React, {useEffect, useState} from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const FormEditProduct = () => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [file, setFile] = useState(null); 
    const [msg, setMsg] = useState('');
    const [preview, setPreview] = useState("");
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        const getProductById = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/products/${id}`);
            setName(response.data.name);
            setPrice(response.data.price);
            setFile(response.data.file);
            setPreview(response.data.url);
        } catch (error) {
            if (error.response) {
            setMsg(error.response.data.msg);
            }
        }
        };
        getProductById();
    }, [id]);

    const loadImage = (e) => {
        const image = e.target.files[0];
        setFile(image);
        setPreview(URL.createObjectURL(image));
    };

    const updateProduct = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', name);
        formData.append('price', price);
        formData.append('file', file); 

        try {
        await axios.patch(`http://localhost:5000/products/${id}`, formData, {
            headers: {
            'Content-Type': 'multipart/form-data',
            },
            withCredentials: true, 
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
            <h1 className='title'>Products</h1>
            <h2 className='subtitle'>Edit Product</h2>
            <div className="card is-shadowless">
                <div className="card-content">
                    <div className="content">
                        
                        {msg && (
                            <div className="notification is-danger">
                                {msg}
                            </div>
                        )}

                        <form onSubmit={updateProduct}>
                        <div className="field">
                            <label className="label">Name</label>
                            <div className="control">
                                <input 
                                    type="text" 
                                    className="input" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder='Product Name'
                                />
                            </div>
                        </div>
                        <div className="field">
                            <label className="label">Price</label>
                            <div className="control">
                                <input 
                                    type="text" 
                                    className="input" 
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder='Price'
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
                                        name="image" 
                                        onChange={loadImage}
                                    />
                                    <span className="file-cta">
                                    <span className="file-icon">
                                        📁
                                    </span>
                                    <span className="file-label">
                                        Choose a file…
                                    </span>
                                    </span>
                                </label>
                                </div>
                            </div>
                        </div>

                        {preview && (
                            <div className="field">
                                <figure className="image is-128x128 mb-4">
                                    <img src={preview} alt="Preview of uploaded product" />
                                </figure>
                            </div>
                        )}

                        <div className="field">
                            <div className="control">
                                <button type="submit" className="button is-success">Update</button>
                            </div>
                        </div>
                    </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FormEditProduct