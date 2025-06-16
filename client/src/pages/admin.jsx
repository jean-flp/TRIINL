import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  CircularProgress,
  Stack,
  TextField,
  Box,
  Button,
  MenuItem,
  Alert,
  Snackbar,
  styled,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { userStore } from "../store/userLogin";

const schemaRegistro = yup.object().shape({
  walletLib: yup.string().required("Endereço Instituição Obrigatório é obrigatório"),
  nameLib: yup.string().required("Nome de Instituição é obrigatório"),
  siglaLib: yup.string().required("Sigla é obrigatório"),
});
const schemaRole = yup.object().shape({
  accountRole: yup.string().required("Perfil é obrigatório"),
  walletUser: yup.string().required("Endereço do usuário é obrigatório"),
});

const roles = [
  {
    value: 'library',
    label: 'Biblioteca',
  },
  {
    value: 'user',
    label: 'Usuário',
  },
];

const PauseSwitch = styled((props) => <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />)(
  ({ theme }) => ({
    width: 62,
    height: 34,
    padding: 7,
    '& .MuiSwitch-switchBase': {
      margin: 1,
      padding: 0,
      transform: 'translateX(6px)',
      '&.Mui-checked': {
        color: '#fff',
        transform: 'translateX(22px)',
        '& + .MuiSwitch-track': {
          backgroundColor: '#aab4be',
        },
      },
    },
    '& .MuiSwitch-thumb': {
      backgroundColor: '#001e3c',
      width: 32,
      height: 32,
      position: 'relative',
    },
    '& .MuiSwitch-thumb::before': {
      content: '""',
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundSize: '60%',
      backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'><path d='M6 19h4V5H6v14zm8-14v14h4V5h-4z'/><path d='M0 0h24v24H0z' fill='none'/></svg>")`,
      
    },
    '& .Mui-checked .MuiSwitch-thumb::before': {
      backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'><path d='M10 16.5l6-4.5-6-4.5v9z'/><path d='M0 0h24v24H0z' fill='none'/></svg>")`,
    },
    '& .MuiSwitch-track': {
      borderRadius: 20 / 2,
      backgroundColor: '#aab4be',
      opacity: 1,
    },
  })
);

function Admin() {
  const [isPaused, setIsPaused] = useState(true);
  const [preview, setPreview] = useState(null);
  const [showSuccessAlertRegistro, setShowSuccessAlertRegistro] = useState(false);
  const [showSuccessAlertRole, setShowSuccessAlertRole] = useState(false);
  const [open, setOpen] = useState(false);

  const {contract,signer,role,currentAccount,setOtherRole,registerLibrary } = userStore() ;

  const {
    register: registerRegistro,
    handleSubmit: handleSubmitRegistro,
    formState: { errors: errorsRegistro },
  } = useForm({
    resolver: yupResolver(schemaRegistro),
  });

  const {
    register: registerRole,
    handleSubmit: handleSubmitRole,
    formState: { errors: errorsRole },
  } = useForm({
    resolver: yupResolver(schemaRole),
  });

  const onSubmitRegistro = async (data) => {
    console.log("📘 Dados do registro da biblioteca:", data);
    await registerLibrary(contract,data.walletLib,data.nameLib,data.siglaLib);

    setOpen(true);
    setShowSuccessAlertRegistro(true);

    // Opcional: ocultar o alerta após alguns segundos
    setTimeout(() => setShowSuccessAlertRegistro(false), 4000);
  };

  const onSubmitRole = async (data) => {
    console.log("👤 Dados da atribuição de perfil:", data);
    await setOtherRole(contract, data.accountRole,data.walletUser);

    setOpen(true);
    setShowSuccessAlertRole(true);

    // Opcional: ocultar o alerta após alguns segundos
    setTimeout(() => setShowSuccessAlertRole(false), 4000);
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  const handlePauseToggle = (event) => {
    const checked = event.target.checked;
    setIsPaused(checked);

    if (checked) {
      // Switch está ON
      console.log("Contrato foi DESPAUSADO");
      // Sua função para despausar aqui
    } else {
      // Switch está OFF
      console.log("Contrato foi PAUSADO");
      // Sua função para pausar aqui
    }
  };

  return (

    <Box maxWidth="600px" margin="auto" mt={4}>


      <Box>
        <Typography variant="h4" gutterBottom>Cadastro de Bibliotecas</Typography>
        <Accordion>
          <AccordionSummary aria-controls="panel1-content" id="panel1-header">
            <Typography component="span">Cadastro de Biblioteca no TRIINL</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {showSuccessAlertRegistro && (
              <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert severity="success">Biblioteca cadastrada com sucesso!</Alert>
              </Snackbar>
            )}
            <form onSubmit={handleSubmitRegistro(onSubmitRegistro)}>
              <Stack spacing={2}>
                <TextField
                  {...registerRegistro("walletLib")}
                  label="Endereço Biblioteca"
                  error={!!errorsRegistro.walletLib}
                  helperText={errorsRegistro.walletLib?.message}
                  fullWidth
                />
                <TextField
                  {...registerRegistro("nameLib")}
                  label="Nome Instituição"
                  error={!!errorsRegistro.nameLib}
                  helperText={errorsRegistro.nameLib?.message}
                  fullWidth
                />
                <TextField
                  {...registerRegistro("siglaLib")}
                  label="Sigla Instituição"
                  error={!!errorsRegistro.siglaLib}
                  helperText={errorsRegistro.siglaLib?.message}
                  fullWidth
                />
                <Button type="submit" variant="contained">
                  Cadastrar Biblioteca
                </Button>
              </Stack>
            </form>
          </AccordionDetails>
        </Accordion>
      </Box>
      <br></br>
      <Box>
        <Typography variant="h4" gutterBottom>Opções Contrato</Typography>
        <Accordion>
          <AccordionSummary aria-controls="panel1-content" id="panel1-header">
            <Typography component="span">Pausar Contrato</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box display={"flex"} spacing={1} sx={{alignItems:"center"}}  gap={2}>
            <Typography sx={{marginLeft:"8px"}}>SIM</Typography>
            <br/>
            <FormControlLabel control={<PauseSwitch sx={{ml:1}} checked={isPaused} onChange={handlePauseToggle} />}/>
            <Typography>NÃO</Typography>
            </Box>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary aria-controls="panel1-content" id="panel1-header">
            <Typography component="span">Alteração de Perfil de Usuárrio</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {showSuccessAlertRole && (
              <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert severity="success">Atribuição de perfil feita com sucesso!</Alert>
              </Snackbar>
            )}
            <form onSubmit={handleSubmitRole(onSubmitRole)}>
              <Stack spacing={2}>
                <TextField
                  select
                  {...registerRole("accountRole")}
                  label="Perfil Conta"
                  defaultValue=""
                  error={!!errorsRole.accountRole}
                  helperText={errorsRole.accountRole?.message}
                  fullWidth
                >
                  {roles.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  {...registerRole("walletUser")}
                  label="Endereço Carteira Usuário"
                  error={!!errorsRole.walletUser}
                  helperText={errorsRole.walletUser?.message}
                  fullWidth
                />
                <Button type="submit" variant="contained">
                  Atribuir Perfil
                </Button>
              </Stack>
            </form>
          </AccordionDetails>
        </Accordion>
      </Box>


    </Box>
  );
}

export default Admin;
