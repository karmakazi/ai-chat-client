import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import styled from '@emotion/styled';
import Chat from './pages/Chat';
import Admin from './pages/Admin';

const Nav = styled.nav`
  padding: 1rem;
  background-color: #333;
  text-align: center;
  
  & > a {
    color: white;
    margin: 0 1rem;
    text-decoration: none;
    font-size: 1.2rem;

    &:hover {
      text-decoration: underline;
    }
  }
`;

function App() {
  return (
    <div>
      <Nav>
        <Link to="/">Chat</Link>
        <Link to="/admin">Admin</Link>
      </Nav>
      <Routes>
        <Route path="/" element={<Chat />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </div>
  );
}

export default App;
