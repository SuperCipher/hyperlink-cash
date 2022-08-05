import {
  ethers
} from "./../../ethers-5.2.esm.min.js";
const archor = window.location.hash
const privatekey = archor.substring(3, 90);

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
  const provider = new ethers.providers.JsonRpcProvider("https://polygon-mumbai.infura.io/v3/d64d8c2ddfaf4a68b1a8f59efb34c531")
  const wallet = walletPrivateKey.connect(provider)


  const balance = await wallet.getBalance()
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
  document.getElementById("balance-matic").innerHTML = `${balanceMatic.toFormat(12)}`
  document.getElementById("balance-usd").innerHTML = `${showBalanceMatic.toFormat(2)}`


}

main();
