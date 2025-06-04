
import { useState } from "react";
import theme from "../assets/palette";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Livros from "../assets/livros.jpg";
import { useAuthStore } from "../store/useAuthStore";
function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const setUser = useAuthStore((state) => state.setUser);

  const handleLogin = async () => {
    try {
      const response = await api.post("/login", { username, password });
      setUser(response.data);
      alert("Login successful!");
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please try again.");
    }
  };

  return (
    <div
      style={{
        backgroundColor: theme.palette.custom.butterscotch,
        borderRadius: "16px",
        boxShadow: "4px 4px 0px rgb(84, 54, 24, 0.5)",
        padding: "24px",
        maxWidth: "300px",
        margin: "auto",
        marginTop: "50px",
      }}
    >
      <p style={{ fontSize: "1.5rem", marginBottom: "16px" }}>Login</p>
      <div
        style={{
          flex: 1,
          backgroundImage: `url(${Livros})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      ></div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <TextField label="Username" variant="standard" />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          variant="standard"
        />
        <Button variant="contained" color="primary">
          Login
        </Button>
      </div>
    </div>
  );
}

export default Login;


// import {useStore} from "../store/userLogin";

// export default function Login() {
//   const { connectWallet, currentAccount, isConnected, disconnectWallet} = useStore();

//   return (
//     <div>
//       {isConnected ? (
//         <p>Conta conectada: {currentAccount}</p>
//       ) : (
//         <button onClick={connectWallet}>Conectar Carteira</button>
//       )}
//       <br></br>
//       {
//         <button onClick={disconnectWallet}>Disconnect Carteira</button>
//       }
//     </div>
//   );
// }