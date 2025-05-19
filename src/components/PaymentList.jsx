import React, { useState, useEffect } from 'react';
import axios from "axios";
import { toast } from 'react-toastify';

const PaymentList = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await axios.get('http://localhost:5000/payments');
        setPayments(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
        toast.error(err.response?.data?.message || 'Failed to fetch payments');
      }
    };

    fetchPayments();
  }, []);

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) return <div className="has-text-centered">Loading payments...</div>;
  if (error) return <div className="has-text-centered has-text-danger">Error: {error}</div>;

  return (
    <div className="container">
      <h1 className='title'>Payments</h1>
      <h2 className='subtitle'>List of Payments</h2>
      
      <div className="table-container">
        <table className='table is-striped is-fullwidth is-hoverable'>
          <thead>
            <tr>
              <th>No</th>
              <th>Customer Name</th>
              <th>Cashier</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total Price</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.length > 0 ? (
              payments.map((payment, index) => (
                <tr key={payment.uuid}>
                  <td>{index + 1}</td>
                  <td>{payment.nama_pembeli}</td>
                  <td>
                    <div>{payment.user.name}</div>
                    <div className="is-size-7 has-text-grey">{payment.user.email}</div>
                  </td>
                  <td>{payment.nama_produk}</td>
                  <td>{payment.jumlah}</td>
                  <td>{formatCurrency(payment.product.price)}</td>
                  <td>{formatCurrency(payment.total_harga)}</td>
                  <td>{formatDate(payment.tanggal)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="has-text-centered">No payment data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentList;