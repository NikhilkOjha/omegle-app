// client/src/components/VideoChat.js
import React, { useEffect, useRef } from 'react';
import socket from '../socket';

const VideoChat = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        localVideoRef.current.srcObject = stream;

        peerConnection.current = new RTCPeerConnection();

        stream.getTracks().forEach((track) => {
          peerConnection.current.addTrack(track, stream);
        });

        peerConnection.current.ontrack = (event) => {
          remoteVideoRef.current.srcObject = event.streams[0];
        };

        peerConnection.current.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit('ice-candidate', event.candidate);
          }
        };

        socket.on('offer', async (offer) => {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await peerConnection.current.createAnswer();
          await peerConnection.current.setLocalDescription(answer);
          socket.emit('answer', answer);
        });

        socket.on('answer', async (answer) => {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
        });

        socket.on('ice-candidate', async (candidate) => {
          try {
            await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (err) {
            console.error('Error adding ICE candidate:', err);
          }
        });

        socket.emit('join-video');

        socket.on('ready', async () => {
          const offer = await peerConnection.current.createOffer();
          await peerConnection.current.setLocalDescription(offer);
          socket.emit('offer', offer);
        });
      } catch (err) {
        console.error('Error accessing media devices.', err);
      }
    };

    init();

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h2>🎥 Video Chat</h2>
      <video ref={localVideoRef} autoPlay muted style={{ width: '45%' }} />
      <video ref={remoteVideoRef} autoPlay style={{ width: '45%' }} />
    </div>
  );
};

export default VideoChat;
