// Bilingual UI content (showing both languages)
const uiContent = {
  step1: "تهنئة عيد لمن يعزّ عليك<br>An Eid Greeting for Someone Special",
  step1Subtitle: "أنشئ بطاقة عيد مميزة وشاركها مع من تحب<br>Create your personalized Eid card in just a few simple steps",
  step3: "أضف اسمك / Add Your Name",
  step4: "حمّل بطاقتك / Download Your Card",
  back: "رجوع / Back",
  next: "التالي / Next",
  download: "حمل بطاقتك الآن / Download Your Card",
  start: "ابدأ / Start",
  stepLabels: {
    step3: "الاسم / Name",
    step4: "المعاينة / Preview"
  },
  nameLabels: {
    english: "الاسم بالإنجليزية / English Name",
    arabic: "الاسم بالعربية / Arabic Name"
  },
  placeholders: {
    english: "أدخل الاسم بالإنجليزية / Enter English name",
    arabic: "أدخل الاسم بالعربية / Enter Arabic name"
  }
};

// State
let userNameEnglish = null;
let userNameArabic = null;

// Auto-detect browser language for RTL/LTR direction
function detectLanguage() {
  const browserLang = navigator.language || navigator.userLanguage;
  if (browserLang.startsWith('ar')) {
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';
  } else {
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'en';
  }
}

// Initialize language detection
detectLanguage();

// Load fonts (use path relative to document so they load from any page)
function getFontUrl(path) {
  const base = window.location.pathname.replace(/\/[^/]*$/, '') || '';
  return (base ? base + '/' : '/') + path;
}
let fontsLoaded = false;
const arabicNameFont = new FontFace('HTMoshreqPro-Regular', 'url(' + getFontUrl('assets/fonts/HTMoshreqPro-Regular.otf') + ')');
const englishNameFont = new FontFace('ABCArizonaSerif-Regular', 'url(' + getFontUrl('assets/fonts/ABCArizonaSerif-Regular.otf') + ')');

Promise.all([arabicNameFont.load(), englishNameFont.load()]).then(fonts => {
  fonts.forEach(font => document.fonts.add(font));
  fontsLoaded = true;
  drawCard(); // Redraw so names use loaded fonts
}).catch(err => {
  console.warn('Font loading error:', err);
  fontsLoaded = true;
  drawCard();
});

// Canvas setup
var canvas = document.getElementById("myCanvas");
var context = canvas.getContext("2d");
var imageWidth = 3001;
var imageHeight = 4001;
var imageObj = new Image(imageWidth, imageHeight);

// Loading state
let isLoading = true;

imageObj.onload = function () {
  isLoading = false;
  const loadingEl = document.getElementById('canvasLoading');
  if (loadingEl) {
    loadingEl.style.display = 'none';
    loadingEl.setAttribute('aria-busy', 'false');
  }
  document.getElementById('myCanvas').classList.remove('loading');
  // Draw initial card (just the image)
  drawCard();
};

imageObj.onerror = function() {
  isLoading = false;
  const loadingEl = document.getElementById('canvasLoading');
  if (loadingEl) {
    loadingEl.style.display = 'none';
  }
  const canvasEl = document.getElementById('myCanvas');
  if (canvasEl) {
    canvasEl.classList.remove('loading');
  }
  // Show error message to user
  const errorMsg = document.createElement('div');
  errorMsg.className = 'alert alert-danger';
  errorMsg.textContent = 'فشل تحميل الصورة / Failed to load image';
  errorMsg.style.margin = '1rem';
  errorMsg.style.textAlign = 'center';
  const container = document.querySelector('.container');
  if (container) {
    container.insertBefore(errorMsg, container.firstChild);
  }
};

imageObj.src = "assets/images/refad.png";

// Show loading initially
const canvasEl = document.getElementById('myCanvas');
if (canvasEl) {
  canvasEl.classList.add('loading');
}

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
    if (stepIndicator) {
      stepIndicator.classList.add('visible');
      // For Refad: step 3 = indicator step 1, step 4 = indicator step 2
      const indicatorStep = stepNumber === 3 ? 1 : stepNumber === 4 ? 2 : 1;
      stepIndicator.setAttribute('aria-valuenow', String(indicatorStep));
    }
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
  
  // Update step indicators (only show steps 3 and 4 in indicator)
  if (stepNumber > 1) {
    document.querySelectorAll('.step-item').forEach((item) => {
      const itemStep = parseInt(item.getAttribute('data-step'));
      item.classList.remove('active', 'completed');
      item.removeAttribute('aria-current');
      if (itemStep < stepNumber) {
        item.classList.add('completed');
      } else if (itemStep === stepNumber) {
        item.classList.add('active');
        item.setAttribute('aria-current', 'step');
      }
    });
  }
}

