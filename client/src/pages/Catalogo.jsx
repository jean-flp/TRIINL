import { useEffect, useState, useMemo } from "react";
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
  Card,
  CardMedia,
  CardContent,
  CardActions,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ethers } from "ethers";
import { userStore } from "../store/userLogin";
import { bookStore } from "../store/bookStore";
import useSnackbar from "../components/Alert";
import { libStore } from "../store/libStore";
import { loanStore } from "../store/loanStore";

function BrowseLibrary() {
  const { books, fetchBooks } = bookStore();
  const { libs, fetchLibs } = libStore();
  const { requestLoan } = loanStore();
  const [selectedLibrary, setSelectedLibrary] = useState("");
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [libraries, setLibraries] = useState([]);
  const { showSnackbar, SnackbarComponent } = useSnackbar();
  const contract = userStore((state) => state.contract);
  const signer = userStore((state) => state.signer);

  const activeLibraries = useMemo(() => {
    return libs.filter((library) => library.isActive === true);
  }, [libs]);

  useEffect(() => {
    if (contract == null) {
      showSnackbar("Faça Login!", "error");
    } else {
      const fetchData = async () => {
        setLoading(true);
        await fetchBooks(contract);
        await fetchLibs(contract);
        setLoading(false);
      };
      fetchData();
    }
  }, []);

  useEffect(() => {
    if (selectedLibrary) {
      // Find the library object using its address
      const selectedLibObject = activeLibraries.find(
        (lib) => lib.address === selectedLibrary
      );
      if (selectedLibObject) {
        const filtered = books.filter(
          (book) => book.instituicao === selectedLibObject.address
        );
        setFilteredBooks(filtered);
      } else {
        setFilteredBooks([]);
      }
    } else {
      // If no library is selected, show all books
      setFilteredBooks(books);
    }
  }, [books, selectedLibrary, activeLibraries]);

  const handleLibraryChange = (event) => {
    setSelectedLibrary(event.target.value);
    console.log(selectedLibrary);
  };

  const handleLoanBook = (book) => {
    console.log("Loan requested for book:", book);
    requestLoan(contract, signer, book);
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
            label="Escolha uma biblioteca"
          >
            {activeLibraries.map((lib) => (
              <MenuItem key={lib.address} value={lib.address}>
                {lib.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {loading ? (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        ) : filteredBooks.length > 0 ? (
          <Box sx={{ width: "100%", mt: 3 }}>
            {books.map((book, index) => (
              <Card sx={{ maxWidth: 345 }}>
                <CardMedia
                  sx={{ height: 200 }}
                  image={book.uriSuffix}
                  title={book.title}
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {book.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Autor: {book.author}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    ISBN: {book.isbn}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Ano: {book.ano}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Quantidade disponível para empréstimo: {book.amount}
                  </Typography>
                </CardContent>
                <CardActions>
                  {book.amount > 0 ? (
                    <Button size="small" onClick={() => handleLoanBook(book)}>
                      Solicitar empréstimo{" "}
                    </Button>
                  ) : (
                    <Typography>
                      {" "}
                      Não há exemplares disponíveis para empréstimo{" "}
                    </Typography>
                  )}
                </CardActions>
              </Card>
            ))}
          </Box>
        ) : selectedLibrary ? (
          <Typography mt={2}>
            Não há livros cadastrados para essa biblioteca.
          </Typography>
        ) : null}
      </Box>
      <SnackbarComponent />
    </Container>
  );
}

export default BrowseLibrary;
