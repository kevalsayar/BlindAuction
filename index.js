import blindAbi from "./contractabi/blindabi.json" assert { type: "json" };
const provider = new ethers.providers.Web3Provider(window.ethereum);

const shortenString = (input) => {
  const start = input.substring(0, 5),
    end = input.substring(input.length - 4),
    newString = start + "..." + end;
  return newString;
};

const transact = () => {
  const signer = provider.getSigner();
  const MyContract = new ethers.Contract(
    "0x547AE3374aa31218976BdD624305905269FC5962",
    blindAbi,
    signer
  );
  const bidValue = document.getElementById("bidValue").value.toString();
  const secretKey = document.getElementById("secretKey").value;
  MyContract.blind_a_bid(bidValue, secretKey).then(async function (result) {
    MyContract.bid(result, { value: ethers.utils.parseEther(bidValue) }).then(
      function (result) {
        console.log(result);
      }
    );
  });
};

async function connectToMetamask() {
  try {
    document.getElementById("connectToMetamask").disabled = true;
    await provider.send("eth_requestAccounts");
    document.getElementById("connectToMetamask").style.display = "none";
    initializeData();
  } catch (error) {
    console.log(error);
    document.getElementById("connectToMetamask").disabled = false;
  }
}

async function initializeData() {
  await provider.listAccounts().then(async function (accounts) {
    if (accounts.length == 0) {
      document.getElementById("connectDiv").style.display = "flex";
    } else {
      const signer = provider.getSigner();
      const MyContract = new ethers.Contract(
        "0x547AE3374aa31218976BdD624305905269FC5962",
        blindAbi,
        signer
      );
      MyContract.on("AuctionEnded", function (highestBidder, highestBid) {
        document.getElementById("showHighestBidder").innerText =
          shortenString(highestBidder);
        document.getElementById("showHighestBid").innerText =
          ethers.utils.formatEther(highestBid) + " TBNB";
      });
      document.getElementById("connectToMetamask").style.display = "none";
      document.getElementById("accountAddress").innerText = shortenString(
        accounts[0]
      );
      document.getElementById("accountBalance").innerText =
        ethers.utils
          .formatEther(await provider.getBalance(accounts[0]))
          .substring(0, 7) + " TBNB";
      MyContract.biddingEnd().then(function (result) {
        var countDownDate = new Date(result * 1000).getTime();
        var x = setInterval(function () {
          var now = new Date().getTime();
          var distance = countDownDate - now;
          if (distance <= 0) {
            clearInterval(x);
            document.getElementById("timeleftforbidding").innerHTML =
              "Bidding Done!";
            MyContract.revealEnd().then(function (result) {
              document.getElementById("bidAndSecretKey").style.display = "none";
              document.getElementById("deposit").style.display = "none";
              document.getElementById("highestBidder").style.display = "block";
              document.getElementById("highestBid").style.display = "block";
              MyContract.highestBid().then(function (result) {
                if (result !== "0") {
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
              var countDownDate = new Date(result * 1000).getTime();
              var x = setInterval(function () {
                var now = new Date().getTime();
                var distance = countDownDate - now;
                if (distance < 0) {
                  clearInterval(x);
                  document.getElementById("timeleftforreveal").innerHTML =
                    "Reveal Done!";
                } else {
                  document.getElementById("revealDiv").style.display = "flex";
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
            document.getElementById("bidAndSecretKey").style.display = "flex";
            document.getElementById("deposit").style.display = "flex";
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
document.addEventListener("DOMContentLoaded", initializeData);
document
  .getElementById("connectToMetamask")
  .addEventListener("click", connectToMetamask);

document.getElementById("transact").addEventListener("click", transact);


