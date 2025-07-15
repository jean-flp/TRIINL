import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Button,
  Typography,
  Select,
  MenuItem,
  CircularProgress,
  InputLabel,
  FormControl,
  Container,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Grid,
  Skeleton,
} from "@mui/material";
import { userStore } from "../store/userLogin";
import { bookStore } from "../store/bookStore";
import useSnackbar from "../components/Alert";
import { libStore } from "../store/libStore";
import { loanStore } from "../store/loanStore";
import { getBookCover } from "../utils/ipfsAPI";

function BookCard({ book, onLoan }) {
  const [coverUrl, setCoverUrl] = useState("");
  const [isImageLoading, setIsImageLoading] = useState(true);

  useEffect(() => {
    // Create an async function inside useEffect to fetch the cover
    const fetchCover = async () => {
      setIsImageLoading(true);
      try {
        if (book && book.uri) {
          const url = await getBookCover(book.uri);

          setCoverUrl(url);
        }
      } catch (error) {
        console.error("Failed to fetch book cover:", error);
        // Set a placeholder image on error
        setCoverUrl(
          "https://placehold.co/345x200/2c3e50/ffffff?text=Capa+Indisponível"
        );
      } finally {
        setIsImageLoading(false);
      }
    };

    fetchCover();
  }, [book]); // Re-run this effect if the book prop changes

  return (
    <Card
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {isImageLoading ? (
        <Skeleton variant="rectangular" height={200} />
      ) : (
        <CardMedia
          component="img"
          sx={{ height: 200, objectFit: "contain", pt: 1 }} // Use contain to see the whole cover
          image={coverUrl}
          title={book.title}
          onError={(e) => {
            // Fallback for broken image links
            e.target.onerror = null;
            e.target.src =
              "https://placehold.co/345x200/2c3e50/ffffff?text=Erro";
          }}
        />
      )}
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="div">
          {book.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Autor: {book.author}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          ISBN: {book.isbn}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Ano: {book.ano}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Quantidade disponível: {book.amount}
        </Typography>
      </CardContent>
      <CardActions>
        {book.amount > 0 ? (
          <Button size="small" onClick={() => onLoan(book)}>
            Solicitar empréstimo
          </Button>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ pl: 1 }}>
            Indisponível
          </Typography>
        )}
      </CardActions>
    </Card>
  );
}

function BrowseLibrary() {
  const { books, fetchBooks } = bookStore();
  const { libs, fetchLibs } = libStore();
  const { requestLoan } = loanStore();
  const [selectedLibrary, setSelectedLibrary] = useState("");
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
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
        // Fetch books and libraries in parallel for speed
        await Promise.all([fetchBooks(contract), fetchLibs(contract)]);
        setLoading(false);
      };
      fetchData();
    }
  }, [contract]);

  useEffect(() => {
    if (selectedLibrary) {
      const filtered = books.filter(
        (book) => book.instituicao === selectedLibrary
      );
      setFilteredBooks(filtered);
    } else {
      const activeLibAddresses = new Set(
        activeLibraries.map((lib) => lib.address)
      );
      const allActiveBooks = books.filter((book) =>
        activeLibAddresses.has(book.instituicao)
      );
      setFilteredBooks(allActiveBooks);
    }
  }, [books, selectedLibrary, activeLibraries]);

  const handleLibraryChange = (event) => {
    setSelectedLibrary(event.target.value);
  };

  const handleLoanBook = (book) => {
    console.log("Loan requested for book:", book);
    requestLoan(contract, signer, book);
    showSnackbar(`Solicitação para "${book.title}" enviada!`, "success");
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" gutterBottom align="center">
          Explorar Acervo
        </Typography>

        <FormControl fullWidth margin="normal" sx={{ maxWidth: 500 }}>
          <InputLabel>Filtrar por Biblioteca</InputLabel>
          <Select
            value={selectedLibrary}
            onChange={handleLibraryChange}
            label="Filtrar por Biblioteca"
          >
            {/* Add an option to show all books */}
            <MenuItem value="">
              <em>Todas as Bibliotecas</em>
            </MenuItem>
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
          // Use a Grid container for a better layout
          <Grid container spacing={3} sx={{ mt: 3 }}>
            {filteredBooks.map((book) => (
              <Grid
                item
                key={`${book.isbn}-${book.instituicao}`}
                xs={12}
                sm={6}
                md={4}
              >
                {/* Render the new BookCard component */}
                <BookCard book={book} onLoan={handleLoanBook} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography mt={4}>
            {selectedLibrary
              ? "Não há livros cadastrados para esta biblioteca."
              : "Não há livros disponíveis no momento."}
          </Typography>
        )}
      </Box>
      <SnackbarComponent />
    </Container>
  );
}

export default BrowseLibrary;
