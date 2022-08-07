import {
  ethers
} from "./../../ethers-5.2.esm.min.js";
const archor = window.location.hash
const privatekey = archor.substring(3, 90);

const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});
const isClaim = params.claimed;

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
  const wallet = walletPrivateKey.connect(rpcProvider)
  const balance = await wallet.getBalance()
  const balanceMatic = new BigNumber(ethers.utils.formatEther(balance));
  if (isClaim == "no") {
    document.getElementById("claim-button").addEventListener("click",
      function() {
        const newWallet =  ethers.Wallet.createRandom();
        console.log('WALLET', wallet.privateKey)
        // const gasPrice = await rpcProvider.getGasPrice();
        const tx = {
            to: newWallet.address,
            // Convert currency unit from ether to wei
            value: ethers.utils.parseEther(`${balanceMatic}`)
            // gasPrice: gasPrice,
        }
        // Send a transaction
        wallet.sendTransaction(tx)
        .then((txObj) => {
            console.log('txHash', txObj.hash)
            // => 0x9c172314a693b94853b49dc057cf1cb8e529f29ce0272f451eea8f5741aa9b58
            // A transaction result can be checked in a etherscan with a transaction hash which can be obtained here.
            window.location.href = `/polygon/testnet/?claimed=yes#p=${newWallet.privateKey}`

        })
      }
    )
    document.getElementById("claim-button").classList.remove("hidden");

  } else {
      document.getElementById("claim-button").classList.remove("hidden");
      document.getElementById("claim-button").innerHTML = "Send"
      const walletProvider = new ethers.providers.Web3Provider(window.ethereum)
      // Prompt user for account connections
      await walletProvider.send("eth_requestAccounts", []);
      const signer = walletProvider.getSigner();
      document.getElementById("claim-button").addEventListener("click",
        function() {
          const tx = {
              to: signer.getAddress(),
              // Convert currency unit from ether to wei
              value: ethers.utils.parseEther(`${balanceMatic}`)
          }
          // Send a transaction
          wallet.sendTransaction(tx)
          .then((txObj) => {
              console.log('txHash', txObj.hash)
              // => 0x9c172314a693b94853b49dc057cf1cb8e529f29ce0272f451eea8f5741aa9b58
              // A transaction result can be checked in a etherscan with a transaction hash which can be obtained here.
          })
          // console.log("Account:", await signer.getAddress());
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
  const showBalanceMatic = balanceMatic.multipliedBy(rateUSD)
  document.getElementById("wallet-address").innerHTML = `${wallet.address}`
  document.getElementById("balance-matic").innerHTML = `${balanceMatic.toFormat(12)}`
  document.getElementById("balance-usd").innerHTML = `${showBalanceMatic.toFormat(2)}`

}

main();
