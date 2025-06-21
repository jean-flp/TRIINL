
import { useState } from "react";
import theme from "../assets/palette";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Livros from "../assets/livros.jpg";
import { deactivateLibrary } from "../api/contractFunctions";
import { userStore } from "../store/userLogin";
function Login() {
  const {contract,signer } = userStore() ;



  const handleLogin = async () => {
      deactivateLibrary(contract, "0x84E24c091c859b5855B90f1E8c74503F20FBf296" )
  };

  return (
        <Button variant="contained" color="primary" onClick={handleLogin}>
          Login
        </Button>
  );
}

export default Login;
