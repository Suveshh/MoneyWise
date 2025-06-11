import React, { useState, useRef, useEffect } from 'react';
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Users } from 'lucide-react';
import Peer from 'simple-peer';
import { io, Socket } from 'socket.io-client';

interface VideoCallProps {
  roomId: string;
  userName: string;
  onEndCall: () => void;
}

const VideoCall: React.FC<VideoCallProps> = ({ roomId, userName, onEndCall }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [peers, setPeers] = useState<{ [key: string]: Peer.Instance }>({});
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [participants, setParticipants] = useState<string[]>([]);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const peersRef = useRef<{ [key: string]: Peer.Instance }>({});

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001');
    
    // Get user media
    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    }).then(stream => {
      setStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      // Join room
      socketRef.current?.emit('join-room', { roomId, userName });
    }).catch(err => {
      console.error('Error accessing media devices:', err);
    });

    // Socket event listeners
    socketRef.current.on('user-joined', ({ userId, userName: newUserName }) => {
      setParticipants(prev => [...prev, newUserName]);
      
      if (stream) {
        const peer = new Peer({
          initiator: true,
          trickle: false,
          stream: stream
        });

        peer.on('signal', signal => {
          socketRef.current?.emit('signal', { userId, signal });
        });

        peer.on('stream', remoteStream => {
          // Handle remote stream
          const video = document.getElementById(`video-${userId}`) as HTMLVideoElement;
          if (video) {
            video.srcObject = remoteStream;
          }
        });

        peersRef.current[userId] = peer;
        setPeers(prev => ({ ...prev, [userId]: peer }));
      }
    });

    socketRef.current.on('user-left', ({ userId, userName: leftUserName }) => {
      setParticipants(prev => prev.filter(name => name !== leftUserName));
      
      if (peersRef.current[userId]) {
        peersRef.current[userId].destroy();
        delete peersRef.current[userId];
        setPeers(prev => {
          const newPeers = { ...prev };
          delete newPeers[userId];
          return newPeers;
        });
      }
    });

    socketRef.current.on('signal', ({ userId, signal }) => {
      if (peersRef.current[userId]) {
        peersRef.current[userId].signal(signal);
      } else if (stream) {
        const peer = new Peer({
          initiator: false,
          trickle: false,
          stream: stream
        });

        peer.on('signal', signal => {
          socketRef.current?.emit('signal', { userId, signal });
        });

        peer.on('stream', remoteStream => {
          const video = document.getElementById(`video-${userId}`) as HTMLVideoElement;
          if (video) {
            video.srcObject = remoteStream;
          }
        });

        peer.signal(signal);
        peersRef.current[userId] = peer;
        setPeers(prev => ({ ...prev, [userId]: peer }));
      }
    });

    return () => {
      // Cleanup
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      Object.values(peersRef.current).forEach(peer => peer.destroy());
      socketRef.current?.disconnect();
    };
  }, [roomId, userName]);

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const endCall = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    Object.values(peersRef.current).forEach(peer => peer.destroy());
    socketRef.current?.emit('leave-room', { roomId });
    socketRef.current?.disconnect();
    
    onEndCall();
  };

  return (
    <div className="fixed inset-0 bg-neutral-900 z-50">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-neutral-800 p-4 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="h-5 w-5 text-white" />
            <span className="text-white font-medium">
              {participants.length + 1} participant{participants.length !== 0 ? 's' : ''}
            </span>
          </div>
          <div className="text-white text-sm">
            Room: {roomId}
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="pt-16 pb-20 h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {/* Local Video */}
        <div className="relative bg-neutral-800 rounded-lg overflow-hidden">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
            You
          </div>
          {!isVideoEnabled && (
            <div className="absolute inset-0 bg-neutral-700 flex items-center justify-center">
              <VideoOff className="h-12 w-12 text-neutral-400" />
            </div>
          )}
        </div>

        {/* Remote Videos */}
        {Object.keys(peers).map((userId, index) => (
          <div key={userId} className="relative bg-neutral-800 rounded-lg overflow-hidden">
            <video
              id={`video-${userId}`}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
              {participants[index] || `User ${index + 1}`}
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-neutral-800 p-4">
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={toggleAudio}
            className={`p-3 rounded-full transition-colors ${
              isAudioEnabled
                ? 'bg-neutral-600 hover:bg-neutral-500 text-white'
                : 'bg-error-600 hover:bg-error-700 text-white'
            }`}
          >
            {isAudioEnabled ? (
              <Mic className="h-5 w-5" />
            ) : (
              <MicOff className="h-5 w-5" />
            )}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full transition-colors ${
              isVideoEnabled
                ? 'bg-neutral-600 hover:bg-neutral-500 text-white'
                : 'bg-error-600 hover:bg-error-700 text-white'
            }`}
          >
            {isVideoEnabled ? (
              <Video className="h-5 w-5" />
            ) : (
              <VideoOff className="h-5 w-5" />
            )}
          </button>

          <button
            onClick={endCall}
            className="p-3 bg-error-600 hover:bg-error-700 text-white rounded-full transition-colors"
          >
            <PhoneOff className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;