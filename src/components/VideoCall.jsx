import { Button, Grid } from "@mui/material"
import { socket } from '../socket.js'
import { useEffect, useRef, useState } from "react"
const username = import.meta.env.VITE_ICE_SERVER_USERNAME
const credential = import.meta.env.VITE_ICE_SERVER_CREDENTIAL

const VideoCall = ({ roomId, peerConnection, localVideoRef, remoteVideoRef, screenShareStreamRef, setPeerConnection }) => {
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);

    const toggleScreenSharing = async () => {
        try {
            if (!isScreenSharing) {
                // Start screen sharing
                // const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
                // Get the user's screen
                const screenStream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        mandatory: {
                            chromeMediaSource: 'screen',
                            audio: false
                        }
                    }
                });
                screenShareStreamRef.current = screenStream;

                // Replace the camera track with the screen sharing track
                peerConnection.getSenders().forEach(sender => {
                    if (sender.track.kind === 'video') {
                        sender.replaceTrack(screenStream.getVideoTracks()[0]);
                    }
                });

                setIsScreenSharing(true);
            } else {
                // Stop screen sharing
                screenShareStreamRef.current.getTracks().forEach(track => track.stop());

                // Replace the screen sharing track with the original camera track
                const userCameraStream = localVideoRef.current.srcObject;
                peerConnection.getSenders().forEach(sender => {
                    if (sender.track.kind === 'video') {
                        sender.replaceTrack(userCameraStream.getVideoTracks()[0]);
                    }
                });

                setIsScreenSharing(false);
            }
        } catch (error) {
            console.error('Error toggling screen sharing:', error);
        }
    };

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
                        // { urls: 'stun:stun.l.google.com:19302' },
                        {
                            urls: "stun:stun.relay.metered.ca:80",
                        },
                        {
                            urls: "turn:a.relay.metered.ca:80",
                            username: username,
                            credential: credential,
                        },
                        {
                            urls: "turn:a.relay.metered.ca:80?transport=tcp",
                            username: username,
                            credential: credential,
                        },
                        {
                            urls: "turn:a.relay.metered.ca:443",
                            username: username,
                            credential: credential,
                        },
                        {
                            urls: "turn:a.relay.metered.ca:443?transport=tcp",
                            username: username,
                            credential: credential,
                        },
                    ]
                }
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

    }, [localVideoRef, remoteVideoRef, roomId, setPeerConnection])

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
                <video ref={localVideoRef} style={{ width: '50%', height: '100%', backgroundColor: 'black' }} autoPlay muted></video>
                <video ref={remoteVideoRef} style={{ width: '50%', height: '100%', backgroundColor: 'black' }} autoPlay></video>
                <Button variant="contained" onClick={toggleAudio}>
                    {isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
                </Button>
                <Button variant="contained" onClick={toggleCamera}>
                    {isVideoEnabled ? 'Close Camera' : 'Open Camera'}
                </Button>
                <Button variant="contained" onClick={toggleScreenSharing}>
                    {isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
                </Button>
            </div>
        </Grid>
    )
}

export default VideoCall