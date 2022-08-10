import {
  ethers
} from "./../../ethers-5.2.esm.min.js";
const archor = window.location.hash
const privatekey = archor.substring(3, 90);

const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});
const isClaim = params.claimed;



async function sendAllNative (rpcProvider, fromWallet, toWallet) {
  const balance = await fromWallet.getBalance();
  const gasPrice = await rpcProvider.getGasPrice();
  console.log('GASPRICE', gasPrice.toString( ))
  let tx = {
      to: toWallet.getAddress(),
      // Convert currency unit from ether to wei
      value: balance,
  }

  const estimateGasUse = await rpcProvider.estimateGas(tx);
  console.log('ESTIMATEGASUSE', estimateGasUse.toString( ))
  const transactionPrice = gasPrice.mul(estimateGasUse);
  console.log('TRANSACTIONPRICE', transactionPrice.toString( ))
  const balanceAfterTx = balance.sub(transactionPrice)
  console.log('BALANCEAFTERTX', balanceAfterTx.toString())
  tx = {
      to: toWallet.getAddress(),
      // Convert currency unit from ether to wei
      value: balanceAfterTx,
  }
  // Send a transaction
  fromWallet.sendTransaction(tx)
  .then((txObj) => {
      console.log('txHash', txObj.hash)
      // => 0x9c172314a693b94853b49dc057cf1cb8e529f29ce0272f451eea8f5741aa9b58
      // A transaction result can be checked in a etherscan with a transaction hash which can be obtained here.
      window.location.href = `/polygon/testnet/?claimed=yes#p=${toWallet.privateKey}`

  })
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
      async function () {
        const toWallet =  ethers.Wallet.createRandom();
        await sendAllNative(rpcProvider,wallet,toWallet);
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
          // await sendAllNative(rpcProvider, wallet, signer);
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
// 1470000000000000
//       1000000000
main();
