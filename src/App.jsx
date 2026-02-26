import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/home';
import Sponsorship from './pages/Sponsorship';
import Transparency from './pages/Transparency';
import MyAccount from './pages/MyAccount';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/apadrinamiento" element={<Sponsorship />} />
          <Route path="/transparencia" element={<Transparency />} />
          <Route path="/mi-cuenta" element={<MyAccount />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
export default App;