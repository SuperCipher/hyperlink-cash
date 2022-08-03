import {
  ethers
} from "./../ethers-5.2.esm.min.js";
console.log('WINDOW.LOCATION.HASH', window.location.hash)
const archor = window.location.hash
const privatekey = archor.substring(3, 90);
console.log("privatekey", privatekey);

async function main() {

  // Use the mainnet
  // const network = "maticmum";
  // const provider = ethers.getDefaultProvider(network, {
  //   infura: "d64d8c2ddfaf4a68b1a8f59efb34c531",
  // });

  // HACK infuraprovider not work
  const provider = new ethers.providers.JsonRpcProvider("https://polygon-mumbai.infura.io/v3/d64d8c2ddfaf4a68b1a8f59efb34c531")
  await provider.getBalance("0x7Da81FA63Ee343De9ca33ab7A16be3D022549828").then((balance) => {
    console.log('balance', balance)
  })
  const balance = await provider.getBalance("0x7Da81FA63Ee343De9ca33ab7A16be3D022549828")
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
  let x = new BigNumber(ethers.utils.formatEther(balance));


      // console.log('balance USD', balance.mul(rate.ETH.USD)  )
  let result = x.multipliedBy(rateUSD)
  console.log('balance USD', result.toFormat(4))

}

main();
