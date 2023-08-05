import { Button, TextField } from "@mui/material"

const UsernameForm = ({ roomId, username, setUsername, setEnteredUsername }) => {
    return (
        <div style={{ textAlign: 'center', paddingTop: '100px' }}>
            <h1>Room : {roomId}</h1>
            <h3>Enter Username</h3>
            <TextField
                fullWidth
                variant="outlined"
                label="Enter Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                        setEnteredUsername();
                    }
                }}
            />
            <Button variant="contained" color="primary" onClick={setEnteredUsername}>
                Enter Username
            </Button>
        </div>
    )
}

export default UsernameForm