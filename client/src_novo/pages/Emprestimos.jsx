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

// 💡 MOCK DATA
const mockLoans = [
  {
    id: 1,
    book: {
      title: "Clean Code",
      author: "Robert C. Martin",
    },
    status: "Returned",
    dueDate: "2025-06-10",
    returnedDate: "2025-06-05",
  },
  {
    id: 2,
    book: {
      title: "The Pragmatic Programmer",
      author: "Andrew Hunt",
    },
    status: "Pending",
    dueDate: "2025-06-20",
    returnedDate: null,
  },
  {
    id: 3,
    book: {
      title: "Design Patterns",
      author: "Erich Gamma",
    },
    status: "Overdue",
    dueDate: "2025-05-15",
    returnedDate: null,
  },
];

function Emprestimos() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMockData = () => {
      setTimeout(() => {
        setLoans(mockLoans);
        setLoading(false);
      }, 1000);
    };

    loadMockData();
  }, []);

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

      {loans.length === 0 ? (
        <Typography>Não foram encontrados empréstimos</Typography>
      ) : (
        loans.map((loan) => (
          <Accordion key={loan.id}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ width: "60%", flexShrink: 0 }}>
                {loan.book.title}
              </Typography>
              <Typography
                sx={{
                  color:
                    loan.status === "Atrasado"
                      ? "red"
                      : loan.status === "Finalizado"
                      ? "green"
                      : "text.secondary",
                }}
              >
                {loan.status}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                <strong>Autor:</strong> {loan.book.author}
              </Typography>
              <Typography>
                <strong>Data de devolução:</strong> {loan.dueDate}
              </Typography>
              <Typography>
                <strong>Devolvido:</strong>{" "}
                {loan.returnedDate ?? "Ainda não foi devolvido"}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Box>
  );
}

export default Emprestimos;
