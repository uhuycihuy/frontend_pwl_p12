self.onmessage = function (e) {
  const { payments, filterDateStart, filterDateEnd } = e.data;

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
    totalPembayaran,
    jumlahTransaksi: filteredPayments.length,
  });
};
