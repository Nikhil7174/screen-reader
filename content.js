let isActive = false;
let speechRate = 1;
let speechPitch = 1;
let selector = null;
let hoverTimer = null;
let currentElement = null;
const hoverDelay = 2000; // 2 seconds

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggle") {
    isActive = request.state;
    if (isActive) {
      startScreenReader();
    } else {
      stopScreenReader();
    }
  } else if (request.action === "updateSettings") {
    if (request.rate !== undefined) speechRate = request.rate;
    if (request.pitch !== undefined) speechPitch = request.pitch;
  } else if (request.action === "ttsStatus") {
    console.log("TTS status:", request.status);
  }
});

const startScreenReader = () => {
  createSelector();
  document.addEventListener('mousemove', moveSelector);
  document.addEventListener('mouseover', startHoverTimer);
  document.addEventListener('mouseout', clearHoverTimer);
  
  speakText("Screen reader activated. Hover over an element for 2 seconds to read it.");
}

const stopScreenReader = () => {
  if (selector) {
    selector.remove();
    selector = null;
  }
  document.removeEventListener('mousemove', moveSelector);
  document.removeEventListener('mouseover', startHoverTimer);
  document.removeEventListener('mouseout', clearHoverTimer);
  stopSpeaking();
  
  speakText("Screen reader deactivated.");
}

const createSelector = () => {
  selector = document.createElement('div');
  selector.style.position = 'fixed';
  selector.style.border = '2px solid green';
  selector.style.backgroundColor = 'rgba(144, 238, 144, 0.2)'; // Soothing green
  selector.style.pointerEvents = 'none';
  selector.style.zIndex = '999999';
  document.body.appendChild(selector);
}

const moveSelector = (event) =>{
  if (!isActive || !selector) return;

  const element = document.elementFromPoint(event.clientX, event.clientY);
  if (element) {
    const rect = element.getBoundingClientRect();
    selector.style.left = rect.left + 'px';
    selector.style.top = rect.top + 'px';
    selector.style.width = rect.width + 'px';
    selector.style.height = rect.height + 'px';
  }
}

const startHoverTimer = (event) => {
  if (!isActive || event.target === selector) return;

  clearHoverTimer();

  currentElement = event.target;
  hoverTimer = setTimeout(() => {
    readElement(currentElement);
  }, hoverDelay);
}

const clearHoverTimer = (event) => {
  if (hoverTimer) {
    clearTimeout(hoverTimer);
    hoverTimer = null;
    stopSpeaking();
  }
}

const readElement = (element) => {
  if (!element) return;

  let textToRead = getElementText(element);
  let elementType = getElementType(element);
  let speakTxt = ''
  elementType == 'Image' ? speakTxt = elementType + ': ' + textToRead : speakTxt = textToRead;
  speakText(speakTxt);
}

const getElementText = (element) => {
  if (element.alt) return element.alt;
  if (element.value) return element.value;
  if (element.textContent) return element.textContent.trim();
  return '';
}

const getElementType = (element) => {
  switch (element.tagName.toLowerCase()) {
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      return 'Heading ' + element.tagName.charAt(1);
    case 'p':
      return 'Paragraph';
    case 'a':
      return 'Link';
    case 'button':
      return 'Button';
    case 'input':
      return 'Input ' + (element.type || 'text');
    case 'img':
      return 'Image';
    default:
      return element.tagName.toLowerCase();
  }
}

const speakText = (text) => {
  chrome.runtime.sendMessage({
    action: "speak",
    text: text,
    rate: speechRate,
    pitch: speechPitch
  }, (response) => {
    if (response && response.status) {
      console.log("Speech status:", response.status);
    }
  });
}

const stopSpeaking = () => {
  chrome.runtime.sendMessage({ action: "stop" });
}

chrome.storage.sync.get('isActive', (data) =>{
  isActive = data.isActive || false;
  if (isActive) {
    startScreenReader();
  }
});
