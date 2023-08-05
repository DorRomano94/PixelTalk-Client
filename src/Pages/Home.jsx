import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Grid, TextField, Button } from '@mui/material';

function HomePage() {
    const navigate = useNavigate();
    const [roomName, setRoomName] = useState('')


    const joinRoom = () => {
        if (roomName && roomName !== '') {
            navigate(`/room/${roomName}`);
        }
    };

    return (

        <Container maxWidth="md" sx={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Grid container spacing={2} alignItems="center" justifyContent="center">
                <Grid item xs={12}>
                    <h1 style={{ textAlign: 'center' }}>Welcome to the Chat Room</h1>
                </Grid>
                <Grid item md={4} xs={12}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        label="Enter Room Name"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                joinRoom();
                            }
                        }}
                    />
                </Grid>
                <Grid item md={4} xs={12}>
                    <Button variant="contained" color="primary" fullWidth onClick={joinRoom}>
                        Join Room
                    </Button>
                </Grid>
            </Grid>
            {/* <div>
                <h1>Chat Room</h1>
                <input type="text" value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="Room Name" />
                <button onClick={joinRoom}>Create/Join Room</button>
            </div> */}
        </Container>
    );
}

export default HomePage