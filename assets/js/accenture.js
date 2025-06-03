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

  // Remove spaces and special characters, if needed
  let cleanName = nameInput.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, "_");

  // Set final file name
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

imageObj.src = "assets/images/accenture.png";

var downloadCardButton = document.getElementById("downloadCard");
downloadCardButton.addEventListener("click", function (e) {
  e.preventDefault();

  let text = document.getElementById("name").value.trim();

  if (!text) {
    alert("يرجى كتابة الاسم قبل إنشاء البطاقة.");
    return;
  }

  // clear canvas from text and draw image
  context.clearRect(0, 0, imageWidth, imageHeight);
  context.drawImage(imageObj, 0, 0);

  // custom font
  context.textAlign = "center";
  context.font = "40pt GESSTwoLight";

  // text color
  context.fillStyle = "#FFFFFF";

  // center and make text
  let textWidth = imageWidth / 2;
  let textHeight = imageHeight - 650;

  context.fillText(text, textWidth, textHeight);

  // 🟡 Get current page filename
  const page = window.location.pathname.split("/").pop();
  const company = page.replace(".html", "");

  // 🟡 Timestamp
  const timestamp = new Date().toISOString();

  // 🟢 Send to SheetDB with logging
  console.log("📤 Submitting to SheetDB:", {
    name: text,
    company: company,
    time: timestamp,
  });

  fetch("https://sheetdb.io/api/v1/4614gvgykfvrc", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: [{ name: text, company: company, time: timestamp }],
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("✅ SheetDB response:", data);
    })
    .catch((error) => {
      console.error("❌ SheetDB error:", error);
      alert("حدث خطأ أثناء حفظ البيانات. الرجاء المحاولة مرة أخرى.");
    });

  // clear the input field
  document.getElementById("name").value = "";

  // download the image
  DownloadCanvasAsImage();
});
