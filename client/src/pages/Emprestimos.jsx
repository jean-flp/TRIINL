import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  CircularProgress,
  Box,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { loanStore } from "../store/loanStore";
import { userStore } from "../store/userLogin";

function Emprestimos() {
  const [loading, setLoading] = useState(true);
  const { loans, fetchLoans, acceptLoan, returnLoan } = loanStore();
  const [actionLoading, setActionLoading] = useState({});
  const [userLoans, setUserLoans] = useState([]);
  const contract = userStore((state) => state.contract);
  const currentAccount = userStore((state) => state.currentAccount);
  const role = userStore((state) => state.role);
  const signer = userStore((state) => state.signer);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchLoans(contract);
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (loans) {
      if (role === "user") {
        const filtered = loans.filter((loan) => {
          return loan.user.toUpperCase() === currentAccount.toUpperCase();
        });
        setUserLoans(filtered);
        console.log("Filtered Loans: ", userLoans);
      } else {
        setUserLoans(loans);
      }
    }
  }, [loans]);

  const handleAcceptLoan = async (loanId) => {
    if (loanId !== null || loanId !== undefined) {
      try {
        await acceptLoan(contract, loanId, signer);
      } catch (e) {
        console.log("Houve um erro ao aprovar um empréstimo: ", e);
      }
    }
  };

  const handleReturnLoan = async (loanId) => {
    console.log("Esse é o loanId", loanId);
    if (loanId !== undefined && loanId !== null) {
      console.log("Esse é o loan id", loanId);
      try {
        await returnLoan(contract, signer, loanId);
      } catch (e) {
        console.log("Houve um erro ao retornar um empréstimo: ", e);
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box maxWidth="600px" margin="auto" mt={4}>
      <Typography variant="h4" gutterBottom>
        My Loans
      </Typography>

      {userLoans.length === 0 ? (
        <Typography>Não foram encontrados empréstimos</Typography>
      ) : (
        userLoans.map((loan) => (
          <Accordion key={loan.id}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ width: "10%", flexShrink: 0 }}>{}</Typography>
              <Typography
                sx={{
                  color:
                    loan.status === 0
                      ? "red"
                      : loan.status === 2
                        ? "green"
                        : "text.secondary",
                }}
              >
                {loan.status === 0 ? (
                  <Typography>
                    <strong>Em Análise</strong>
                  </Typography>
                ) : (
                  <Typography>
                    <strong>Devolvido</strong>
                  </Typography>
                )}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                <strong>Título:</strong> {loan.book.title}
              </Typography>
              <Typography>
                <strong>Autor:</strong> {loan.book.author}
              </Typography>
              <Typography>
                <strong>ISBN: </strong> {loan.book.isbn}
              </Typography>
              {role === "library" &&
                loan.status !== 2 && ( // Show buttons if not already returned
                  <Box mt={2} display="flex" gap={1}>
                    {loan.status === 0 && ( // Only show Accept if status is "Em Análise"
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleAcceptLoan(loan.id)}
                        disabled={actionLoading[loan.id]}
                      >
                        {actionLoading[loan.id] ? (
                          <CircularProgress size={24} />
                        ) : (
                          "Aceitar"
                        )}
                      </Button>
                    )}
                    {loan.status === 1 && (
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleReturnLoan(loan.id)}
                        disabled={actionLoading[loan.id]}
                      >
                        {actionLoading[loan.id] ? (
                          <CircularProgress size={24} />
                        ) : (
                          "Retornar"
                        )}
                      </Button>
                    )}
                  </Box>
                )}
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Box>
  );
}

export default Emprestimos;
