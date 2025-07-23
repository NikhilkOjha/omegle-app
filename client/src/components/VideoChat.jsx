// client/src/components/VideoChat.js
import React, { useEffect, useRef } from 'react';
import socket from '../socket';

const VideoChat = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);

  useEffect(() => {
    // Create PeerConnection
    peerConnection.current = new RTCPeerConnection();

    // Handle incoming remote stream
    peerConnection.current.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    // Handle ICE candidates
    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', event.candidate);
      }
    };

    // Listen to signaling events
    socket.on('offer', async (offer) => {
      if (!peerConnection.current) return;

      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      socket.emit('answer', answer);
    });

    socket.on('answer', async (answer) => {
      if (!peerConnection.current) return;
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on('ice-candidate', async (candidate) => {
      if (!peerConnection.current) return;
      try {
        await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error('Error adding ICE candidate', error);
      }
    });

    // Start local stream
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      localVideoRef.current.srcObject = stream;

      stream.getTracks().forEach((track) => {
        peerConnection.current.addTrack(track, stream);
      });

      // Let server know user is ready
      socket.emit('join-video');
    });

    // Server says both peers are ready to start
    socket.on('ready', async () => {
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      socket.emit('offer', offer);
    });

    // Cleanup
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h2>🎥 Video Chat</h2>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <video ref={localVideoRef} autoPlay muted style={{ width: '45%' }} />
        <video ref={remoteVideoRef} autoPlay style={{ width: '45%' }} />
      </div>
    </div>
  );
};

export default VideoChat;
