import React from 'react';
import VideoBox from '../components/VideoBox';
import ChatBox from '../components/ChatBox';
import SidebarAds from '../components/SidebarAds';

const Home = () => {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <VideoBox />
      <ChatBox />
      <SidebarAds />
    </div>
  );
};

export default Home;
