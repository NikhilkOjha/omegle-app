import React from 'react';

const VideoBox = () => {
  return (
    <div style={{ flex: 3, background: '#000', color: '#fff', padding: 10 }}>
      <h2>Video Area</h2>
      <video autoPlay playsInline muted style={{ width: '100%', height: '80%' }}></video>
    </div>
  );
};

export default VideoBox;
