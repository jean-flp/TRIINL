import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  InputLabel,
  FormControl,
  Container,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ethers } from "ethers";
import { userStore } from "../store/userLogin";
import { bookStore } from "../store/bookStore";
import useSnackbar from "../components/Alert";

function BrowseLibrary() {
  const { books, fetchBooks } = bookStore();
  const [selectedLibrary, setSelectedLibrary] = useState("");
  const [loading, setLoading] = useState(true);
  const [libraries, setLibraries] = useState([]);
  const { showSnackbar, SnackbarComponent } = useSnackbar();
  const contract = userStore((state) => state.contract);

  useEffect(() => {
    console.log("ALOU", contract);
    if (contract == null) {
      showSnackbar("Faça Login!", "error");
    } else {
      fetchBooks(contract);
      console.log("Livros:", books);
    }
  }, []);

  const handleLibraryChange = (event) => {
    setSelectedLibrary(event.target.value);
  };

  const handleLoanBook = (book) => {
    console.log("Loan requested for book:", book);
  };

  return (
    <Container maxWidth="sm" sx={{ display: "flex", justifyContent: "center" }}>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 2,
          mt: 4,
        }}
      >
        <Typography variant="h4" gutterBottom align="center">
          Browse Library
        </Typography>

        <FormControl fullWidth margin="normal">
          <InputLabel>Select a Library</InputLabel>
          <Select
            value={selectedLibrary}
            onChange={handleLibraryChange}
            label="Select a Library"
          >
            {libraries.map((lib) => (
              <MenuItem key={lib.id} value={lib.id}>
                {lib.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {loading ? (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        ) : books.length > 0 ? (
          <Box sx={{ width: "100%", mt: 2 }}>
            {books.map((book, index) => (
              <Accordion key={index}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ width: "70%", flexShrink: 0 }}>
                    {book.title}
                  </Typography>
                  <Typography sx={{ color: book.available ? "green" : "red" }}>
                    {book.available ? "Available" : "Not available"}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    <strong>Author:</strong> {book.author}
                  </Typography>

                  {book.available ? (
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{ mt: 2 }}
                      onClick={() => handleLoanBook(book)}
                    >
                      Loan Book
                    </Button>
                  ) : (
                    <Typography sx={{ mt: 2, color: "gray" }}>
                      This book is not available for loan.
                    </Typography>
                  )}
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        ) : selectedLibrary ? (
          <Typography mt={2}>No books found for this library.</Typography>
        ) : null}
      </Box>
      <SnackbarComponent />
    </Container>
  );
}

export default BrowseLibrary;
