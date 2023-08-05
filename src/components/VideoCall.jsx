import { Button, Grid } from "@mui/material"
import { socket } from '../socket.js'
import { useEffect, useRef, useState } from "react"

const VideoCall = ({ roomId }) => {
    const [peerConnection, setPeerConnection] = useState(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const screenStreamRef = useRef(null);

    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);

    // Function to toggle mute/unmute audio
    const toggleAudio = () => {
        const tracks = localVideoRef.current.srcObject.getAudioTracks();
        tracks.forEach((track) => (track.enabled = !track.enabled));
        setIsAudioMuted(!isAudioMuted);
    };

    // Function to toggle open/close camera
    const toggleCamera = () => {
        const tracks = localVideoRef.current.srcObject.getVideoTracks();
        tracks.forEach((track) => (track.enabled = !track.enabled));
        setIsVideoEnabled(!isVideoEnabled);
    };

    // Initialize WebRTC connection
    useEffect(() => {
        const initWebRTC = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                localVideoRef.current.srcObject = stream;

                const configuration = {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        {
                            urls: 'turn:openrelay.metered.ca:80',
                            username: 'openrelayproject',
                            credential: 'openrelayproject'
                        }]
                };
                const pc = new RTCPeerConnection(configuration);

                stream.getTracks().forEach((track) => pc.addTrack(track, stream));

                pc.onicecandidate = (event) => {
                    if (event.candidate) {
                        socket.emit('ice-candidate', {
                            candidate: event.candidate,
                            room: roomId,
                        });
                    }
                };

                pc.ontrack = (event) => {
                    if (event.streams && event.streams[0]) {
                        remoteVideoRef.current.srcObject = event.streams[0];
                    }
                };

                setPeerConnection(pc);

                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);

                socket.emit('offer', {
                    sdp: pc.localDescription,
                    room: roomId,
                });
            } catch (error) {
                console.error('Error accessing media devices:', error);
                alert('Error accessing media devices.');
            }
        }
        initWebRTC()

    }, [roomId])

    // Handle incoming offers and answers
    useEffect(() => {
        const handleOffer = async (data) => {
            try {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
                const answer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(answer);

                socket.emit('answer', {
                    sdp: peerConnection.localDescription,
                    room: roomId,
                });
            } catch (error) {
                console.error('Error handling offer:', error);
            }
        };

        const handleAnswer = async (data) => {
            try {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
            } catch (error) {
                console.error('Error handling answer:', error);
            }
        };

        socket.on('offer', handleOffer);
        socket.on('answer', handleAnswer);

        return () => {
            socket.off('offer', handleOffer);
            socket.off('answer', handleAnswer);
        };
    }, [peerConnection, roomId]);

    // Handle ICE candidates
    useEffect(() => {
        const handleIceCandidate = async (data) => {
            try {
                await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
            } catch (error) {
                console.error('Error handling ICE candidate:', error);
            }
        };
        socket.on('ice-candidate', handleIceCandidate);
        return () => {
            socket.off('ice-candidate', handleIceCandidate);
        };
    }, [peerConnection]);

    return (
        <Grid item xs={12} md={8} style={{ height: '100%' }}>
            <div style={{ height: '100%', backgroundColor: '#f0f0f0' }}>
                <video ref={localVideoRef} style={{ width: '50%', height: '100%', backgroundColor: 'black' }} autoPlay></video>
                <video ref={remoteVideoRef} style={{ width: '50%', height: '100%', backgroundColor: 'black' }} autoPlay></video>
                <Button variant="contained" onClick={toggleAudio}>
                    {isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
                </Button>
                <Button variant="contained" onClick={toggleCamera}>
                    {isVideoEnabled ? 'Close Camera' : 'Open Camera'}
                </Button>
            </div>
        </Grid>
    )
}

export default VideoCall