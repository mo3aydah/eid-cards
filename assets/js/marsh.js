var canvas = document.getElementById("myCanvas");
var context = canvas.getContext("2d");

var imageWidth = 1080;
var imageHeight = 1920;

var imageObj = new Image(imageWidth, imageHeight);
imageObj.onload = function () {
  context.drawImage(imageObj, 0, 0);
};
imageObj.src = "assets/images/marshh.png";

function DownloadCanvasAsImage(name) {
  let cleanName = name.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, "_");

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

  var name = document.getElementById("name").value.trim();
  if (name === "") {
    alert("يرجى كتابة الاسم قبل إنشاء البطاقة.");
    return;
  }

  // Draw the canvas
  context.clearRect(0, 0, imageWidth, imageHeight);
  context.drawImage(imageObj, 0, 0);

  context.textAlign = "center";
  context.font = "40pt GESSTwoLight";
  context.fillStyle = "#FFFFFF";

  var textWidth = imageWidth / 2;
  var textHeight = imageHeight - 700;
  context.fillText(name, textWidth, textHeight);

  // Get company from filename
  const page = window.location.pathname.split("/").pop();
  const company = page.replace(".html", "");
  const timestamp = new Date().toISOString();

  // Send to SheetDB first, then download
  fetch("https://sheetdb.io/api/v1/4614gvgykfvrc", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: [{ name: name, company: company, time: timestamp }],
    }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to log to SheetDB");
      return res.json();
    })
    .then(() => {
      console.log("✅ Logged successfully");
      DownloadCanvasAsImage(name);
    })
    .catch((err) => {
      console.error("❌ Error logging:", err);
      alert("حدث خطأ أثناء حفظ البيانات، حاول مرة أخرى.");
    });

  document.getElementById("name").value = "";
});
