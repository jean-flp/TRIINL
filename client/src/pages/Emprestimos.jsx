import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { loanStore } from "../store/loanStore";
import { userStore } from "../store/userLogin";

function Emprestimos() {
  const [loading, setLoading] = useState(true);
  const { loans, fetchLoans } = loanStore();
  const [userLoans, setUserLoans] = useState([]);
  const contract = userStore((state) => state.contract);
  const currentAccount = userStore((state) => state.currentAccount);
  const role = userStore((state) => state.role);

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
              <Typography sx={{ width: "60%", flexShrink: 0 }}>{}</Typography>
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
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Box>
  );
}

export default Emprestimos;
