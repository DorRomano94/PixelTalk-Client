import { useEffect, useState } from 'react'
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


    const handleLeaveRoom = () => {
        socket.emit('leaveRoom');
        navigate('/')
    };

    const setEnteredUsername = () => {
        setIsUsernameEntered(true);
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
        <Container style={{ height: '100vh', overflow: 'hidden' }}>
            {isUsernameEntered ? (
                <Grid container spacing={2} style={{ height: '90%' }}>
                    <VideoCall socket={socket} roomId={roomId} />
                    <Chat socket={socket} handleLeaveRoom={handleLeaveRoom} messages={messages} message={message} setMessage={setMessage} />
                </Grid>
            ) : (
                <UsernameForm username={username} setUsername={setUsername} setEnteredUsername={setEnteredUsername} />
            )}
        </Container>
    );
}
export default RoomPage