self.onmessage = function (e) {
  const { payments, action, filterDateStart, filterDateEnd } = e.data;

  switch (action) {
    case 'FILTER_BY_DATE':
      const filteredPayments = payments.filter((payment) => {
        const paymentDate = new Date(payment.tanggal);
        return (
          (!filterDateStart || new Date(filterDateStart) <= paymentDate) &&
          (!filterDateEnd || new Date(filterDateEnd) >= paymentDate)
        );
      });

      const totalPembayaran = filteredPayments.reduce(
        (sum, payment) => sum + payment.total_harga,
        0
      );

      self.postMessage({
        payments: filteredPayments,
        totalPembayaran,
        jumlahTransaksi: filteredPayments.length,
      });
      break;

    case 'RESET':
      const totalAll = payments.reduce(
        (sum, payment) => sum + payment.total_harga,
        0
      );

      self.postMessage({
        payments: payments,
        totalPembayaran: totalAll,
        jumlahTransaksi: payments.length,
      });
      break;

    default:
      self.postMessage({
        payments: payments,
        totalPembayaran: 0,
        jumlahTransaksi: 0,
      });
  }
};