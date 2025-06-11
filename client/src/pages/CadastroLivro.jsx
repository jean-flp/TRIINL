import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

const schema = yup.object().shape({
  title: yup.string().required("Título é obrigatório"),
  author: yup.string().required("Autor é obrigatório"),
  isbn: yup.string().required("ISBN é obrigatório"),
  doi: yup.string().required("DOI é obrigatório"),
  ano: yup.string().required("Ano é obrigatório"),
  uri: yup
    .string()
    .url("URI deve ser um URL válido")
    .required("URI é obrigatório"),
  instituicao: yup.string().required("Instituição é obrigatória"),
});

const BookForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => {
    console.log(data);
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
        <TextField
          {...register("uri")}
          label="URI"
          error={!!errors.uri}
          helperText={errors.uri?.message}
          fullWidth
        />
        <TextField
          {...register("instituicao")}
          label="Instituição"
          error={!!errors.instituicao}
          helperText={errors.instituicao?.message}
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
