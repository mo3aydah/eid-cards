// Messages in both languages
const messages = {
  ar: {
    1: "نتمنى لكم شهر رمضان مليئاً بالرحمة والسلام والبركات.",
    2: "نسأل اللّٰه أن يثيبكم على جهودكم، وأن يرزق قلوبكم الطمأنينة في هذا الشهر الكريم."
  },
  en: {
    1: "Wishing you a Ramadan filled with mercy, peace, and blessings.",
    2: "May your efforts be rewarded, and may your heart find serenity this Ramadan."
  }
};

// Step titles and UI content
const uiContent = {
  ar: {
    step1: "تهنئة رمضانية لمن يعزّ عليك",
    step1Subtitle: "أنشئ بطاقة رمضانية مميزة وشاركها مع من تحب",
    step2: "اختر عبارتك",
    step3: "أضف اسمك",
    step4: "حمّل بطاقتك",
    namePlaceholder: "أدخل اسمك",
    back: "رجوع",
    next: "التالي",
    download: "حمل بطاقتك الآن",
    stepLabels: {
      step1: "اللغة",
      step2: "الرسالة",
      step3: "الاسم",
      step4: "المعاينة"
    }
  },
  en: {
    step1: "A Ramadan Greeting for Someone Special",
    step1Subtitle: "Create your personalized Ramadan card in just a few simple steps",
    step2: "Choose Your Message",
    step3: "Add Your Name",
    step4: "Download Your Card",
    namePlaceholder: "Enter your name",
    back: "Back",
    next: "Next",
    download: "Download Your Card",
    stepLabels: {
      step1: "Language",
      step2: "Message",
      step3: "Name",
      step4: "Preview"
    }
  }
};

// State
let selectedLanguage = null;
let selectedMessage = null;
let userName = null;

// Load fonts
let fontsLoaded = false;
const arabicMessageFont = new FontFace('GE_SS_Two_Light', 'url(assets/fonts/GE_SS_Two_Light.otf)');
const arabicNameFont = new FontFace('GE_SS_Two_Medium', 'url(assets/fonts/GE_SS_Two_Medium.otf)');
const gothamMediumFont = new FontFace('Gotham-Medium', 'url(assets/fonts/Gotham-Medium.otf)');
const gothamThinFont = new FontFace('Gotham-Thin', 'url(assets/fonts/Gotham-Thin.otf)');

Promise.all([arabicMessageFont.load(), arabicNameFont.load(), gothamMediumFont.load(), gothamThinFont.load()]).then(fonts => {
  fonts.forEach(font => document.fonts.add(font));
  fontsLoaded = true;
}).catch(err => {
  console.warn('Font loading error:', err);
  fontsLoaded = true; // Continue even if fonts fail to load
});

// Canvas setup
var canvas = document.getElementById("myCanvas");
var context = canvas.getContext("2d");
var imageWidth = 1080;
var imageHeight = 1920;
var imageObj = new Image(imageWidth, imageHeight);

// Loading state
let isLoading = true;

imageObj.onload = function () {
  isLoading = false;
  document.getElementById('canvasLoading').style.display = 'none';
  document.getElementById('myCanvas').classList.remove('loading');
  // Draw initial card (just the image)
  drawCard();
};

imageObj.onerror = function() {
  isLoading = false;
  document.getElementById('canvasLoading').style.display = 'none';
  console.error('Failed to load card image');
};

imageObj.src = "assets/images/Almanea - Ramadan post.png";

// Show loading initially
document.getElementById('myCanvas').classList.add('loading');

// Step management
function showStep(stepNumber) {
  // Update step visibility
  document.querySelectorAll('.step').forEach(step => {
    step.classList.remove('active');
  });
  
  // Show/hide step indicator based on step number
  const stepIndicator = document.getElementById('stepIndicator');
  if (stepNumber === 1) {
    if (stepIndicator) stepIndicator.classList.remove('visible');
  } else {
    if (stepIndicator) stepIndicator.classList.add('visible');
  }
  
  // Show the target step immediately
  const targetStep = document.getElementById(`step${stepNumber}`);
  if (targetStep) {
    targetStep.classList.add('active');
    
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    console.error(`Step ${stepNumber} not found`);
  }
  
  // Update step indicators (only show steps 2, 3, 4 in indicator)
  if (stepNumber > 1) {
    document.querySelectorAll('.step-item').forEach((item) => {
      const itemStep = parseInt(item.getAttribute('data-step'));
      item.classList.remove('active', 'completed');
      
      if (itemStep < stepNumber) {
        item.classList.add('completed');
      } else if (itemStep === stepNumber) {
        item.classList.add('active');
      }
    });
  }
}

// Initialize step indicators
showStep(1);

