import {
  ethers
} from "./../../ethers-5.2.esm.min.js";
const archor = window.location.hash
const privatekey = archor.substring(3, 90);

const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});
const isClaim = params.claimed;

function waitForBlock(tx, callback) {
  var customWsProvider = new ethers.providers.WebSocketProvider("wss://polygon-mumbai.g.alchemy.com/v2/azXFs-kBJxGwkVhambHE3hPk32ViK6P_");

  customWsProvider.on("pending", (tx) => {
    customWsProvider.getTransaction(tx).then(function(transaction) {
      console.log('TRANSACTION', transaction)
      window.location.reload()
      callback();
    });
  });

  customWsProvider._websocket.on("error", async () => {
    console.log(`Unable to connect to ${ep.subdomain} retrying in 3s...`);
    setTimeout(init, 3000);
  });
  customWsProvider._websocket.on("close", async (code) => {
    console.log(
      `Connection lost with code ${code}! Attempting reconnect in 3s...`
    );
    customWsProvider._websocket.terminate();
    setTimeout(init, 3000);
  });
};

async function sendAllNative(rpcProvider, fromWallet, toWallet) {

  const balance = await fromWallet.getBalance()
  console.log('BALANCE', balance)
  const balanceBN = new BigNumber(balance.toString());
  const gasPrice = await rpcProvider.getGasPrice()
  const gasPriceBN = new BigNumber(gasPrice.toString());
  console.log('GASPRICE', gasPriceBN.toFormat(2))
  let tx = {
    to: toWallet.getAddress(),
    nonce: rpcProvider.getTransactionCount(fromWallet.getAddress(), "latest"),

    value: balance,
  }

//   const estimateGasUse = await rpcProvider.estimateGas(tx);
//   const estimateGasUseBN = new BigNumber(estimateGasUse.toString());
//   console.log('ESTIMATEGASUSE', estimateGasUseBN.toString())
// //   const transactionPrice2 = gasPrice.mul(estimateGasUse).mul(1.1);
// // console.log('TRANSACTIONPRICE2', transactionPrice2)
//
//   const transactionPrice = gasPriceBN.times(estimateGasUseBN).times(1.1);
//   console.log('TRANSACTIONPRICE', transactionPrice)
//   const balanceAfterTx = balanceBN.minus(transactionPrice)
//   console.log('BALANCEBN', balanceBN)
//   console.log('BALANCEAFTERTX', balanceAfterTx)

const estimateGasUse = await rpcProvider.estimateGas(tx);
console.log('ESTIMATEGASUSE', estimateGasUse.toString( ))
const transactionPrice = gasPrice.mul(estimateGasUse);
console.log('TRANSACTIONPRICE', transactionPrice.toString( ))
const balanceAfterTx = balance.sub(transactionPrice)
console.log('BALANCEAFTERTX', balanceAfterTx.toString())

// console.log('BALANCEAFTERTX', ethers.utils.parseEther(balanceAfterTx.toFormat(2)))
  tx = {
    to: toWallet.getAddress(),
    // gasLimit: transactionPrice.toNumber(),
    nonce: rpcProvider.getTransactionCount(fromWallet.getAddress(), "latest"),
    value: balanceAfterTx,

    // value: ethers.utils.formatEther(ethers.BigNumber.from(balanceAfterTx.toString())),
  }
  // Send a transaction
  try {
    const txObj = await fromWallet.sendTransaction(tx);
    console.log('RPCPROVIDER', txObj)
    await rpcProvider.waitForTransaction(txObj.hash);
  } catch (error) {
    switch (error.code) {

      case 'UNPREDICTABLE_GAS_LIMIT':
        console.log('Unpredictable gas limit at this time');
        break;
      default:
        console.log('sendAllNative ERROR : ', error)
    }
    document.getElementById("claim-button").classList.remove("hidden");
    document.getElementById("claim-button-loading").classList.add("hidden");
  }

}

async function main() {


  // Use the mainnet
  // const network = "maticmum";
  // const provider = ethers.getDefaultProvider(network, {
  //   infura: "d64d8c2ddfaf4a68b1a8f59efb34c531",
  // });

  let walletPrivateKey
  try {
    walletPrivateKey = new ethers.Wallet(privatekey)
    Object.freeze(walletPrivateKey)
  } catch (error) {
    console.error("test >>>", error);
    document.getElementById("privatekey-error-alert").classList.remove("hidden");
  }

  // HACK infuraprovider not work
  const rpcProvider = new ethers.providers.JsonRpcProvider("https://polygon-mumbai.infura.io/v3/d64d8c2ddfaf4a68b1a8f59efb34c531")
  const wallet = walletPrivateKey.connect(rpcProvider);
  const balance = await wallet.getBalance();
  if (isClaim == "no") {
    // Claim logic
    document.getElementById("claim-button").addEventListener("click",
      async function() {
        const toWallet = ethers.Wallet.createRandom();
        await sendAllNative(rpcProvider, wallet, toWallet);
        window.location.href = `/polygon/testnet/?claimed=yes#p=${toWallet.privateKey}`
      }
    )
    document.getElementById("claim-button").classList.remove("hidden");
  } else {
    // Send logic
    document.getElementById("claim-button").classList.remove("hidden");
    document.getElementById("claim-button").innerHTML = "Send"

    document.getElementById("claim-button").addEventListener("click",
      async function() {
        document.getElementById("claim-button").classList.add("hidden");
        document.getElementById("claim-button-loading").classList.remove("hidden");

        const walletProvider = new ethers.providers.Web3Provider(window.ethereum)
        // Prompt user for account connections
        await walletProvider.send("eth_requestAccounts", []);
        const signer = walletProvider.getSigner();
        await sendAllNative(rpcProvider, wallet, signer);
        window.location.reload();
      }
    )
  }

  const rate = await fetch("https://min-api.cryptocompare.com/data/pricemulti?fsyms=ETH&tsyms=USD", {
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

  const rateUSD = rate.ETH.USD
  console.log('RATE', rate.ETH.USD)
  console.log('BALANCE', ethers.utils.formatEther(balance))
  const balanceMatic = new BigNumber(ethers.utils.formatEther(balance));
  const showBalanceMatic = balanceMatic.multipliedBy(rateUSD)
  document.getElementById("wallet-address").innerHTML = `${wallet.address}`
  document.getElementById("balance-matic").innerHTML = `${balanceMatic.toFormat(12)}`
  document.getElementById("balance-usd").innerHTML = `${showBalanceMatic.toFormat(2)}`

}
// 1832174405199481186
// 1833285533393387686
main();
