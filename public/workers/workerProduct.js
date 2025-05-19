self.onmessage = function (e) {
  const { type, payload } = e.data;

  if (type === "PROSES_PRODUK") {
    const {
      products,
      sortBy = "name",
      sortOrder = "asc",
      minPrice = Number(payload.minPrice) || 0,
      maxPrice = payload.maxPrice === Infinity ? Infinity : Number(payload.maxPrice) || Infinity,
      searchKeyword = ""
    } = payload;

    // Filter berdasarkan harga
    let result = payload.products.filter(product => {
      const productPrice = Number(product.price);
      return productPrice >= minPrice && productPrice <= maxPrice;
    });

    // Filter berdasarkan keyword (search)
    if (searchKeyword.trim() !== "") {
      const kecilinKeyword = searchKeyword.toLowerCase();
      result = result.filter(product =>
        product.name.toLowerCase().includes(kecilinKeyword)
      );
    }

    // Sorting berdasarkan name atau price
    result.sort((a, b) => {
      let nilaiA = a[sortBy];
      let nilaiB = b[sortBy];

      // Jika sorting berdasarkan nama, bandingkan string
      if (sortBy === "name") {
        nilaiA = nilaiA.toLowerCase();
        nilaiB = nilaiB.toLowerCase();
      }

      if (nilaiA < nilaiB) return sortOrder === "asc" ? -1 : 1;
      if (nilaiA > nilaiB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    // Kirim hasil ke komponen yang membutuhkan
    self.postMessage({
      type: "HASIL_PRODUK",
      payload: {
        filteredProducts: result,
        totalFiltered: result.length
      }
    });
  }
};