// Update UI based on language
function updateUIForLanguage(lang) {
  if (!lang) return;
  
  const content = uiContent[lang];
  
  // Update step titles
  const step1Title = document.getElementById('step1Title');
  const step1Subtitle = document.getElementById('step1Subtitle');
  if (step1Title) step1Title.textContent = content.step1;
  if (step1Subtitle) step1Subtitle.textContent = content.step1Subtitle;
  document.getElementById('step2Title').textContent = content.step2;
  document.getElementById('step3Title').textContent = content.step3;
  document.getElementById('step4Title').textContent = content.step4;
  
  // Update placeholders
  document.getElementById('name').placeholder = content.namePlaceholder;
  
  // Update navigation buttons
  document.getElementById('backToStep1').textContent = content.back;
  document.getElementById('nextToStep3').textContent = content.next;
  document.getElementById('backToStep2').textContent = content.back;
  document.getElementById('continueToPreview').textContent = content.next;
  document.getElementById('backToStep3').textContent = content.back;
  document.getElementById('downloadCard').textContent = content.download;
  
  // Update step indicator labels (no step1 in indicator)
  document.getElementById('stepLabel2').textContent = content.stepLabels.step2;
  document.getElementById('stepLabel3').textContent = content.stepLabels.step3;
  document.getElementById('stepLabel4').textContent = content.stepLabels.step4;
  
  // Update page direction
  if (lang === 'ar') {
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';
  } else {
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'en';
  }
}

// Step 1: Language Selection
function setupLanguageButtons() {
  const languageButtons = document.querySelectorAll('.language-btn');
  
  if (languageButtons.length === 0) {
    console.error('Language buttons not found');
    return;
  }
  
  languageButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      document.querySelectorAll('.language-btn').forEach(b => b.classList.remove('selected'));
      this.classList.add('selected');
      selectedLanguage = this.getAttribute('data-lang');
      
      // Update all UI content
      updateUIForLanguage(selectedLanguage);
      
      // Update canvas preview
      drawCard();
      
      // Advance to Step 2 immediately
      showStep(2);
      updateStep2();
    });
  });
}

// Language buttons setup is now handled in initializeEventListeners()

// Update Step 2 based on language
function updateStep2() {
  const lang = selectedLanguage;
  if (!lang) return;
  
  const step2Title = document.getElementById('step2Title');
  const message1Btn = document.getElementById('message1');
  const message2Btn = document.getElementById('message2');
  const nextBtn = document.getElementById('nextToStep3');
  
  if (!step2Title || !message1Btn || !message2Btn || !nextBtn) {
    console.warn('Step 2 elements not found');
    return;
  }
  
  step2Title.textContent = uiContent[lang].step2;
  message1Btn.textContent = messages[lang][1];
  message2Btn.textContent = messages[lang][2];
  
  // Update button direction
  if (lang === 'ar') {
    message1Btn.classList.remove('english');
    message2Btn.classList.remove('english');
    message1Btn.style.textAlign = 'right';
    message1Btn.style.direction = 'rtl';
    message2Btn.style.textAlign = 'right';
    message2Btn.style.direction = 'rtl';
  } else {
    message1Btn.classList.add('english');
    message2Btn.classList.add('english');
    message1Btn.style.textAlign = 'left';
    message1Btn.style.direction = 'ltr';
    message2Btn.style.textAlign = 'left';
    message2Btn.style.direction = 'ltr';
  }
  
  // Reset selection and disable Next button
  message1Btn.classList.remove('selected');
  message2Btn.classList.remove('selected');
  nextBtn.disabled = true;
  
  // Restore selection if going back
  if (selectedMessage) {
    const selectedBtn = document.getElementById(`message${selectedMessage}`);
    if (selectedBtn) {
      selectedBtn.classList.add('selected');
      nextBtn.disabled = false;
    }
  }
}

// Step 2: Message Selection
function setupMessageButtons() {
  const messageButtons = document.querySelectorAll('.message-btn');
  if (messageButtons.length === 0) return;
  
  messageButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.message-btn').forEach(b => b.classList.remove('selected'));
      this.classList.add('selected');
      selectedMessage = this.getAttribute('data-message');
      
      // Enable Next button
      const nextBtn = document.getElementById('nextToStep3');
      if (nextBtn) nextBtn.disabled = false;
      
      // Update canvas preview
      drawCard();
    });
  });
}

// Step 2: Next button
function setupStep2NextButton() {
  const nextBtn = document.getElementById('nextToStep3');
  if (!nextBtn) return;
  
  nextBtn.addEventListener('click', function() {
    if (!selectedMessage) {
      const lang = selectedLanguage || 'en';
      const alertMsg = lang === 'ar' ? 'يرجى اختيار رسالة' : 'Please select a message';
      alert(alertMsg);
      return;
    }
    showStep(3);
    updateStep3();
  });
}

