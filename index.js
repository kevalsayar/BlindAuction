import blindAbi from "./contractabi/blindabi.json" assert { type: "json" };
document.addEventListener("DOMContentLoaded", initializeData);
const connectToMetaMask = document.getElementById("connectToMetamask");
connectToMetaMask.addEventListener("click", connectToMetamask);
document.getElementById("transact").addEventListener("click", transact);
document.getElementById("bidReveal").addEventListener("click", revealBid);
const auctionDetails = document.getElementById("auctionDetails");
const snackBar = document.getElementById("snackbar");
const provider = new ethers.providers.Web3Provider(window.ethereum);

const shortenString = (input) => {
  const start = input.substring(0, 5),
    end = input.substring(input.length - 4),
    newString = start + "..." + end;
  return newString;
};

const snackBarGen = (message) => {
  snackBar.innerText = message;
  snackBar.className = "show";
  setTimeout(function () {
    snackBar.className = snackBar.className.replace("show", "");
  }, 2500);
};

function revealBid() {
  const signer = provider.getSigner();
  const MyContract = new ethers.Contract(
    "0xC31fFCBD8E600969A03E7CAF6d539cBd2499fa38",
    blindAbi,
    signer
  );
  const bidRevealValue = document.getElementById("bidRevealValue").value;
  const bidRevealSecretKey =
    document.getElementById("bidRevealSecretKey").value;
  MyContract.reveal([bidRevealValue], [bidRevealSecretKey]).then(
    async function (result) {
      if ((await result.wait()).status === 1) {
        snackBarGen("Bid Revealed Successfully!");
      } else {
        snackBarGen("Please try again!");
      }
    }
  );
}

function transact() {
  const signer = provider.getSigner();
  const MyContract = new ethers.Contract(
    "0xC31fFCBD8E600969A03E7CAF6d539cBd2499fa38",
    blindAbi,
    signer
  );
  const bidValue = document.getElementById("bidValue").value.toString();
  const secretKey = document.getElementById("secretKey").value;
  MyContract.blind_a_bid(bidValue, secretKey).then(async function (result) {
    MyContract.bid(result, { value: bidValue }).then(async function (result) {
      if ((await result.wait()).status === 1) {
        document.getElementById("bidAndSecretKey").style.display = "none";
        snackBarGen("Bid Placed Successfully!");
      } else {
        snackBarGen("Please try again!");
      }
    });
  });
}

async function connectToMetamask() {
  try {
    connectToMetaMask.disabled = true;
    await provider.send("eth_requestAccounts");
    initializeData();
  } catch (error) {
    console.log(error);
    connectToMetaMask.disabled = false;
  }
}

async function initializeData() {
  await provider.listAccounts().then(async function (accounts) {
    if (accounts.length == 0) {
      auctionDetails.style.display = "none";
      document.getElementById("connectDiv").style.display = "flex";
      snackBarGen("Connect to MetaMask to access the auction!");
    } else {
      connectToMetaMask.style.display = "none";
      auctionDetails.style.display = "flex";
      const signer = provider.getSigner();
      const MyContract = new ethers.Contract(
        "0xC31fFCBD8E600969A03E7CAF6d539cBd2499fa38",
        blindAbi,
        signer
      );
      MyContract.on("AuctionEnded", function (highestBidder, highestBid) {
        document.getElementById("showHighestBidder").innerText =
          shortenString(highestBidder);
        document.getElementById("showHighestBid").innerText =
          ethers.utils.formatEther(highestBid) + " TBNB";
      });
      document.getElementById("accountAddress").innerText = shortenString(
        accounts[0]
      );
      document.getElementById("accountBalance").innerText =
        ethers.utils
          .formatEther(await provider.getBalance(accounts[0]))
          .substring(0, 7) + " TBNB";
      MyContract.biddingEnd().then(function (result) {
        var countDownDate = new Date(result * 1000).getTime();
        MyContract.checkIfaddressisabidder(accounts[0]).then(function (result) {
          if (result) {
            document.getElementById("bidAndSecretKey").style.display = "none";
          } else {
            document.getElementById("bidAndSecretKey").style.display = "flex";
          }
        });
        var x = setInterval(function () {
          var now = new Date().getTime();
          var distance = countDownDate - now;
          if (distance <= 0) {
            clearInterval(x);
            document.getElementById("timeleftforbidding").innerHTML =
              "Bidding Done!";
            document.getElementById("revealDiv").style.display = "flex";
            MyContract.highestBid().then(function (result) {
              if (ethers.utils.formatEther(result) !== "0.0") {
                document.getElementById("showHighestBid").innerText =
                  ethers.utils.formatEther(result) + " TBNB";
              }
            });
            MyContract.highestBidder().then(function (result) {
              if (result !== "0x0000000000000000000000000000000000000000") {
                document.getElementById("showHighestBidder").innerText =
                  shortenString(result);
              }
            });
            MyContract.revealEnd().then(function (result) {
              document.getElementById("bidAndSecretKey").style.display = "none";
              document.getElementById("highestBidder").style.display = "block";
              document.getElementById("highestBid").style.display = "block";
              var countDownDate = new Date(result * 1000).getTime();
              var x = setInterval(function () {
                var now = new Date().getTime();
                var distance = countDownDate - now;
                if (distance < 0) {
                  clearInterval(x);
                  document.getElementById("timeleftforreveal").innerHTML =
                    "Reveal Done!";
                  document.getElementById("revealDiv").style.display = "none";
                } else {
                  var days = Math.floor(distance / (1000 * 60 * 60 * 24));
                  var hours = Math.floor(
                    (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                  );
                  var minutes = Math.floor(
                    (distance % (1000 * 60 * 60)) / (1000 * 60)
                  );
                  var seconds = Math.floor((distance % (1000 * 60)) / 1000);
                  document.getElementById("timeleftforreveal").innerHTML =
                    days +
                    "d " +
                    hours +
                    "h " +
                    minutes +
                    "m " +
                    seconds +
                    "s ";
                }
              }, 1000);
            });
          } else {
            var days = Math.floor(distance / (1000 * 60 * 60 * 24));
            var hours = Math.floor(
              (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            );
            var minutes = Math.floor(
              (distance % (1000 * 60 * 60)) / (1000 * 60)
            );
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);
            document.getElementById("timeleftforbidding").innerHTML =
              days + "d " + hours + "h " + minutes + "m " + seconds + "s ";
          }
        }, 1000);
      });
    }
  });
}
