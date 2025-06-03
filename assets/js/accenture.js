var canvas = document.getElementById("myCanvas");
var context = canvas.getContext("2d");

var imageWidth = 1080;
var imageHeight = 1920;

var imageObj = new Image(imageWidth, imageHeight);

imageObj.onload = function () {
  context.drawImage(imageObj, 0, 0);
};

imageObj.src = "assets/images/accenture.png";

document.getElementById("downloadCard").addEventListener("click", function (e) {
  e.preventDefault();

  let text = document.getElementById("name").value.trim();

  if (!text) {
    alert("يرجى كتابة الاسم قبل إنشاء البطاقة.");
    return;
  }

  // Draw background and text
  context.clearRect(0, 0, imageWidth, imageHeight);
  context.drawImage(imageObj, 0, 0);
  context.textAlign = "center";
  context.font = "40pt GESSTwoLight";
  context.fillStyle = "#FFFFFF";
  let textWidth = imageWidth / 2;
  let textHeight = imageHeight - 650;
  context.fillText(text, textWidth, textHeight);

  // Get file name from current page
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
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    })
    .then((data) => {
      console.log("✅ Saved to SheetDB:", data);

      // Then trigger download
      setTimeout(() => {
        let cleanName = text.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, "_");
        let imageName = cleanName ? `6D_EidCard_${cleanName}.png` : "6D_EidCard.png";

        canvas.toBlob((blob) => {
          let link = document.createElement("a");
          link.download = imageName;
          link.href = URL.createObjectURL(blob);
          link.click();
        });
      }, 500);
    })
    .catch((err) => {
      console.error("❌ Error saving to SheetDB:", err);
      alert("حدث خطأ أثناء الحفظ، الرجاء المحاولة مرة أخرى.");
    });

  document.getElementById("name").value = "";
});