// Step 2: Back button
function setupStep2BackButton() {
  const backBtn = document.getElementById('backToStep1');
  if (!backBtn) return;
  
  backBtn.addEventListener('click', function() {
    selectedMessage = null;
    const nextBtn = document.getElementById('nextToStep3');
    if (nextBtn) nextBtn.disabled = true;
    showStep(1);
    drawCard();
  });
}

// Input validation
function validateName(name) {
  const trimmed = name.trim();
  const feedbackEl = document.getElementById('nameFeedback');
  const inputEl = document.getElementById('name');
  
  if (!trimmed) {
    feedbackEl.textContent = '';
    inputEl.classList.remove('invalid');
    return false;
  }
  
  if (trimmed.length < 2) {
    const lang = selectedLanguage || 'en';
    const msg = lang === 'ar' ? 'الاسم يجب أن يكون على الأقل حرفين' : 'Name must be at least 2 characters';
    feedbackEl.textContent = msg;
    feedbackEl.classList.remove('success');
    inputEl.classList.add('invalid');
    return false;
  }
  
  if (trimmed.length > 50) {
    const lang = selectedLanguage || 'en';
    const msg = lang === 'ar' ? 'الاسم طويل جداً (الحد الأقصى 50 حرف)' : 'Name is too long (max 50 characters)';
    feedbackEl.textContent = msg;
    feedbackEl.classList.remove('success');
    inputEl.classList.add('invalid');
    return false;
  }
  
  // Valid name
  feedbackEl.textContent = '';
  feedbackEl.classList.add('success');
  inputEl.classList.remove('invalid');
  return true;
}

// Update Step 3 based on language
function updateStep3() {
  const lang = selectedLanguage;
  if (!lang) return;
  
  const step3Title = document.getElementById('step3Title');
  const nameInput = document.getElementById('name');
  const feedbackEl = document.getElementById('nameFeedback');
  
  if (!step3Title || !nameInput) {
    console.warn('Step 3 elements not found');
    return;
  }
  
  step3Title.textContent = uiContent[lang].step3;
  nameInput.placeholder = uiContent[lang].namePlaceholder;
  
  // Set input direction
  if (lang === 'ar') {
    nameInput.style.direction = 'rtl';
    nameInput.style.textAlign = 'right';
  } else {
    nameInput.style.direction = 'ltr';
    nameInput.style.textAlign = 'left';
  }
  
  // Remove existing listeners by cloning the element
  const newInput = nameInput.cloneNode(true);
  nameInput.parentNode.replaceChild(newInput, nameInput);
  
  newInput.addEventListener('input', function() {
    const value = this.value;
    userName = value.trim();
    
    // Validate
    validateName(value);
    
    // Update preview
    if (userName && validateName(value)) {
      drawCard();
    } else {
      drawCard(); // Still draw to show message if selected
    }
  });
  
  // Focus on input
  setTimeout(() => newInput.focus(), 100);
}

// Step 3: Continue to Preview
function setupStep3ContinueButton() {
  const continueBtn = document.getElementById('continueToPreview');
  if (!continueBtn) return;
  
  continueBtn.addEventListener('click', function() {
    const nameInput = document.getElementById('name');
    if (!nameInput) return;
    
    const nameValue = nameInput.value;
    
    if (!validateName(nameValue)) {
      nameInput.focus();
      nameInput.classList.add('invalid');
      return;
    }
    
    userName = nameValue.trim();
    
    // Update step 4 title
    const lang = selectedLanguage;
    const step4Title = document.getElementById('step4Title');
    if (lang && step4Title) {
      step4Title.textContent = uiContent[lang].step4;
    }
    
    showStep(4);
    drawCard();
  });
}

// Step 3: Back button
function setupStep3BackButton() {
  const backBtn = document.getElementById('backToStep2');
  if (!backBtn) return;
  
  backBtn.addEventListener('click', function() {
    userName = null;
    const nameInput = document.getElementById('name');
    if (nameInput) nameInput.value = '';
    showStep(2);
    drawCard();
  });
}

