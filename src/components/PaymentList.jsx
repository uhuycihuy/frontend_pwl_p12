import React, { useState, useEffect, useRef } from 'react';
import axios from "axios";
import { toast } from 'react-toastify';

const PaymentList = () => {
  const [payments, setPayments] = useState([]);
  const [originalPayments, setOriginalPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalFiltered, setTotalFiltered] = useState(0);
  const [jumlahTransaksi, setJumlahTransaksi] = useState(0);
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');

  const workerRef = useRef();

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
    const fetchPayments = async () => {
      try {
        const response = await axios.get('http://localhost:5000/payments');
        setPayments(response.data);
        setOriginalPayments(response.data); // Simpan data original
        setLoading(false);
        
        // Hitung total awal
        workerRef.current.postMessage({
          payments: response.data,
          action: 'RESET'
        });
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
        toast.error(err.response?.data?.message || 'Failed to fetch payments');
      }
    };

    fetchPayments();
  }, []);

  // Kirim data ke worker saat filter berubah
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

  const handleFilterPreset = (type) => {
    const now = new Date();
    let startDate;
    if (type === 'week') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else if (type === 'month') {
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
    }
    setFilterDateStart(startDate.toISOString().split("T")[0]);
    setFilterDateEnd(now.toISOString().split("T")[0]);
  };

  const resetFilter = () => {
    setFilterDateStart('');
    setFilterDateEnd('');
    // Worker akan menangani reset secara otomatis melalui useEffect
  };

  if (loading) return <div className="has-text-centered">Loading payments...</div>;
  if (error) return <div className="has-text-centered has-text-danger">Error: {error}</div>;

  return (
    <div className="container">
      <h1 className='title has-text-black'>Payments</h1>
      <h2 className='subtitle has-text-black'>List of Payments</h2>

      {/* FILTER */}
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

        <div className="notification is-primary mt-3">
          <strong>Total Pendapatan Kotor:</strong> {formatCurrency(totalFiltered)} <br />
          <strong>Jumlah Transaksi:</strong> {jumlahTransaksi}
        </div>
      </div>

      {/* TABLE */}
      <div className="table-container">
        <table className='table is-striped is-fullwidth is-hoverable'>
          <thead>
            <tr>
              <th>No</th>
              <th>Customer Name</th>
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
                  <td>{payment.nama_produk}</td>
                  <td>{payment.jumlah}</td>
                  <td>{formatCurrency(payment.product?.price || 0)}</td>
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