// Initialize step indicators
showStep(1);

// Update UI with bilingual content
function updateUI() {
  // Update step titles
  const step1Title = document.getElementById('step1Title');
  const step1Subtitle = document.getElementById('step1Subtitle');
  if (step1Title) step1Title.innerHTML = uiContent.step1;
  if (step1Subtitle) step1Subtitle.innerHTML = uiContent.step1Subtitle;
  
  const step3Title = document.getElementById('step3Title');
  const step4Title = document.getElementById('step4Title');
  if (step3Title) step3Title.textContent = uiContent.step3;
  if (step4Title) step4Title.textContent = uiContent.step4;
  
  // Update name input labels
  const nameEnglishLabel = document.getElementById('nameEnglishLabel');
  const nameArabicLabel = document.getElementById('nameArabicLabel');
  if (nameEnglishLabel) nameEnglishLabel.textContent = uiContent.nameLabels.english;
  if (nameArabicLabel) nameArabicLabel.textContent = uiContent.nameLabels.arabic;
  
  // Update placeholders
  const nameEnglishInput = document.getElementById('nameEnglish');
  const nameArabicInput = document.getElementById('nameArabic');
  if (nameEnglishInput) nameEnglishInput.placeholder = uiContent.placeholders.english;
  if (nameArabicInput) nameArabicInput.placeholder = uiContent.placeholders.arabic;
  
  // Update navigation buttons
  const backToStep1 = document.getElementById('backToStep1');
  const continueToPreview = document.getElementById('continueToPreview');
  const backToStep3 = document.getElementById('backToStep3');
  const downloadCard = document.getElementById('downloadCard');
  const startButton = document.getElementById('startButton');
  if (backToStep1) backToStep1.textContent = uiContent.back;
  if (continueToPreview) continueToPreview.textContent = uiContent.next;
  if (backToStep3) backToStep3.textContent = uiContent.back;
  if (downloadCard) downloadCard.textContent = uiContent.download;
  if (startButton) startButton.textContent = uiContent.start;
  
  // Update step indicator labels (only step3 and step4)
  const label3 = document.getElementById('stepLabel3');
  const label4 = document.getElementById('stepLabel4');
  if (label3) label3.textContent = uiContent.stepLabels.step3;
  if (label4) label4.textContent = uiContent.stepLabels.step4;
  
  // Update canvas loading text
  const canvasLoadingText = document.getElementById('canvasLoadingText');
  if (canvasLoadingText) {
    canvasLoadingText.textContent = 'جاري تحميل المعاينة… / Loading preview…';
  }
}

// Step 1: Start button handler
function setupStartButton() {
  const startButton = document.getElementById('startButton');
  
  if (startButton) {
    startButton.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Advance directly to Step 3 (name entry)
      showStep(3);
      updateStep3();
    });
  }
}

