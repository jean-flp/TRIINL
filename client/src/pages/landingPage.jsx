import { Box, Typography, Container } from "@mui/material";
import img from "../assets/biblioteca.jpg"
import Paper from '@mui/material/Paper';
import { red } from "@mui/material/colors";


function landingPage() {
    return (
        <Box sx={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundImage: `linear-gradient(to top,rgba(0,0,0,0.3), rgba(0,0,0,0.01)), url(${img})`,
        }}>
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                }}
            />
            <Box
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    color: 'white',
                }}
            >
                <Box
                    sx={{
                        py: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                    }}
                >


                        <Paper elevation={24} sx={{
                            
                            borderRadius: "16px",
                            boxShadow: "0px 3px 0px rgb(84, 54, 24, 0.5)",
                            padding: "24px",
                            maxWidth: "300px",
                            margin: "auto",
                            marginTop: "50px",
                        }}>
                            <Typography>LANDINGPAGE</Typography>
                        </Paper>
                </Box>
            </Box>
        </Box>
    );
}

export default landingPage;