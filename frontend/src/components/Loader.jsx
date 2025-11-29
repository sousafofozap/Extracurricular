import React from 'react';

const Loader = () => {
  return (
    <div className="loader-container">
      <div className="spinner"></div>
      <p style={{ marginTop: '15px', color: '#900008', fontWeight: 'bold' }}>Carregando...</p>
    </div>
  );
};

export default Loader;