import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// import { getHome } from './api';

const Home = () => {
  const [data, setData] = useState('');
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem('is_admin') === 'true';

  useEffect(() => {
    getHome().then(res => setData(res.data.message)).catch(() => navigate('/login'));
  }, [navigate]);

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div>
      <h1>{data}</h1>
      <Link to={isAdmin ? '/admin-dashboard' : '/user-dashboard'}>Go to Dashboard</Link>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Home;