// Draw card with name and message
function drawCard() {
  if (!imageObj.complete || isLoading) {
    if (!isLoading) {
      imageObj.onload = drawCard;
    }
    return;
  }
  
  // Wait a bit for fonts to load if not already loaded
  if (!fontsLoaded) {
    setTimeout(drawCard, 100);
    return;
  }
  
  // Hide loading indicator
  document.getElementById('canvasLoading').style.display = 'none';
  document.getElementById('myCanvas').classList.remove('loading');
  
  context.clearRect(0, 0, imageWidth, imageHeight);
  context.drawImage(imageObj, 0, 0);
  
  // Draw message if selected
  if (selectedMessage && selectedLanguage) {
    const message = messages[selectedLanguage][selectedMessage];
    const isArabic = selectedLanguage === 'ar';
    
    // Set font based on language
    const messageFont = isArabic ? "36pt GE_SS_Two_Light" : "36pt Gotham-Thin";
    
    context.textAlign = "center";
    context.fillStyle = "#FFFFFF";
    
    // Draw message
    context.font = messageFont;
    const messageY = imageHeight - 950;
    const maxWidth = imageWidth - 200;
    
    // Draw message with word wrap
    drawText(context, message, imageWidth / 2, messageY, maxWidth, 36, isArabic);
  }
  
  // Draw name if entered
  if (userName && selectedLanguage) {
    const isArabic = selectedLanguage === 'ar';
    const nameFont = isArabic ? "40pt GE_SS_Two_Medium" : "40pt Gotham-Medium";
    
    context.textAlign = "center";
    context.fillStyle = "#FFFFFF";
    context.font = nameFont;
    context.fillText(userName, imageWidth / 2, imageHeight - 750);
  }
}

// Helper function to draw text with word wrap
function drawText(ctx, text, x, y, maxWidth, fontSize, isArabic) {
  // For Arabic, split by spaces and reverse for proper RTL handling
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0];
  
  // Use GE_SS_Two_Light for Arabic messages, Gotham-Thin for English messages
  ctx.font = `${fontSize}pt ${isArabic ? 'GE_SS_Two_Light' : 'Gotham-Thin'}`;
  
  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine + (isArabic ? ' ' : ' ') + word;
    const metrics = ctx.measureText(testLine);
    const width = metrics.width;
    
    if (width < maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  
  const lineHeight = fontSize * 1.5;
  lines.forEach((line, index) => {
    ctx.fillText(line, x, y + (index * lineHeight));
  });
}

// Show success message
function showSuccessMessage(message) {
  const successDiv = document.createElement('div');
  successDiv.className = 'success-message';
  successDiv.textContent = message;
  document.body.appendChild(successDiv);
  
  setTimeout(() => {
    successDiv.style.opacity = '0';
    successDiv.style.transform = 'translateX(-50%) translateY(-20px)';
    setTimeout(() => successDiv.remove(), 300);
  }, 3000);
}

// Download function
function DownloadCanvasAsImage() {
  let cleanName = userName ? userName.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, "_") : "";
  let imageName = cleanName ? `6D_EidCard_${cleanName}.png` : "6D_EidCard.png";

  canvas.toBlob(function (blob) {
    let url = URL.createObjectURL(blob);
    let link = document.createElement("a");
    link.setAttribute("download", imageName);
    link.setAttribute("href", url);
    link.click();
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
    // Show success message
    const lang = selectedLanguage || 'en';
    const successMsg = lang === 'ar' 
      ? 'تم تحميل البطاقة بنجاح!'
      : 'Card downloaded successfully!';
    showSuccessMessage(successMsg);
  });
}

// Step 4: Back button
function setupStep4BackButton() {
  const backBtn = document.getElementById('backToStep3');
  if (!backBtn) return;
  
  backBtn.addEventListener('click', function() {
    showStep(3);
    drawCard();
  });
}

// Step 4: Download Card
function setupDownloadButton() {
  const downloadBtn = document.getElementById("downloadCard");
  if (!downloadBtn) return;
  
  downloadBtn.addEventListener("click", function (e) {
    e.preventDefault();

    if (!userName || !selectedMessage) {
      const lang = selectedLanguage || 'en';
      const alertMsg = lang === 'ar' ? 'يرجى إكمال جميع الخطوات' : 'Please complete all steps';
      alert(alertMsg);
      return;
    }

    // Get company name from file
    const page = window.location.pathname.split("/").pop();
    const company = page.replace(".html", "");
    const timestamp = new Date().toISOString();

    // 🔁 Send to SheetDB
    fetch("https://sheetdb.io/api/v1/4614gvgykfvrc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [{ 
          name: userName, 
          company: company, 
          message: selectedMessage,
          language: selectedLanguage,
          time: timestamp 
        }],
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
        // Still allow download even if SheetDB fails
        DownloadCanvasAsImage();
        
        // Show warning but don't block user
        const lang = selectedLanguage || 'en';
        const warningMsg = lang === 'ar' 
          ? 'تم تحميل البطاقة، لكن لم يتم حفظ البيانات'
          : 'Card downloaded, but data was not saved';
        setTimeout(() => showSuccessMessage(warningMsg), 500);
      });
  });
}

// Initialize all event listeners when DOM is ready
function initializeEventListeners() {
  setupLanguageButtons();
  setupMessageButtons();
  setupStep2NextButton();
  setupStep2BackButton();
  setupStep3ContinueButton();
  setupStep3BackButton();
  setupStep4BackButton();
  setupDownloadButton();
}

// Setup event listeners when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeEventListeners);
} else {
  initializeEventListeners();
}
