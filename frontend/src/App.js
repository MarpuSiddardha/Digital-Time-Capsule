import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './pages/Dashboard';
import CreateCapsule from './pages/CreateCapsule';
import Login from './pages/Login';
import Register from './pages/Register';
import CapsuleDetails from './pages/CapsuleDetails';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && <Navbar />}
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/create" element={<PrivateRoute><CreateCapsule /></PrivateRoute>} />
          <Route path="/capsules/:id" element={<PrivateRoute><CapsuleDetails /></PrivateRoute>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;