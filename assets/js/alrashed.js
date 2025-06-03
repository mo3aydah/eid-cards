var canvas = document.getElementById("myCanvas");
var context = canvas.getContext("2d");

var imageWidth = 1080;
var imageHeight = 1920;

var imageObj = new Image(imageWidth, imageHeight);

imageObj.onload = function () {
  context.drawImage(imageObj, 0, 0);
};

function DownloadCanvasAsImage() {
  let nameInput = document.getElementById("name").value.trim();

  // Clean name for filename
  let cleanName = nameInput.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, "_");

  let imageName = cleanName
    ? `6D_EidCard_${cleanName}.png`
    : "6D_EidCard.png";

  let downloadLink = document.createElement("a");
  downloadLink.setAttribute("download", imageName);

  canvas.toBlob(function (blob) {
    let url = URL.createObjectURL(blob);
    downloadLink.setAttribute("href", url);
    downloadLink.click();
  });
}

imageObj.src = "assets/images/alrashed.png";

var downloadCardButton = document.getElementById("downloadCard");
downloadCardButton.addEventListener("click", function (e) {
  e.preventDefault();

  var text = document.getElementById("name").value.trim();

  if (!text) {
    alert("يرجى كتابة الاسم قبل إنشاء البطاقة.");
    return;
  }

  // Draw canvas
  context.clearRect(0, 0, imageWidth, imageHeight);
  context.drawImage(imageObj, 0, 0);

  context.textAlign = "center";
  context.font = "40pt GESSTwoLight";
  context.fillStyle = "black";

  var textWidth = imageWidth / 2;
  var textHeight = imageHeight - 650;

  context.fillText(text, textWidth, textHeight);

  // Get current page filename and extract company
  const page = window.location.pathname.split("/").pop();
  const company = page.replace(".html", "");

  // Timestamp
  const timestamp = new Date().toISOString();

  // Send data to SheetDB
  fetch("https://sheetdb.io/api/v1/4614gvgykfvrc", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: [{ name: text, company: company, time: timestamp }],
    }),
  });

  document.getElementById("name").value = "";

  // Download image
  DownloadCanvasAsImage();
});
