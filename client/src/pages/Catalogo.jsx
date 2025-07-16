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

// BookCard component remains the same...
function BookCard({ book, onLoan }) {
  const [coverUrl, setCoverUrl] = useState("");
  const [isImageLoading, setIsImageLoading] = useState(true);

  useEffect(() => {
    const fetchCover = async () => {
      setIsImageLoading(true);
      try {
        if (book && book.uri) {
          const url = await getBookCover(book.uri);
          setCoverUrl(url);
        } else {
          // Set a default if there's no URI
          setCoverUrl(
            "https://placehold.co/345x200/2c3e50/ffffff?text=Capa+Indisponível"
          );
        }
      } catch (error) {
        console.error("Failed to fetch book cover:", error);
        setCoverUrl(
          "https://placehold.co/345x200/2c3e50/ffffff?text=Capa+Indisponível"
        );
      } finally {
        setIsImageLoading(false);
      }
    };
    fetchCover();
  }, [book]);

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
          sx={{ height: 200, objectFit: "contain", pt: 1 }}
          image={coverUrl}
          title={book.title}
          onError={(e) => {
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
  const { currentAccount, contract, role, signer, getEmail } = userStore();

  const [selectedLibrary, setSelectedLibrary] = useState("");
  const [loading, setLoading] = useState(true);
  const { showSnackbar, SnackbarComponent } = useSnackbar();
  const [activeLibraries, setActiveLibraries] = useState([]);

  // Em seu componente BrowseLibrary...

  useEffect(() => {
    const loadData = async () => {
      if (!contract) return;
      setLoading(true);
      try {
        await fetchLibs(contract);
        await fetchBooks(contract);
      } catch (error) {
        console.error("Failed to load library data:", error);
        showSnackbar("Failed to load data from the library.", "error");
      } finally {
        setLoading(false);
      }
    };
    loadData();
    // Apenas 'contract' é necessário. As funções são estáveis.
  }, [contract]);
  // This useEffect now correctly runs *after* libs are fetched
  useEffect(() => {
    const calculateActiveLibraries = async () => {
      let filteredLibs = [];
      if (role === "user") {
        try {
          const email = await getEmail(contract, currentAccount);
          const dominioEmail = email.substring(email.indexOf("@"));
          filteredLibs = libs.filter(
            (library) =>
              library.isActive === true &&
              library.email.toUpperCase() !== dominioEmail.toUpperCase()
          );
        } catch (e) {
          console.error("Houve um erro ao pegar as bibliotecas:", e);
        }
      } else {
        // This 'else' block now works because 'libs' is populated
        filteredLibs = libs.filter((library) => library.isActive === true);
      }
      setActiveLibraries(filteredLibs);
    };

    if (libs.length > 0) {
      calculateActiveLibraries();
    }
  }, [libs, role, contract, currentAccount, getEmail]);

  const filteredBooks = useMemo(() => {
    if (selectedLibrary) {
      return books.filter((book) => book.instituicao === selectedLibrary);
    }
    const activeLibAddresses = new Set(
      activeLibraries.map((lib) => lib.address)
    );
    return books.filter((book) => activeLibAddresses.has(book.instituicao));
  }, [books, selectedLibrary, activeLibraries]);

  const handleLibraryChange = (event) => {
    setSelectedLibrary(event.target.value);
  };

  const handleLoanBook = (book) => {
    try {
      requestLoan(contract, signer, book);
      showSnackbar(`Solicitação para "${book.title}" enviada!`, "success");
    } catch (err) {
      showSnackbar(
        "Ocorreu um erro ao tentar solicitar um empréstimo!",
        "error"
      );
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
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
          <Grid container spacing={3} sx={{ mt: 3 }}>
            {filteredBooks.map((book) => (
              <Grid
                item
                key={`${book.isbn}-${book.instituicao}`}
                xs={12}
                sm={6}
                md={4}
              >
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
