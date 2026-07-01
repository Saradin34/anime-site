import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Catalog } from './pages/Catalog';
import { AnimeDetails } from './pages/AnimeDetails';
import { Login } from './pages/Login';
import { Favorites } from './pages/Favorites';
import { About } from './pages/About';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><AuthProvider><BrowserRouter><Routes><Route element={<Layout/>}><Route path="/" element={<Home/>}/><Route path="/catalog" element={<Catalog/>}/><Route path="/anime/:source/:id" element={<AnimeDetails/>}/><Route path="/login" element={<Login/>}/><Route path="/favorites" element={<Favorites/>}/><Route path="/about" element={<About/>}/></Route></Routes></BrowserRouter></AuthProvider></React.StrictMode>
);