// Input validation for individual name field
function validateNameField(name, feedbackId, inputId) {
  const trimmed = name.trim();
  const feedbackEl = document.getElementById(feedbackId);
  const inputEl = document.getElementById(inputId);
  
  if (!feedbackEl || !inputEl) return true; // Skip if elements don't exist
  
  if (!trimmed) {
    feedbackEl.textContent = '';
    feedbackEl.classList.remove('success');
    inputEl.classList.remove('invalid');
    return false;
  }
  
  if (trimmed.length < 2) {
    const msg = 'الاسم يجب أن يكون على الأقل حرفين / Name must be at least 2 characters';
    feedbackEl.textContent = msg;
    feedbackEl.classList.remove('success');
    inputEl.classList.add('invalid');
    return false;
  }
  
  if (trimmed.length > 50) {
    const msg = 'الاسم طويل جداً (الحد الأقصى 50 حرف) / Name is too long (max 50 characters)';
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

function updateNameCounter(len, counterId) {
  const el = document.getElementById(counterId);
  if (el) el.textContent = len + '/50';
}

// Update Step 3
function updateStep3() {
  const step3Title = document.getElementById('step3Title');
  const nameEnglishInput = document.getElementById('nameEnglish');
  const nameArabicInput = document.getElementById('nameArabic');
  
  if (!step3Title) {
    console.warn('Step 3 elements not found');
    return;
  }
  
  step3Title.textContent = uiContent.step3;
  
  // Setup English name input
  if (nameEnglishInput) {
    // Remove existing listeners by cloning
    const newEnglishInput = nameEnglishInput.cloneNode(true);
    // Ensure left alignment for English input
    newEnglishInput.style.direction = 'ltr';
    newEnglishInput.style.textAlign = 'left';
    nameEnglishInput.parentNode.replaceChild(newEnglishInput, nameEnglishInput);
    
    newEnglishInput.addEventListener('input', function() {
      const value = this.value;
      userNameEnglish = value.trim();
      updateNameCounter(value.length, 'nameEnglishCounter');
      
      // Clear "at least one name" error when user starts typing
      clearAtLeastOneNameError();
      
      // Validate the field if it has content
      if (value.trim()) {
        validateNameField(value, 'nameEnglishFeedback', 'nameEnglish');
      } else {
        // Clear feedback if empty
        const feedback = document.getElementById('nameEnglishFeedback');
        if (feedback) {
          feedback.textContent = '';
          feedback.classList.remove('success');
        }
        newEnglishInput.classList.remove('invalid');
      }
      
      // Update Next button state
      updateNextButtonState();
      drawCard();
    });
    
    updateNameCounter((newEnglishInput.value || '').length, 'nameEnglishCounter');
  }
  
  // Setup Arabic name input
  if (nameArabicInput) {
    // Remove existing listeners by cloning
    const newArabicInput = nameArabicInput.cloneNode(true);
    // Ensure right alignment for Arabic input
    newArabicInput.style.direction = 'rtl';
    newArabicInput.style.textAlign = 'right';
    nameArabicInput.parentNode.replaceChild(newArabicInput, nameArabicInput);
    
    newArabicInput.addEventListener('input', function() {
      const value = this.value;
      userNameArabic = value.trim();
      updateNameCounter(value.length, 'nameArabicCounter');
      
      // Clear "at least one name" error when user starts typing
      clearAtLeastOneNameError();
      
      // Validate the field if it has content
      if (value.trim()) {
        validateNameField(value, 'nameArabicFeedback', 'nameArabic');
      } else {
        // Clear feedback if empty
        const feedback = document.getElementById('nameArabicFeedback');
        if (feedback) {
          feedback.textContent = '';
          feedback.classList.remove('success');
        }
        newArabicInput.classList.remove('invalid');
      }
      
      // Update Next button state
      updateNextButtonState();
      drawCard();
    });
    
    updateNameCounter((newArabicInput.value || '').length, 'nameArabicCounter');
  }
  
  // Update Next button state initially
  updateNextButtonState();
  
  // Focus on first input
  setTimeout(() => {
    const englishInput = document.getElementById('nameEnglish');
    if (englishInput) {
      englishInput.focus();
    }
  }, 100);
}

// Check if at least one name is entered
function checkAtLeastOneName() {
  const nameEnglishInput = document.getElementById('nameEnglish');
  const nameArabicInput = document.getElementById('nameArabic');
  
  if (!nameEnglishInput || !nameArabicInput) return false;
  
  const englishValue = nameEnglishInput.value.trim();
  const arabicValue = nameArabicInput.value.trim();
  
  return englishValue.length > 0 || arabicValue.length > 0;
}

// Show error message for "at least one name required"
function showAtLeastOneNameError() {
  const nameEnglishFeedback = document.getElementById('nameEnglishFeedback');
  const nameArabicFeedback = document.getElementById('nameArabicFeedback');
  const nameEnglishInput = document.getElementById('nameEnglish');
  const nameArabicInput = document.getElementById('nameArabic');
  
  const errorMsg = 'يرجى إدخال اسم واحد على الأقل / Please enter at least one name';
  
  // Show error on both feedback elements
  if (nameEnglishFeedback) {
    nameEnglishFeedback.textContent = errorMsg;
    nameEnglishFeedback.classList.remove('success');
    nameEnglishFeedback.style.color = '#ff6b6b';
  }
  if (nameArabicFeedback) {
    nameArabicFeedback.textContent = errorMsg;
    nameArabicFeedback.classList.remove('success');
    nameArabicFeedback.style.color = '#ff6b6b';
  }
  
  // Add invalid class to both inputs
  if (nameEnglishInput) {
    nameEnglishInput.classList.add('invalid');
  }
  if (nameArabicInput) {
    nameArabicInput.classList.add('invalid');
  }
}

// Clear "at least one name" error
function clearAtLeastOneNameError() {
  const nameEnglishFeedback = document.getElementById('nameEnglishFeedback');
  const nameArabicFeedback = document.getElementById('nameArabicFeedback');
  const nameEnglishInput = document.getElementById('nameEnglish');
  const nameArabicInput = document.getElementById('nameArabic');
  
  // Only clear if the error is the "at least one name" error
  if (nameEnglishFeedback && nameEnglishFeedback.textContent.includes('يرجى إدخال اسم واحد على الأقل')) {
    nameEnglishFeedback.textContent = '';
  }
  if (nameArabicFeedback && nameArabicFeedback.textContent.includes('يرجى إدخال اسم واحد على الأقل')) {
    nameArabicFeedback.textContent = '';
  }
  
  // Remove invalid class if at least one name is entered
  if (checkAtLeastOneName()) {
    if (nameEnglishInput) nameEnglishInput.classList.remove('invalid');
    if (nameArabicInput) nameArabicInput.classList.remove('invalid');
  }
}

// Update Next button state based on validation
function updateNextButtonState() {
  const continueBtn = document.getElementById('continueToPreview');
  if (!continueBtn) return;
  
  const hasAtLeastOneName = checkAtLeastOneName();
  
  if (hasAtLeastOneName) {
    continueBtn.disabled = false;
    continueBtn.style.opacity = '1';
    continueBtn.style.cursor = 'pointer';
  } else {
    continueBtn.disabled = true;
    continueBtn.style.opacity = '0.5';
    continueBtn.style.cursor = 'not-allowed';
  }
}

// Step 3: Continue to Preview
function setupStep3ContinueButton() {
  const continueBtn = document.getElementById('continueToPreview');
  if (!continueBtn) return;
  
  // Initially disable the button
  updateNextButtonState();
  
  continueBtn.addEventListener('click', function() {
    const nameEnglishInput = document.getElementById('nameEnglish');
    const nameArabicInput = document.getElementById('nameArabic');
    
    if (!nameEnglishInput || !nameArabicInput) return;
    
    const englishValue = nameEnglishInput.value;
    const arabicValue = nameArabicInput.value;
    
    // At least one name must be provided
    if (!englishValue.trim() && !arabicValue.trim()) {
      showAtLeastOneNameError();
      nameEnglishInput.focus();
      return;
    }
    
    // Clear the "at least one name" error if it exists
    clearAtLeastOneNameError();
    
    // Validate entered names
    let isValid = true;
    
    if (englishValue.trim() && !validateNameField(englishValue, 'nameEnglishFeedback', 'nameEnglish')) {
      nameEnglishInput.focus();
      isValid = false;
    }
    
    if (arabicValue.trim() && !validateNameField(arabicValue, 'nameArabicFeedback', 'nameArabic')) {
      if (isValid) nameArabicInput.focus();
      isValid = false;
    }
    
    if (!isValid) return;
    
    userNameEnglish = englishValue.trim();
    userNameArabic = arabicValue.trim();
    
    // Update step 4 title
    const step4Title = document.getElementById('step4Title');
    if (step4Title) {
      step4Title.textContent = uiContent.step4;
    }
    
    showStep(4);
    drawCard();
  });
}

// Step 3: Back button
function setupStep3BackButton() {
  const backBtn = document.getElementById('backToStep1');
  if (!backBtn) return;
  
  backBtn.addEventListener('click', function() {
    userNameEnglish = null;
    userNameArabic = null;
    const nameEnglishInput = document.getElementById('nameEnglish');
    const nameArabicInput = document.getElementById('nameArabic');
    if (nameEnglishInput) {
      nameEnglishInput.value = '';
      nameEnglishInput.classList.remove('invalid');
    }
    if (nameArabicInput) {
      nameArabicInput.value = '';
      nameArabicInput.classList.remove('invalid');
    }
    // Clear feedback messages
    const englishFeedback = document.getElementById('nameEnglishFeedback');
    const arabicFeedback = document.getElementById('nameArabicFeedback');
    if (englishFeedback) englishFeedback.textContent = '';
    if (arabicFeedback) arabicFeedback.textContent = '';
    // Reset counters
    updateNameCounter(0, 'nameEnglishCounter');
    updateNameCounter(0, 'nameArabicCounter');
    showStep(1);
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
  
  // Wait for fonts to be loaded and ready before drawing text
  if (!fontsLoaded) {
    setTimeout(drawCard, 100);
    return;
  }
  document.fonts.ready.then(function drawCardWithFonts() {
    if (!imageObj.complete || isLoading) return;
    drawCardInner();
  }).catch(function() { drawCardInner(); });
  return;
}

function drawCardInner() {
  if (!imageObj.complete || isLoading) return;
  if (!fontsLoaded) return;

  // Hide loading indicator
  const loadingEl = document.getElementById('canvasLoading');
  const canvasEl = document.getElementById('myCanvas');
  if (loadingEl) {
    loadingEl.style.display = 'none';
    loadingEl.setAttribute('aria-busy', 'false');
  }
  if (canvasEl) {
    canvasEl.classList.remove('loading');
  }
  
  context.clearRect(0, 0, imageWidth, imageHeight);
  context.drawImage(imageObj, 0, 0);
  
  // Draw names at the bottom - English on left, Arabic on right
  // Same visual size as Alqahtani (3001 height): scale base for Refad's 4001 height
  const nameFontSize = Math.round(34 * (imageHeight / 1920));
  const nameY = imageHeight - (120 * (imageHeight / 1920));
  const strokeWidth = Math.max(1, Math.round(2 * (imageHeight / 1920)));

  context.fillStyle = "#2D1D1E";
  context.strokeStyle = "#2D1D1E";
  context.lineWidth = strokeWidth;
  context.lineJoin = "round";

  // Draw English name on the left
  if (userNameEnglish) {
    context.textAlign = "left";
    context.font = `${nameFontSize}pt ABCArizonaSerif-Regular`;
    const englishX = imageWidth * 0.08;
    context.strokeText(userNameEnglish, englishX, nameY);
    context.fillText(userNameEnglish, englishX, nameY);
  }

  // Draw Arabic name on the right
  if (userNameArabic) {
    context.textAlign = "right";
    context.font = `${nameFontSize}pt HTMoshreqPro-Regular`;
    const arabicX = imageWidth * 0.92;
    context.strokeText(userNameArabic, arabicX, nameY);
    context.fillText(userNameArabic, arabicX, nameY);
  }
}


// Show success message
function showSuccessMessage(message) {
  const successDiv = document.createElement('div');
  successDiv.className = 'success-message';
  successDiv.setAttribute('role', 'status');
  successDiv.setAttribute('aria-live', 'polite');
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
  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }
  
  // Use English name for filename, or Arabic if English not available
  const nameForFile = userNameEnglish || userNameArabic || "";
  let cleanName = nameForFile ? nameForFile.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, "_").substring(0, 50) : "";
  let imageName = cleanName ? `6D_EidCard_${cleanName}.png` : "6D_EidCard.png";

  canvas.toBlob(function (blob) {
    if (!blob) {
      console.error('Failed to generate blob from canvas');
      alert('فشل تحميل البطاقة / Failed to download card');
      return;
    }
    
    let url = URL.createObjectURL(blob);
    let link = document.createElement("a");
    link.setAttribute("download", imageName);
    link.setAttribute("href", url);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
    
    // Show success message
    const successMsg = 'تم تحميل البطاقة بنجاح! / Card downloaded successfully!';
    showSuccessMessage(successMsg);
  }, 'image/png', 1.0);
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

    // At least one name must be provided
    if (!userNameEnglish && !userNameArabic) {
      alert('يرجى إدخال اسم واحد على الأقل / Please enter at least one name');
      return;
    }

    // Company name for this card
    const company = "Refad";
    const timestamp = new Date().toISOString();
    
    // Detect browser language for analytics
    const browserLang = navigator.language || navigator.userLanguage;
    const detectedLang = browserLang.startsWith('ar') ? 'ar' : 'en';

    // 🔁 Send to SheetDB
    fetch("https://sheetdb.io/api/v1/4614gvgykfvrc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [{ 
          name: userNameEnglish || userNameArabic || '', 
          nameEnglish: userNameEnglish || '',
          nameArabic: userNameArabic || '',
          company: company, 
          language: detectedLang,
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
        const warningMsg = 'تم تحميل البطاقة، لكن لم يتم حفظ البيانات / Card downloaded, but data was not saved';
        setTimeout(() => showSuccessMessage(warningMsg), 500);
      });
  });
}

// Initialize all event listeners when DOM is ready
function initializeEventListeners() {
  setupStartButton();
  setupStep3ContinueButton();
  setupStep3BackButton();
  setupStep4BackButton();
  setupDownloadButton();
  updateUI(); // Initialize UI with bilingual content
}

// Setup event listeners when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeEventListeners);
} else {
  initializeEventListeners();
}
