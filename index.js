import blindAbi from "./contractabi/blindabi.json" assert { type: "json" };
const web3 = new Web3(window.ethereum);
var MyContract = new web3.eth.Contract(
  blindAbi,
  "0x73949b013deD3568cf33ff359C3cEbcD260EBA3e"
);

function sayHi() {
  MyContract.methods
    .beneficiary()
    .call()
    .then(function (result) {
      document.getElementById("beneficiary").innerText = result;
    });
  MyContract.methods
    .highestBidder()
    .call()
    .then(function (result) {
      if (result !== "0x0000000000000000000000000000000000000000") {
        document.getElementById("highestBidder").innerText = result;
      }
    });
  MyContract.methods
    .highestBid()
    .call()
    .then(function (result) {
      if (result !== "0") {
        document.getElementById("highestBid").innerText = result;
      }
    });
}

document.addEventListener("DOMContentLoaded", sayHi);
