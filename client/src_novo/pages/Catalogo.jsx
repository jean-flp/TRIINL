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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Container from "@mui/material/Container";

const mockLibraries = [
  { id: 1, name: "Central Library" },
  { id: 2, name: "Downtown Branch" },
];

const mockBooksByLibrary = {
  1: [
    {
      id: 101,
      title: "Clean Code",
      author: "Robert C. Martin",
      available: true,
    },
    {
      id: 102,
      title: "Refactoring",
      author: "Martin Fowler",
      available: false,
    },
  ],
  2: [
    {
      id: 201,
      title: "JavaScript: The Good Parts",
      author: "Douglas Crockford",
      available: true,
    },
    {
      id: 202,
      title: "Eloquent JavaScript",
      author: "Marijn Haverbeke",
      available: true,
    },
  ],
};

function BrowseLibrary() {
  const [selectedLibrary, setSelectedLibrary] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleLibraryChange = (event) => {
    const libraryId = event.target.value;
    setSelectedLibrary(libraryId);
    fetchBooksForLibrary(libraryId);
  };

  const fetchBooksForLibrary = (libraryId) => {
    setLoading(true);

    // Simulate async call with timeout
    setTimeout(() => {
      const books = mockBooksByLibrary[libraryId] || [];
      setBooks(books);
      setLoading(false);
    }, 1000);
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
            {mockLibraries.map((lib) => (
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
            {books.map((book) => (
              <Accordion key={book.id}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ width: "70%", flexShrink: 0 }}>
                    {book.title}
                  </Typography>
                  <Typography
                    sx={{
                      color: book.available ? "green" : "red",
                    }}
                  >
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
    </Container>
  );
}

export default BrowseLibrary;
