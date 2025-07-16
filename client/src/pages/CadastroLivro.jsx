import React, { useState } from "react";

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import { Snackbar, Alert } from "@mui/material";
import { bookStore } from "../store/bookStore";
import { userStore } from "../store/userLogin";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import { putBookCover } from "../utils/ipfsAPI";
const currentYear = new Date().getFullYear();

const schema = yup.object().shape({
  title: yup.string().required("Título é obrigatório"),
  author: yup.string().required("Autor é obrigatório"),
  isbn: yup.string().required("ISBN é obrigatório"),
  ano: yup
    .number()
    .required("Ano é obrigatório")
    .min(700, "O ano de publicação parece muito antigo") // Define o ano mínimo
    .max(
      currentYear,
      `O ano não pode ser no futuro (maior que ${currentYear})`
    ),
  capa: yup
    .mixed()
    .required("A imagem da capa é obrigatória")
    .test(
      "fileType",
      "Apenas imagens são permitidas",
      (value) =>
        value &&
        value.length &&
        ["image/jpeg", "image/png"].includes(value[0]?.type)
    ),
  quantidade: yup
    .number("Quantidade precisa ser um número")
    .integer("Quantidade tem que ser um número")
    .min(1, "A quantidade mínima é 1"),
});

const BookForm = () => {
  const [showSuccessAlertRegistro, setShowSuccessAlertRegistro] =
    useState(false);
  const [open, setOpen] = useState(false);
  const defaultValues = {
    title: "",
    author: "",
    isbn: "",
    ano: "",
    capa: null,
    quantidade: null,
  };
  const { books, addBook } = bookStore();
  const [preview, setPreview] = useState(null);

  const { currentAccount, contract, isConnected, token, role, signer } =
    userStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: defaultValues,
  });

  const onSubmit = async (data) => {
    const book = {
      title: data.title,
      author: data.author,
      isbn: data.isbn,
      ano: data.ano.toString(),
      uriSuffix: await putBookCover(data.capa[0], currentAccount),
      amount: data.quantidade,
    };
    console.log(book);

    try {
      await addBook(contract, signer, book);
      reset();
      setPreview(null);

      setShowSuccessAlertRegistro(true);

      setTimeout(() => setShowSuccessAlertRegistro(false), 4000);
    } catch (err) {
      console.error("Erro ao salvar livro:", err);
    }
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  return (
    <Paper
      elevation={3} // Adds a subtle shadow
      sx={{ p: 4, borderRadius: 2 }} // p: 4 adds padding on all sides
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          <Typography variant="h5" component="h1" gutterBottom>
            Cadastrar Novo Livro
          </Typography>
          <TextField
            {...register("title")}
            label="Título"
            error={!!errors.title}
            helperText={errors.title?.message}
            fullWidth
          />
          <TextField
            {...register("author")}
            label="Autor"
            error={!!errors.author}
            helperText={errors.author?.message}
            fullWidth
          />
          <TextField
            {...register("isbn")}
            label="ISBN"
            error={!!errors.isbn}
            helperText={errors.isbn?.message}
            fullWidth
          />
          <TextField
            {...register("ano")}
            label="Ano"
            error={!!errors.ano}
            helperText={errors.ano?.message}
            fullWidth
          />
          <Controller
            name="capa"
            control={control}
            render={({ field }) => (
              <>
                <Button variant="outlined" component="label">
                  Upload da Capa
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setPreview(URL.createObjectURL(file));
                        field.onChange(e.target.files);
                      }
                    }}
                  />
                </Button>
                {errors.capa && (
                  <Box color="error.main" fontSize="0.8rem" mt={1}>
                    {errors.capa.message}
                  </Box>
                )}
                {preview && (
                  <Box mt={2}>
                    <img
                      src={preview}
                      alt="Prévia da capa"
                      style={{ maxWidth: "200px", borderRadius: "4px" }}
                    />
                  </Box>
                )}
              </>
            )}
          />
          <TextField
            {...register("quantidade")}
            label="Quantidade"
            error={!!errors.quantidade}
            helperText={errors.quantidade?.message}
            fullWidth
          />
          {showSuccessAlertRegistro && (
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
              <Alert severity="success">Livro Cadastrado com Sucesso!</Alert>
            </Snackbar>
          )}

          <Button type="submit" variant="contained">
            Cadastrar Livro
          </Button>
        </Stack>
      </form>
    </Paper>
  );
};

export default BookForm;
