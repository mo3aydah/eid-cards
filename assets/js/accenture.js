var canvas = document.getElementById("myCanvas");
var context = canvas.getContext("2d");

var imageWidth = 1080;
var imageHeight = 1920;

var imageObj = new Image(imageWidth, imageHeight);
imageObj.onload = function () {
  context.drawImage(imageObj, 0, 0);
};
imageObj.src = "assets/images/accenture.png";

function DownloadCanvasAsImage() {
  let nameInput = document.getElementById("name").value.trim();
  let cleanName = nameInput.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, "_");
  let imageName = cleanName ? `6D_EidCard_${cleanName}.png` : "6D_EidCard.png";

  canvas.toBlob(function (blob) {
    let url = URL.createObjectURL(blob);
    let link = document.createElement("a");
    link.setAttribute("download", imageName);
    link.setAttribute("href", url);
    link.click();
  });
}

document.getElementById("downloadCard").addEventListener("click", function (e) {
  e.preventDefault();

  let name = document.getElementById("name").value.trim();
  if (!name) return alert("يرجى كتابة الاسم");

  // Draw canvas
  context.clearRect(0, 0, imageWidth, imageHeight);
  context.drawImage(imageObj, 0, 0);
  context.textAlign = "center";
  context.font = "40pt GESSTwoLight";
  context.fillStyle = "#FFFFFF";
  context.fillText(name, imageWidth / 2, imageHeight - 650);

  // Get company name from file
  const page = window.location.pathname.split("/").pop();
  const company = page.replace(".html", "");
  const timestamp = new Date().toISOString();

  // 🔁 Send to SheetDB
  fetch("https://sheetdb.io/api/v1/4614gvgykfvrc", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: [{ name: name, company: company, time: timestamp }],
    }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to save to SheetDB");
      return res.json();
    })
    .then((data) => {
      console.log("✅ Logged to SheetDB:", data);
      DownloadCanvasAsImage();
    })
    .catch((err) => {
      console.error("❌ SheetDB Error:", err);
      alert("حدث خطأ أثناء حفظ الاسم، يرجى المحاولة لاحقاً");
    });

  document.getElementById("name").value = "";
});
