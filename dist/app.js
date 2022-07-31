import { ethers } from "./ethers-5.2.esm.min.js";
console.log('WINDOW.LOCATION.HASH', window.location.hash)
const archor = window.location.hash
const privatekey = archor.substring(3, 90);
console.log("privatekey", privatekey);
