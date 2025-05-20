import React, { useState, useEffect } from "react";
import axios from "axios";
import ReactPaginate from "react-paginate";
import '../css/Pagination.css';

const LogActivityList = () => {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(0);
  const limit = 20; // Tidak perlu pakai useState
  const [pages, setPages] = useState(0);
  const [rows, setRows] = useState(0);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const getLogs = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/logs?page=${page}&limit=${limit}`
        );
        setLogs(response.data.result);
        setPage(response.data.page);
        setPages(response.data.totalPage);
        setRows(response.data.totalRows);
      } catch (error) {
        console.error("Error fetching logs:", error);
      }
    };

    getLogs();
  }, [page, limit]);

  const changePage = ({ selected }) => {
    setPage(selected);
    if (selected === 9) {
      setMsg("Silakan gunakan kata kunci spesifik jika tidak menemukan log yang dicari.");
    } else {
      setMsg("");
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  const getActionBadgeColor = (action) => {
    switch (action) {
      case "LOGIN_BERHASIL":
        return "is-success";
      case "LOGOUT":
        return "is-warning";
      default:
        return "is-info";
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="title has-text-black">Log Activity</h1>
      <h2 className="subtitle has-text-black">Daftar Aktivitas Pengguna</h2>

      <table className="table is-striped is-fullwidth mt-2">
        <thead>
          <tr>
            <th>No</th>
            <th>Pengguna</th>
            <th>Aksi</th>
            <th>Email</th>
            <th>Waktu</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, index) => (
            <tr key={log._id}>
              <td>{page * limit + index + 1}</td>
              <td>{log.user}</td>
              <td>
                <span className={`tag ${getActionBadgeColor(log.action)}`}>
                  {log.action}
                </span>
              </td>
              <td>{log.metadata?.email || "-"}</td>
              <td>{formatDate(log.timestamp)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="has-text-black">
        Total Rows: {rows} Page: {rows ? page + 1 : 0} of {pages}
      </p>
      <p className="has-text-centered has-text-danger">{msg}</p>

      <nav
        className="pagination is-centered"
        key={rows}
        role="navigation"
        aria-label="pagination"
      >
        <ReactPaginate
          previousLabel={"< Prev"}
          nextLabel={"Next >"}
          pageCount={Math.min(20, pages)}
          onPageChange={changePage}
          containerClassName={"pagination-list"}
          pageLinkClassName={"pagination-link"}
          previousLinkClassName={"pagination-previous"}
          nextLinkClassName={"pagination-next"}
          activeLinkClassName={"pagination-link is-current"}
          disabledLinkClassName={"pagination-link is-disabled"}
        />
      </nav>
    </div>
  );
};

export default LogActivityList;
