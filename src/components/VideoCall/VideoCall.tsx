import React, { useState, useRef, useEffect } from 'react';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Users, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface VideoCallProps {
  roomId: string;
  userName: string;
  onEndCall: () => void;
}

const VideoCall: React.FC<VideoCallProps> = ({ roomId, userName, onEndCall }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [participants, setParticipants] = useState<string[]>([userName]);
  const [copied, setCopied] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Initialize camera and microphone
    const initializeMedia = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        
        setStream(mediaStream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = mediaStream;
        }
        
        toast.success('Camera and microphone connected');
      } catch (err) {
        console.error('Error accessing media devices:', err);
        toast.error('Failed to access camera/microphone. Please check permissions.');
      }
    };

    initializeMedia();

    // Cleanup function
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
        toast.success(videoTrack.enabled ? 'Camera turned on' : 'Camera turned off');
      }
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
        toast.success(audioTrack.enabled ? 'Microphone turned on' : 'Microphone turned off');
      }
    }
  };

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      toast.success('Room ID copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy room ID');
    }
  };

  const endCall = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    toast.success('Call ended');
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
              {participants.length} participant{participants.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-white text-sm">
              Room: {roomId}
            </div>
            <button
              onClick={copyRoomId}
              className="flex items-center space-x-1 px-3 py-1 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg text-sm transition-colors"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? 'Copied' : 'Copy ID'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="pt-16 pb-20 h-full flex items-center justify-center p-4">
        {/* Local Video */}
        <div className="relative bg-neutral-800 rounded-lg overflow-hidden max-w-4xl w-full h-full max-h-96">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-lg text-sm">
            {userName} (You)
          </div>
          {!isVideoEnabled && (
            <div className="absolute inset-0 bg-neutral-700 flex items-center justify-center">
              <div className="text-center">
                <VideoOff className="h-16 w-16 text-neutral-400 mx-auto mb-2" />
                <p className="text-neutral-400">Camera is off</p>
              </div>
            </div>
          )}
          
          {/* Waiting for participants overlay */}
          <div className="absolute top-4 left-4 right-4 bg-black bg-opacity-50 text-white p-3 rounded-lg">
            <p className="text-center">
              Waiting for other participants to join...
            </p>
            <p className="text-center text-sm text-neutral-300 mt-1">
              Share the Room ID: <span className="font-mono font-bold">{roomId}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-neutral-800 p-4">
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full transition-colors ${
              isAudioEnabled
                ? 'bg-neutral-600 hover:bg-neutral-500 text-white'
                : 'bg-error-600 hover:bg-error-700 text-white'
            }`}
            title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
          >
            {isAudioEnabled ? (
              <Mic className="h-6 w-6" />
            ) : (
              <MicOff className="h-6 w-6" />
            )}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-colors ${
              isVideoEnabled
                ? 'bg-neutral-600 hover:bg-neutral-500 text-white'
                : 'bg-error-600 hover:bg-error-700 text-white'
            }`}
            title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {isVideoEnabled ? (
              <Video className="h-6 w-6" />
            ) : (
              <VideoOff className="h-6 w-6" />
            )}
          </button>

          <button
            onClick={endCall}
            className="p-4 bg-error-600 hover:bg-error-700 text-white rounded-full transition-colors"
            title="End call"
          >
            <PhoneOff className="h-6 w-6" />
          </button>
        </div>
        
        <div className="text-center mt-3">
          <p className="text-neutral-400 text-sm">
            Share Room ID <span className="font-mono font-bold text-white">{roomId}</span> with others to join
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
