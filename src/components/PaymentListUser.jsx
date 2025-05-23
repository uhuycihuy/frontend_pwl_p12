import React, { useState, useEffect, useRef } from 'react';
import axios from "axios";
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

const PaymentListUser = () => {
  const [payments, setPayments] = useState([]);
  const [originalPayments, setOriginalPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalFiltered, setTotalFiltered] = useState(0);
  const [jumlahTransaksi, setJumlahTransaksi] = useState(0);
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');
  
  const workerRef = useRef();
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    workerRef.current = new Worker('/workers/workerPayment.js');

    workerRef.current.onmessage = (e) => {
      setPayments(e.data.payments || []);
      setTotalFiltered(e.data.totalPembayaran || 0);
      setJumlahTransaksi(e.data.jumlahTransaksi || 0);
    };

    return () => {
      if (workerRef.current) workerRef.current.terminate();
    };
  }, []);

  useEffect(() => {
    const fetchUserPayments = async () => {
      try {
        const response = await axios.get('http://localhost:5000/payments/me', {
          withCredentials: true
        });
        setOriginalPayments(response.data);
        setLoading(false);

        workerRef.current.postMessage({
          payments: response.data,
          action: 'RESET'
        });

      } catch (err) {
        const errorMessage = err.response?.data?.msg || err.response?.data?.message || err.message;
        setError(errorMessage);
        setLoading(false);
        toast.error(errorMessage || 'Failed to fetch payments');
      }
    };

    if (user) {
      fetchUserPayments();
    }
  }, [user]);

  useEffect(() => {
    if (workerRef.current && originalPayments.length > 0) {
      if (filterDateStart || filterDateEnd) {
        workerRef.current.postMessage({
          payments: originalPayments,
          action: 'FILTER_BY_DATE',
          filterDateStart,
          filterDateEnd,
        });
      } else {
        workerRef.current.postMessage({
          payments: originalPayments,
          action: 'RESET'
        });
      }
    }
  }, [originalPayments, filterDateStart, filterDateEnd]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleFilterPreset = (type) => {
    const now = new Date();
    let startDate = new Date();

    if (type === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (type === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    }

    setFilterDateStart(startDate.toISOString().split("T")[0]);
    setFilterDateEnd(now.toISOString().split("T")[0]);
  };

  const resetFilter = () => {
    setFilterDateStart('');
    setFilterDateEnd('');
  };

  if (!user) return <div className="has-text-centered">Please login to view your payments</div>;
  if (loading) return <div className="has-text-centered">Loading your payments...</div>;
  if (error) return <div className="has-text-centered has-text-danger">Error: {error}</div>;

  return (
    <div className="container">
      <h1 className='title has-text-black'>My Payments</h1>
      <h2 className='subtitle has-text-black'>List of Your Payment History</h2>

      <div className="box mb-4">
        <div className="buttons">
          <button className="button is-info" onClick={() => handleFilterPreset('week')}>
            Filter Mingguan
          </button>
          <button className="button is-warning" onClick={() => handleFilterPreset('month')}>
            Filter Bulanan
          </button>
          <button className="button is-danger" onClick={resetFilter}>
            Reset Filter
          </button>
        </div>
        <div className="field is-grouped mt-2">
          <div className="control">
            <label className="label">Tanggal Mulai</label>
            <input
              className="input"
              type="date"
              value={filterDateStart}
              onChange={(e) => setFilterDateStart(e.target.value)}
            />
          </div>
          <div className="control ml-3">
            <label className="label">Tanggal Akhir</label>
            <input
              className="input"
              type="date"
              value={filterDateEnd}
              onChange={(e) => setFilterDateEnd(e.target.value)}
            />
          </div>
        </div>
        {payments.length > 0 && (
          <div className="notification is-info mb-4">
            <p><strong>Total Transactions:</strong> {jumlahTransaksi}</p>
            <p><strong>Total Spent:</strong> {formatCurrency(totalFiltered)}</p>
          </div>
        )}
      </div>

      <div className="table-container">
        <table className='table is-striped is-fullwidth is-hoverable'>
          <thead>
            <tr>
              <th>No</th>
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
                  <td>{payment.nama_produk}</td>
                  <td>{payment.jumlah}</td>
                  <td>{formatCurrency(payment.product?.price || 0)}</td>
                  <td>{formatCurrency(payment.total_harga)}</td>
                  <td>{formatDate(payment.tanggal)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="has-text-centered">No payment history found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentListUser;
