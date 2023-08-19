import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { socket } from '../socket.js'
import { Grid, TextField, Button, Container } from '@mui/material';
import UsernameForm from '../components/UsernameForm.jsx';
import Chat from '../components/Chat.jsx';
import VideoCall from '../components/VideoCall.jsx';


const RoomPage = () => {
    const navigate = useNavigate();
    const { roomId } = useParams();

    const [username, setUsername] = useState('');
    const [isUsernameEntered, setIsUsernameEntered] = useState(false);

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    const [peerConnection, setPeerConnection] = useState(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const screenShareStreamRef = useRef(null);




    const handleLeaveRoom = async () => {
        await stopWebRTC()
        socket.emit('leaveRoom');
        navigate('/')
    };

    const setEnteredUsername = () => {
        setIsUsernameEntered(true);
    };

    // Function to stop the WebRTC connection and media streams
    const stopWebRTC = async () => {
        try {
            if (peerConnection) {
                peerConnection.close();
            }
            if (localVideoRef.current && localVideoRef.current.srcObject) {
                const tracks = localVideoRef.current.srcObject.getVideoTracks();
                tracks.forEach((track) => track.stop());
            }
            if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
                const tracks = remoteVideoRef.current.srcObject.getVideoTracks();
                tracks.forEach((track) => track.stop());
            }
        } catch (error) {
            console.error('Error stopping WebRTC:', error);
        }
    };

    // Validate room name exist
    useEffect(() => {
        if (!roomId) {
            navigate('/')
        }
    }, [navigate, roomId])

    // Listen for messages from the server
    useEffect(() => {
        const handleNewMessage = ({ user, text }) => {
            setMessages((prevMessages) => [...prevMessages, { user, text }]);
        };

        socket.on('message', handleNewMessage);

        return () => {
            // Clean up and remove the event listeners when the component unmounts
            socket.off('message', handleNewMessage);
        };
    }, [navigate]);

    // Join to room
    useEffect(() => {
        const joinRoom = () => {
            if (username) {
                socket.emit('joinRoom', roomId, username);
            } else {
                alert('username is required field')
            }
        };
        if (isUsernameEntered) {
            joinRoom()
        }
    }, [isUsernameEntered, roomId, username])

    return (
        <Container style={{ height: '100vh' }}>
            <Button variant="contained" color="secondary" onClick={handleLeaveRoom}>
                Leave
            </Button>
            {isUsernameEntered ? (
                <Grid container spacing={2} style={{ height: '90%' }}>
                    <VideoCall
                        roomId={roomId}
                        peerConnection={peerConnection}
                        localVideoRef={localVideoRef}
                        remoteVideoRef={remoteVideoRef}
                        screenShareStreamRef={screenShareStreamRef}
                        setPeerConnection={setPeerConnection}
                    />
                    <Chat socket={socket} messages={messages} message={message} setMessage={setMessage} />
                </Grid>
            ) : (
                <UsernameForm roomId={roomId} username={username} setUsername={setUsername} setEnteredUsername={setEnteredUsername} />
            )}
        </Container>
    );
}
export default RoomPage