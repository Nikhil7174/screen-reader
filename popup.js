document.addEventListener('DOMContentLoaded', function () {
    const toggleButton = document.getElementById('toggleButton');
    const rateInput = document.getElementById('rate');
    const pitchInput = document.getElementById('pitch');

    chrome.storage.sync.get(['isActive', 'rate', 'pitch'], function (data) {
        toggleButton.textContent = data.isActive ? 'Disable Screen Reader' : 'Enable Screen Reader';
        rateInput.value = data.rate || 1;
        pitchInput.value = data.pitch || 1;
    });

    toggleButton.addEventListener('click', function () {
        chrome.storage.sync.get('isActive', function (data) {
            const newState = !data.isActive;
            chrome.storage.sync.set({ isActive: newState });
            toggleButton.textContent = newState ? 'Disable Screen Reader' : 'Enable Screen Reader';
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "toggle", state: newState });
            });
        });
    });

    rateInput.addEventListener('change', function () {
        chrome.storage.sync.set({ rate: parseFloat(rateInput.value) });
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "updateSettings", rate: parseFloat(rateInput.value) });
        });
    });

    pitchInput.addEventListener('change', function () {
        chrome.storage.sync.set({ pitch: parseFloat(pitchInput.value) });
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "updateSettings", pitch: parseFloat(pitchInput.value) });
        });
    });
});