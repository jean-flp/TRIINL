import React, { useState } from "react";

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import { bookStore } from "../store/bookStore";
import { userStore } from "../store/userLogin";

const schema = yup.object().shape({
  title: yup.string().required("Título é obrigatório"),
  author: yup.string().required("Autor é obrigatório"),
  isbn: yup.string().required("ISBN é obrigatório"),
  doi: yup.string().required("DOI é obrigatório"),
  ano: yup.string().required("Ano é obrigatório"),
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
  const { books, addBook } = bookStore();
  const [preview, setPreview] = useState(null);

  const {
    currentAccount,
      contract,
      isConnected,
      token,
      role,
      signer,
  } = userStore();


  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    const book = {
      title: data.title,
      author: data.author,
      isbn: data.isbn,
      doi: data.doi,
      ano: data.ano,
      uriSuffix: (data.capa = "urlTeste"),
      amount: data.quantidade,
    };

    try {
      await addBook(contract, signer, book);
      console.log("Deu certo o cadastro", book);
    } catch (err) {
      console.error("Erro ao salvar livro:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2}>
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
          {...register("doi")}
          label="DOI"
          error={!!errors.doi}
          helperText={errors.doi?.message}
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

        <Button type="submit" variant="contained">
          Cadastrar Livro
        </Button>
      </Stack>
    </form>
  );
};

export default BookForm;
