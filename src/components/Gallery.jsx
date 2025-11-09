import React from 'react';
import { Link } from 'react-router-dom';
import { projects } from '../data/projects';
import '../styles/Gallery.css';

function Gallery() {
  return (
    <div className="gallery">
      <nav className="gallery-nav">
        <Link to="/" className="nav-link">HOME</Link>
      </nav>
      <div className="gallery-grid">
        {projects.map((project, index) => (
          <div key={index} className="project-item">
            {project.image && (
              <img 
                src={project.image} 
                alt={project.title}
                className="project-image"
              />
            )}
            <div className="project-info">
              <h2 className="project-title">{project.title}</h2>
              {project.description && (
                <p className="project-description">{project.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Gallery;

