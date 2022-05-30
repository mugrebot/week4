import React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import detectEthereumProvider from "@metamask/detect-provider";
import { Box, Button, FormControl, Paper, TextField } from "@mui/material";

import { Strategy, ZkIdentity } from "@zk-kit/identity";
import { generateMerkleProof, Semaphore } from "@zk-kit/protocols";
import { providers } from "ethers";
import Head from "next/head";
import * as yup from "yup";
import { date, InferType, number, object, string } from "yup";


type FormInput = {
    name: string,
    age: number,
    address: string
}

export default function Form({
    onSubmit,
}: {
    onSubmit: SubmitHandler<FormInput>
}) {
    let schema = yup.object().shape({
        name: yup.string().required(),
        age: yup.number().required().positive().integer(),
        address: yup.string().required(),
      });

        // check validity
schema
.isValid({
  name: 'm00npapi',
  age: 28,
  address: '1234 bing bong street'
})
.then(function (valid) {
  valid; // => true
});


const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormInput>({
    resolver: yupResolver(schema),
  });

  return (
    <Paper
      variant="outlined"
      sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <TextField
            {...register("name", { required: true })}
            error={!!errors.name}
            label={errors.name ? errors.name.message : "Name"}
          />

          <TextField
            {...register("age", { required: true })}
            type="number"
            error={!!errors.age}
            label={errors.age ? errors.age.message : "Age"}
            sx={{ my: 1 }}
          />

          <TextField
            {...register("address", { required: true })}
            error={!!errors.address}
            label={errors.address ? errors.address.message : "Address"}
            sx={{ mb: 3 }}
          />

          <Button variant="contained" type="submit">
            Submit
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

    









