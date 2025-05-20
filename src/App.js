import {BrowserRouter, Routes, Route} from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./components/Login";
import Users from "./pages/Users";
import ProductLists from "./pages/ProductLists";
import ProductDisplays from "./pages/ProductDisplays";
import PaymentLists from "./pages/PaymentLists";
import AddUser from "./pages/AddUser";
import EditUser from "./pages/EditUser";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import LogActivityLists from "./pages/LogActivityLists";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />}/>
          <Route path="/dashboard" element={<Dashboard />}/>
          <Route path="/users" element={<Users />}/>
          <Route path="/users/add" element={<AddUser />}/>
          <Route path="/users/edit/:id" element={<EditUser />}/>
          <Route path="/productlists" element={<ProductLists />}/>
          <Route path="/productdisplays" element={<ProductDisplays />}/>
          <Route path="/products/add" element={<AddProduct />}/>
          <Route path="/products/edit/:id" element={<EditProduct />}/>
          <Route path="/paymentlists" element={<PaymentLists />}/>
          <Route path="/logactivitys" element={<LogActivityLists />}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
