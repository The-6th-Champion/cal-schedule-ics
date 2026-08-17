(function () {
  if (window.location.href.includes("berkeley.collegescheduler.com")) {
    alert("Extension loaded on the correct website!");
    console.log("Correct website detected:", window.location.href);
  } else {
    console.log("Not on the Berkeley scheduler website:", window.location.href);
  }

  // Optional: keep this if you want to inspect the page text later
  // const pageText = document.body.innerText;
  // const classTimes = pageText.match(/\d{1,2}:\d{2}\s?[AP]M/g);
  // console.log("Found times:", classTimes);
})();