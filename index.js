import blindAbi from "./contractabi/blindabi.json" assert { type: "json" };
const web3 = new Web3(window.ethereum);
var MyContract = new web3.eth.Contract(
  blindAbi,
  "0x0d68E2d9B35dca95d1F30c15BdB65643Ce34721e"
);

function sayHi() {
  MyContract.methods
    .beneficiary()
    .call()
    .then(function (result) {
      const addressStart = result.substring(0, 5),
        addressEnd = result.substring(result.length - 4),
        newAddress = addressStart + "..." + addressEnd;
      document.getElementById("beneficiary").innerText = newAddress;
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
  MyContract.methods
    .biddingEnd()
    .call()
    .then(function (result) {
      var countDownDate = new Date(result * 1000).getTime();
      var x = setInterval(function () {
        var now = new Date().getTime();
        var distance = countDownDate - now;
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
        document.getElementById("timeleft").innerHTML =
          days + "d " + hours + "h " + minutes + "m " + seconds + "s ";
        if (distance < 0) {
          clearInterval(x);
          document.getElementById("demo").innerHTML = "Auction Completed!";
        }
      }, 1000);
      console.log(new Date(result * 1000));
    });
}

document.addEventListener("DOMContentLoaded", sayHi);
