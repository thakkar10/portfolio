import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

function Home() {
  return (
    <div className="home">
      <div className="home-content">
        <h1 className="home-name">HEET THAKKAR.</h1>
        <Link to="/gallery" className="enter-link">
          ENTER
        </Link>
      </div>
    </div>
  );
}

export default Home;

