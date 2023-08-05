import { socket } from '../socket.js'
import { Button, Grid, TextField } from "@mui/material"

const Chat = ({ handleLeaveRoom, messages, message, setMessage }) => {

    const sendMessage = () => {
        socket.emit('sendMessage', message);
        console.log({ message });
        setMessage('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    return (
        <Grid item xs={12} md={4} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}> {/* Chat messages part */}
            <div className="room-container" style={{ flex: 1, overflowY: 'auto' }}>
                <div className="room-header">
                    <h1>Chat</h1>
                    <Button variant="contained" color="secondary" onClick={handleLeaveRoom}>
                        Leave
                    </Button>
                </div>
                <ul className="message-list">
                    {messages.map((message, index) => (
                        <li key={index} className="message-item">
                            <div className="user">{message.user}</div>
                            <div className="text">{message.text}</div>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="message-input" style={{ display: 'flex', alignItems: 'center' }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message"
                    style={{ flex: 1 }}
                />
                <Button variant="contained" color="primary" onClick={sendMessage} style={{ marginLeft: '10px' }}>
                    Send
                </Button>
            </div>
        </Grid>)
}

export default Chat