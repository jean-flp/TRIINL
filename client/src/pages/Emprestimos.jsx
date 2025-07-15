import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  CircularProgress,
  Box,
  Button,
  Container,
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { loanStore } from "../store/loanStore";
import { userStore } from "../store/userLogin";

const statusConfig = {
  0: { text: "Em Análise", color: "warning" },
  1: { text: "Aguardando Retirada", color: "info" },
  2: { text: "Finalizado", color: "success" },
  3: { text: "Em Posse do Usuário", color: "primary" },
  4: { text: "Rejeitado", color: "error" },
};

function Emprestimos() {
  const [loading, setLoading] = useState(true);
  const {
    loans,
    fetchLoans,
    acceptLoan,
    rejectLoan,
    returnLoan,
    loanWithUser,
  } = loanStore();

  const [actionLoading, setActionLoading] = useState({});
  const [userLoans, setUserLoans] = useState([]);

  const contract = userStore((state) => state.contract);
  const currentAccount = userStore((state) => state.currentAccount);
  const role = userStore((state) => state.role);
  const signer = userStore((state) => state.signer);

  // Initial data fetch
  useEffect(() => {
    if (contract) {
      const fetchData = async () => {
        setLoading(true);
        await fetchLoans(contract);
        setLoading(false);
      };
      fetchData();
    }
  }, [contract, fetchLoans]);

  // Filter loans based on user role whenever loans or role changes
  useEffect(() => {
    if (!loans || !currentAccount) return;

    let filtered = [];
    if (role === "user") {
      filtered = loans.filter(
        (loan) => loan.user.toUpperCase() === currentAccount.toUpperCase()
      );
    } else if (role === "library") {
      filtered = loans.filter(
        (loan) =>
          loan.libraryFrom.toUpperCase() === currentAccount.toUpperCase()
      );
    } else {
      filtered = loans;
    }
    setUserLoans(filtered);
    console.log(filtered);
  }, [loans, role, currentAccount]);

  // Generic handler to manage loading state for actions
  const handleAction = async (loanId, actionFunc) => {
    setActionLoading((prev) => ({ ...prev, [loanId]: true }));
    try {
      await actionFunc();
      await fetchLoans(contract);
    } catch (error) {
      console.error("Houve um erro na transação do empréstimo: ", error);
    } finally {
      setActionLoading((prev) => ({ ...prev, [loanId]: false }));
    }
  };

  // --- Action Handlers ---

  // Status 0 -> 1
  const handleAcceptLoan = (loanId) => {
    handleAction(loanId, () => acceptLoan(contract, loanId, signer));
  };

  // Status 0 -> 4
  const handleRejectLoan = (loanId) => {
    handleAction(loanId, () => rejectLoan(contract, signer, loanId));
  };

  // Status 1 -> 3
  const handleMarkAsWithdrawn = (loanId) => {
    handleAction(loanId, () => loanWithUser(contract, signer, loanId));
  };

  // Status 3 -> 2
  const handleReturnLoan = (loanId) => {
    handleAction(loanId, () => returnLoan(contract, signer, loanId));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Meus Empréstimos
      </Typography>

      {userLoans.length === 0 ? (
        <Typography>Não foram encontrados empréstimos.</Typography>
      ) : (
        userLoans.map((loan) => (
          <Accordion key={loan.id}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ width: "60%", flexShrink: 0 }}>
                <strong>Título:</strong> {loan.book.title}
              </Typography>
              <Chip
                label={statusConfig[loan.status]?.text || "Desconhecido"}
                color={statusConfig[loan.status]?.color || "default"}
                size="small"
              />
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                <strong>Autor:</strong> {loan.book.author}
              </Typography>
              <Typography>
                <strong>ISBN: </strong> {loan.book.isbn}
              </Typography>
              <Typography>
                <strong>Usuário: </strong> {loan.user}
              </Typography>

              {/* --- Conditional Button Rendering for Library --- */}
              {role === "library" && (
                <Box mt={2} display="flex" gap={2}>
                  {/* Status 0: Em Análise */}
                  {loan.status === 0 && (
                    <>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleAcceptLoan(loan.id)}
                        disabled={actionLoading[loan.id]}
                      >
                        {actionLoading[loan.id] ? (
                          <CircularProgress size={24} />
                        ) : (
                          "Aceitar"
                        )}
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleRejectLoan(loan.id)}
                        disabled={actionLoading[loan.id]}
                      >
                        {actionLoading[loan.id] ? (
                          <CircularProgress size={24} />
                        ) : (
                          "Rejeitar"
                        )}
                      </Button>
                    </>
                  )}

                  {/* Status 1: Aguardando Retirada */}
                  {loan.status === 1 && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleMarkAsWithdrawn(loan.id)}
                      disabled={actionLoading[loan.id]}
                    >
                      {actionLoading[loan.id] ? (
                        <CircularProgress size={24} />
                      ) : (
                        "Marcar como Retirado"
                      )}
                    </Button>
                  )}

                  {/* Status 3: Em Posse do Usuário */}
                  {loan.status === 3 && (
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => handleReturnLoan(loan.id)}
                      disabled={actionLoading[loan.id]}
                    >
                      {actionLoading[loan.id] ? (
                        <CircularProgress size={24} />
                      ) : (
                        "Finalizar (Marcar como Devolvido)"
                      )}
                    </Button>
                  )}

                  {/* Status 2 (Finalizado) and 4 (Rejeitado) show no buttons */}
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Container>
  );
}

export default Emprestimos;
