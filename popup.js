function run() {
  chrome.tabs.executeScript({
    file: 'zombie.js'
  }); 
}

document.getElementById('clickme').addEventListener('click', run);