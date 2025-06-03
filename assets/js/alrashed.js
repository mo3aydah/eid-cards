var canvas = document.getElementById("myCanvas");
var context = canvas.getContext("2d");

var imageWidth = 1080;
var imageHeight = 1920;

var imageObj = new Image(imageWidth, imageHeight);
imageObj.onload = function () {
  context.drawImage(imageObj, 0, 0);
};

imageObj.src = "assets/images/alrashed.png";

function DownloadCanvasAsImage() {
  let nameInput = document.getElementById("name").value.trim();
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

document.getElementById("downloadCard").addEventListener("click", function (e) {
  e.preventDefault();

  var text = document.getElementById("name").value.trim();
  if (!text) {
    alert("يرجى كتابة الاسم قبل إنشاء البطاقة.");
    return;
  }

  // Draw text on canvas
  context.clearRect(0, 0, imageWidth, imageHeight);
  context.drawImage(imageObj, 0, 0);

  context.textAlign = "center";
  context.font = "40pt GESSTwoLight";
  context.fillStyle = "black";

  var textX = imageWidth / 2;
  var textY = imageHeight - 650;
  context.fillText(text, textX, textY);

  // Extract company and timestamp
  const page = window.location.pathname.split("/").pop();
  const company = page.replace(".html", "");
  const timestamp = new Date().toISOString();

  // Send to SheetDB
  fetch("https://sheetdb.io/api/v1/4614gvgykfvrc", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: [{ name: text, company: company, time: timestamp }],
    }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to save to SheetDB");
      return res.json();
    })
    .then((data) => {
      console.log("✅ Name saved to SheetDB", data);
      DownloadCanvasAsImage();
    })
    .catch((err) => {
      console.error("❌ Error sending to SheetDB:", err);
      alert("حدث خطأ أثناء حفظ الاسم. حاول مجددًا لاحقًا.");
    });

  document.getElementById("name").value = "";
});
