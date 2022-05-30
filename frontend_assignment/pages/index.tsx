import { yupResolver } from "@hookform/resolvers/yup";
import detectEthereumProvider from "@metamask/detect-provider";
import {
    Button,
    Card, CardActions, CardContent, Container, FormControl, Typography, TextField
} from '@mui/material';
import { Strategy, ZkIdentity } from "@zk-kit/identity";
import { generateMerkleProof, Semaphore } from "@zk-kit/protocols";
import Greeter from "artifacts/contracts/Greeters.sol/Greeters.json";
import { Contract, providers, utils } from "ethers";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import styles from "../styles/Home.module.css";
import Form from "./components/GreetingForms";


export default function Home() {
    const [logs, setLogs] = React.useState("Connect your wallet and greet!")
    const [newGreeting, setGreeting] = useState("");

    

    useEffect(() => {
      const listen = async () => {
        const provider = new providers.JsonRpcProvider("http://localhost:8545")

 
        const contract = new Contract(
          "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
          Greeter.abi,
          provider
        );
 
        contract.on("NewGreeting", (greeting: string) => {
            console.log("NewGreeting Event:");
            console.log(newGreeting)
          setGreeting(utils.parseBytes32String(greeting));
        });

        console.log("listener ON");
        console.log(newGreeting)
      };
      listen();
      console.log(newGreeting)
  
    }, [newGreeting]);
    
    async function greet() {
        setLogs("Creating your Semaphore identity...")

        const provider = (await detectEthereumProvider()) as any

        await provider.request({ method: "eth_requestAccounts" })

        const ethersProvider = new providers.Web3Provider(provider)
        const signer = ethersProvider.getSigner()
        const message = await signer.signMessage("Sign this message to create your identity!")

        const identity = new ZkIdentity(Strategy.MESSAGE, message)
        const identityCommitment = identity.genIdentityCommitment()
        const identityCommitments = await (await fetch("./identityCommitments.json")).json()

        const merkleProof = generateMerkleProof(20, BigInt(0), identityCommitments, identityCommitment)

        setLogs("Creating your Semaphore proof...")

        const greeting = "Hello world"

        const witness = Semaphore.genWitness(
            identity.getTrapdoor(),
            identity.getNullifier(),
            merkleProof,
            merkleProof.root,
            greeting
        )

        const { proof, publicSignals } = await Semaphore.genProof(witness, "./semaphore.wasm", "./semaphore_final.zkey")
        const solidityProof = Semaphore.packToSolidityProof(proof)

        const response = await fetch("/api/greet", {
            method: "POST",
            body: JSON.stringify({
                greeting,
                nullifierHash: publicSignals.nullifierHash,
                solidityProof: solidityProof
            })
        })

        if (response.status === 500) {
            const errorMessage = await response.text()

            setLogs(errorMessage)
        } else {
            setLogs("Your anonymous greeting is onchain :)")
            console.log('this is the', greeting)
        }
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>Greetings</title>
                <meta name="description" content="A simple Next.js/Hardhat privacy application with Semaphore." />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Form onSubmit={(data) => console.log(data)} />

            

            <main className={styles.main}>

        <TextField
          id="filled-multiline-flexible"
          label="Textbox"
          multiline
          maxRows={4}
          value={newGreeting}
          variant="filled"
        />
                <h1 className={styles.title}>Greetings</h1>

                <p className={styles.description}>A simple Next.js/Hardhat privacy application with Semaphore.</p>

                <div className={styles.logs}>{logs}</div>

                <div onClick={() => greet()} className={styles.button}>
                    Greet
                </div>
            </main>
        </div>
    )
}
