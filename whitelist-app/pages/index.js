import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import Web3Modal from "web3modal";
import { Contract, providers } from "ethers";
import styles from "../styles/Home.module.css";
import { abi, WHITELIST_CONTRACT_ADDRESS } from "../constants";

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0);
  const [joinedWhitelist, setJoinedWhitelist] = useState(false);
  const [isLoading,setIsLoading] = useState(false)
  const web3ModalRef = useRef();

  const getProviderOrSigner = async (needSigner = false) => {
    try {
      const provider = await web3ModalRef.current.connect();
      const web3Provider = new providers.Web3Provider(provider);

      const { chainId } = await web3Provider.getNetwork();
      if (chainId !== 5) {
        window.alert("Change the network to Goerli");
        throw new Error("Change the network to Goerli");
      }
      if (needSigner) {
        const signer = web3Provider.getSigner();
        return signer;
      }
      return web3Provider;
    } catch (err) {
      console.error(err);
    }
  };

  const addAddressToWhitelist = async()=>{
    try{
      const signer = await getProviderOrSigner(true)
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      )
      const tx = await whitelistContract.addAddressToWhitelist()
      setIsLoading(true)
      await tx.wait()
      setIsLoading(false)
      await getNumberOfWhitelisted();
      setJoinedWhitelist(true);
    }catch(err){
      console.error(err)
    }
  }
  const checkIfAddressIsWhitelisted = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      const address = await signer.getAddress();
      const _joinedWhitelist = await whitelistContract.whitelistedAddresses(
        address
      );
      setJoinedWhitelist(_joinedWhitelist);
    } catch (err) {
      console.error(err);
    }
  };

  const getNumberOfWhitelisted = async () => {
    try {
      const provider = await getProviderOrSigner();
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        provider
      );
      const _numAddressesWhitelisted =
        await whitelistContract.numAddressesWhitelisted();
      setNumberOfWhitelisted(_numAddressesWhitelisted);
    } catch (err) {
      console.error(err);
    }
  };

  const renderButton = ()=>{
    if(walletConnected){
      if(joinedWhitelist){
        return ( <div className={styles.description}>
          Thanks for joining the Whitelist
        </div>)
      }else if(isLoading){
        return <button className={styles.button}>
          Loading...
        </button>
      }
      else{
        return (
          <button onClick={addAddressToWhitelist} className={styles.button}>
            Join the Whitelist!
          </button>
        )
      }
    }else{
      return (<button onClick={connectWallet} className={styles.button}>
        Connect your wallet.
      </button>)
    }
  }
  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
      checkIfAddressIsWhitelisted();
      getNumberOfWhitelisted();
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnected]);
  return (
    <div className={styles.body}>
      {/* Header */}
      <Head>
        <title> Whitelist dApp</title>
        <meta name="description" content="Whitelist-Dapp" />
      </Head>
      {/* Content */}
      <div className={styles.main}>
      <div style={{display: 'flex',flexDirection: 'column'}}>
        <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
        <div className={styles.description}>
          {numberOfWhitelisted} have already joined the Whitelist
        </div>
        {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="crypto-devs.svg" />
        </div>
      </div>
      {/* Footer */}
      <footer className={styles.footer}>Made by &#10084; Sahil</footer>
    </div>
  );
}
