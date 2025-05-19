// Lấy các phần tử DOM cần dùng
const wrapper = document.querySelector('.wrapper');
const searchInput = wrapper.querySelector('input');
const btnSearch = wrapper.querySelector('.btn-search');
const btnClear = wrapper.querySelector('.btn-clear');
const infoText = wrapper.querySelector('.info-text');
const content = wrapper.querySelector('.content');

let audio = null;

// Hàm xử lý dữ liệu trả về từ API
function data(result, word) {
  if (result.title) {
    infoText.innerHTML = `Sorry! We can't find <strong>${word}</strong> in English.`;
    wrapper.classList.remove('active');
    return;
  }

  wrapper.classList.add('active');
  content.innerHTML = ''; // Clear previous results
  audio = null; // reset audio

  result.forEach((entry) => {
    const phoneticObj = entry.phonetics.find(p => p.audio) || entry.phonetics[0] || {};
    const audioSrc = phoneticObj.audio || "";
    audio = audioSrc ? new Audio(audioSrc) : null;
    const phonetic = phoneticObj.text ? `/${phoneticObj.text}/` : "";

    entry.meanings.forEach((meaning) => {
      const defObj = meaning.definitions[0] || {};
      const definition = defObj.definition || "No definition";
      const example = defObj.example || "No example";
      const synonymsList = defObj.synonyms || [];

      // Tạo phần tử HTML
      const box = document.createElement("div");
      box.className = "meaning-box";
      box.innerHTML = `
        <div class="word">
          <p>${entry.word}</p>
          <p>${meaning.partOfSpeech || ""}</p>
          <span>${phonetic}</span>
          ${
            audioSrc
              ? `<div class="volume" title="Play pronunciation" tabindex="0" role="button" aria-label="Play pronunciation for ${word}"><i class="fa-solid fa-volume-high"></i></div>`
              : ""
          }
        </div>
        <div class="meaning">
          <strong>Meaning:</strong>
          <span>${definition}</span>
        </div>
        <div class="example">
          <strong>Example:</strong>
          <span>${example}</span>
        </div>
        <div class="synonyms">
          <strong>Synonyms:</strong>
          <div class="list">
            ${
              synonymsList.length
                ? synonymsList.slice(0, 5).map(s => `<span tabindex="0" role="button" aria-label="Search synonym ${s}" class="synonym-item">${s}</span>`).join("")
                : "<span>No synonyms</span>"
            }
          </div>
        </div>
      `;
      content.appendChild(box);
    });
  });

  // Gán sự kiện cho nút loa
  content.querySelectorAll('.volume').forEach(volBtn => {
    volBtn.addEventListener('click', () => {
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => alert("Audio not supported or not available."));
      }
    });
    volBtn.addEventListener('keydown', e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        volBtn.click();
      }
    });
  });

  // Gán sự kiện cho các synonyms
  content.querySelectorAll('.synonym-item').forEach(syn => {
    syn.addEventListener('click', () => {
      searchInput.value = syn.textContent;
      fetchAPI(syn.textContent);
    });
    syn.addEventListener('keydown', e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        syn.click();
      }
    });
  });
}

// Cập nhật hiển thị nút search/clear dựa vào input
function updateButtonsVisibility(isSearching = false) {
  if (isSearching) {
    btnSearch.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;
    btnSearch.disabled = true;
    btnSearch.classList.remove('hidden');
    btnClear.classList.add('hidden');
    return;
  }
  btnSearch.disabled = false;
  btnSearch.innerHTML = `<i class="fas fa-search"></i>`;
  if (searchInput.value.trim()) {
    btnSearch.classList.add('hidden');
    btnClear.classList.remove('hidden');
  } else {
    btnSearch.classList.remove('hidden');
    btnClear.classList.add('hidden');
  }
}

// Theo dõi thay đổi input để cập nhật nút
searchInput.addEventListener('input', () => {
  updateButtonsVisibility();
});

// Hàm fetch API
function fetchAPI(word) {
  infoText.style.color = "#4caf50";
  infoText.textContent = `Searching for "${word}"...`;
  updateButtonsVisibility(true);

  setTimeout(() => {
    infoText.textContent = '';
    wrapper.classList.remove('active');
  }, 700);

  setTimeout(() => {
    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
      .then(res => res.json())
      .then(result => {
        data(result, word);
        updateButtonsVisibility();
      })
      .catch(() => {
        infoText.style.color = "red";
        infoText.textContent = "Oops! Something went wrong.";
        wrapper.classList.remove('active');
        updateButtonsVisibility();
      });
  }, 1000);
}

// Sự kiện nút search click
btnSearch.addEventListener('click', () => {
  const word = searchInput.value.trim();
  if (!word) return;
  updateButtonsVisibility(true);
  fetchAPI(word);
});

// Sự kiện enter trên input
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const word = searchInput.value.trim();
    if (!word) return;
    updateButtonsVisibility(true);
    fetchAPI(word);
  }
});

// Sự kiện nút clear
btnClear.addEventListener('click', () => {
  searchInput.value = '';
  infoText.style.color = "#7a7a7a";
  infoText.textContent = 'Type any existing word and press enter or click search to get meaning, example, synonyms, etc.';
  content.innerHTML = '';
  wrapper.classList.remove('active');
  if(audio) {
    audio.pause();
    audio.currentTime = 0;
  }
  searchInput.focus();
  updateButtonsVisibility();
});

// Khởi tạo trạng thái nút
updateButtonsVisibility();