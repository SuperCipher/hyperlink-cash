import {
  ethers
} from "./../../ethers-5.2.esm.min.js";

const CHAIN_NAME = "polygon";

const archor = window.location.hash;
const privatekey = archor.substring(3, 90);

const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});
const isClaim = params.claimed;

async function sendAllNative(rpcProvider, fromWallet, toWallet) {

  const balance = await fromWallet.getBalance();
  const gasPrice = await rpcProvider.getGasPrice();
  console.log('GASPRICE', gasPrice)
  const type = typeof gasPrice;

  let tx = {
    to: toWallet.getAddress(),
    nonce: rpcProvider.getTransactionCount(fromWallet.getAddress(), "latest"),

    value: balance,
  }

  const estimateGasUse = await rpcProvider.estimateGas(tx);
  const transactionPrice = gasPrice.mul(estimateGasUse);
  const boostFee = transactionPrice.mul(5).div(100)
  // TODO increase fee if first transaction fail
  const boostTransactionPrice = transactionPrice.add(boostFee)
  const balanceAfterTx = balance.sub(transactionPrice);

  tx = {
    to: toWallet.getAddress(),
    nonce: rpcProvider.getTransactionCount(fromWallet.getAddress(), "latest"),
    value: balanceAfterTx,

  }
  // Send a transaction
  const txObj = await fromWallet.sendTransaction(tx);
  console.log('TXOBJ', txObj)
  await txObj.wait();

}

async function getRate() {
  return await fetch("https://min-api.cryptocompare.com/data/pricemulti?fsyms=MATIC&tsyms=USD", {
      "credentials": "include",
      "headers": {
        "Accept": "application/json, text/plain, */*",
        "authorization": "Apikey 6175d561f4a61549e3d03228e60226b3c8bcddb31b2bb3af371cb234345523fb",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "cross-site",
      },
      "method": "GET",
      "mode": "cors"
    }).then((response) => response.json())
    .then((data) => {
      return data;
    });
}

async function main() {

  let walletPrivateKey;
  if (privatekey === "") {
    // If no private key provided will generate a new wallet
    walletPrivateKey = ethers.Wallet.createRandom();
    Object.freeze(walletPrivateKey);
    window.location.href = `/${CHAIN_NAME}/testnet/?claimed=no#p=${walletPrivateKey.privateKey}`;
  } else {
    // Import wallet from url fragment parameter
    try {
      walletPrivateKey = new ethers.Wallet(privatekey);
      Object.freeze(walletPrivateKey);
    } catch (error) {
      console.error("test >>>", error);
      document.getElementById("privatekey-error-alert").classList.remove("hidden");
    }
  }

  // HACK infuraprovider not work
  const rpcProvider = new ethers.providers.JsonRpcProvider(`https://${CHAIN_NAME}-mumbai.infura.io/v3/d64d8c2ddfaf4a68b1a8f59efb34c531`);
  const wallet = walletPrivateKey.connect(rpcProvider);
  const balance = await wallet.getBalance();
  if (isClaim === "no") {
    // Claim logic
    document.getElementById("claim-button").addEventListener("click",
      async function() {
        document.getElementById("claim-button").classList.add("hidden");
        document.getElementById("claim-button-loading").classList.remove("hidden");

        const toWallet = ethers.Wallet.createRandom();
        try {
          await sendAllNative(rpcProvider, wallet, toWallet);
          window.location.href = `/${CHAIN_NAME}/testnet/?claimed=yes#p=${toWallet.privateKey}`;

        } catch (error) {
          switch (error.code) {
            case 'UNPREDICTABLE_GAS_LIMIT':
              console.log('Unpredictable gas limit at this time');
              console.log('ERROR', error)
              break;
            default:
              console.log('sendAllNative ERROR : ', error);
          }
          document.getElementById("claim-button").classList.remove("hidden");
          document.getElementById("claim-button-loading").classList.add("hidden");
        }
      }
    )
    document.getElementById("claim-button").classList.remove("hidden");
  } else {
    // Send logic
    navigator.clipboard.writeText(`${window.location}`);
    document.getElementById("copy-url-component").classList.remove("hidden");
    document.getElementById("claim-button").classList.remove("hidden");
    document.getElementById("claim-button").innerHTML = "Send";
    document.getElementById("claim-button").addEventListener("click",
      async function() {
        document.getElementById("claim-button").classList.add("hidden");
        document.getElementById("claim-button-loading").classList.remove("hidden");

        const walletProvider = new ethers.providers.Web3Provider(window.ethereum);
        // Prompt user for account connections
        await walletProvider.send("eth_requestAccounts", []);
        // wallet is similar to signer
        const signer = walletProvider.getSigner();
        try {
          await sendAllNative(rpcProvider, wallet, signer);
          window.location.reload();

        } catch (error) {
          switch (error.code) {
            case 'UNPREDICTABLE_GAS_LIMIT':
              console.log('Unpredictable gas limit at this time');
              break;
            default:
              console.log('sendAllNative ERROR : ', error);
          }
          document.getElementById("claim-button").classList.remove("hidden");
          document.getElementById("claim-button-loading").classList.add("hidden");
        }
      }
    )
  }

  const rate = await getRate();
  const rateUSD = rate.MATIC.USD;
  console.log('RATE', rate.MATIC.USD);
  console.log('BALANCE', ethers.utils.formatEther(balance));
  const balanceMatic = new BigNumber(ethers.utils.formatEther(balance));
  const showBalanceMatic = balanceMatic.multipliedBy(rateUSD);
  document.getElementById("wallet-address").innerHTML = `${wallet.address}`
  document.getElementById("balance-matic").innerHTML = `${balanceMatic.toFormat(12)}`
  document.getElementById("balance-usd").innerHTML = `${showBalanceMatic.toFormat(2)}`
  document.getElementById("current-url").innerHTML = `${window.location}`
  document.getElementById("wallet-address-button").addEventListener("click",
    async function() {
      window.open(`https://mumbai.polygonscan.com/address/${wallet.address}`, '_blank');
    }
  )
  document.getElementById("copy-button").addEventListener("pointerdown", () => navigator.clipboard.writeText(`${window.location}`));
}

main();
