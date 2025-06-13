document.addEventListener('DOMContentLoaded', function () {
    const cellsBoard = document.querySelector('.cells-board');
    if (!cellsBoard) {
      console.error('Элемент .cells-board не найден.');
      return;
    }
  
    // Сохраняем начальное состояние cellsBoard, чтобы его можно было сбросить.
    let originalCellsHtml = cellsBoard.innerHTML; 
  
    // Эти строки закомментированы, так как мы убрали botName из HTML
    // const params = new URLSearchParams(window.location.search);
    // const botName = params.get('botName') || 'Unknown'; 
    // const language = params.get('language') || 'en'; 
    //
    // const botNameElement = document.getElementById('botName');
    // if (botNameElement) {
    //   botNameElement.textContent = botName;
    //   botNameElement.style.display = 'block';
    //   botNameElement.style.color = 'white';
    // }
  
    function hidePreloader() {
      const preloader = document.querySelector('.preloader');
      if (preloader) {
        preloader.classList.remove('fade-in');
        setTimeout(() => {
          preloader.style.display = 'none';
          document.body.classList.remove('hidden');
          document.body.classList.add('fade-in');
        }, 1000);
      }
    }
    setTimeout(hidePreloader, 3000);
  
    const trapsOptions = [1, 3, 5, 7];
    const trapsToCellsOpenMapping = {
      1: 10,
      3: 5,
      5: 4,
      7: 3
    };
  
    const trapsAmountElement = document.getElementById('trapsAmount');
    let currentTrapsIndex = 0;
  
    function updateTrapsAmount() {
      trapsAmountElement.textContent = trapsOptions[currentTrapsIndex];
    }
  
    const prevPresetBtn = document.getElementById('prev_preset_btn');
    const nextPresetBtn = document.getElementById('next_preset_btn');
  
    if (prevPresetBtn) {
      prevPresetBtn.addEventListener('click', () => {
        if (currentTrapsIndex > 0) {
          currentTrapsIndex--;
          updateTrapsAmount();
        }
      });
    }
  
    if (nextPresetBtn) {
      nextPresetBtn.addEventListener('click', () => {
        if (currentTrapsIndex < trapsOptions.length - 1) {
          currentTrapsIndex++;
          updateTrapsAmount();
        }
      });
    }
  
    updateTrapsAmount(); 
  
    const playButton = document.getElementById('playButton'); 
    const playsCounterElement = document.getElementById('playsCounter'); 

    const MAX_DAILY_PLAYS = 3;
    const RESET_HOUR_MOSCOW = 8; 

    function getMoscowTime() {
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000); 
        const moscowOffset = 3 * 3600000; 
        return new Date(utc + moscowOffset);
    }

    function checkAndResetPlays() {
        const todayMoscow = getMoscowTime();
        const lastPlayDateStr = localStorage.getItem('lastPlayDate');
        let playsToday = parseInt(localStorage.getItem('playsToday') || '0', 10);

        if (lastPlayDateStr) {
            const lastPlayDate = new Date(lastPlayDateStr);
            const lastPlayMoscow = new Date(lastPlayDate.getTime() + (lastPlayDate.getTimezoneOffset() * 60000) + (3 * 3600000)); 

            if (todayMoscow.getDate() !== lastPlayMoscow.getDate() || 
                (todayMoscow.getDate() === lastPlayMoscow.getDate() && 
                 todayMoscow.getHours() >= RESET_HOUR_MOSCOW && 
                 lastPlayMoscow.getHours() < RESET_HOUR_MOSCOW)) {
                
                console.log('Сброс дневного лимита игр...');
                playsToday = 0;
            }
        }
        
        localStorage.setItem('lastPlayDate', todayMoscow.toISOString());
        localStorage.setItem('playsToday', playsToday.toString());
        return playsToday;
    }

    function updatePlaysCounter(currentPlays) {
        if (playsCounterElement) {
            playsCounterElement.textContent = `${MAX_DAILY_PLAYS - currentPlays}/${MAX_DAILY_PLAYS}`;
        }
    }

    function disablePlayButton() {
        if (playButton) {
            playButton.disabled = true;
            const playButtonSpan = playButton.querySelector('span');
            if (playButtonSpan) {
                playButtonSpan.textContent = 'Лимит исчерпан'; 
            }
            playButton.style.background = '#6c757d'; 
            playButton.style.cursor = 'not-allowed';
        }
    }

    function enablePlayButton() {
        if (playButton) {
            playButton.disabled = false;
            const playButtonSpan = playButton.querySelector('span');
            if (playButtonSpan) {
                playButtonSpan.textContent = 'Play'; 
            }
            playButton.style.background = 'linear-gradient(93.73deg, #108de7, #0855c4)'; 
            playButton.style.cursor = 'pointer';
        }
    }

    let currentPlays = checkAndResetPlays();
    updatePlaysCounter(currentPlays);
    if (currentPlays >= MAX_DAILY_PLAYS) {
        disablePlayButton();
    } else {
        enablePlayButton();
    }

    let isFirstPlay = true; 

    if (playButton) {
      playButton.addEventListener('click', () => {
        currentPlays = checkAndResetPlays(); 
        
        if (currentPlays >= MAX_DAILY_PLAYS) {
            disablePlayButton();
            alert('Вы достигли дневного лимита игр!'); 
            return; 
        }

        currentPlays++;
        localStorage.setItem('playsToday', currentPlays.toString());
        localStorage.setItem('lastPlayDate', getMoscowTime().toISOString()); 
        updatePlaysCounter(currentPlays);

        disablePlayButton(); 
        
        cellsBoard.innerHTML = originalCellsHtml; 
        const updatedCells = Array.from(document.querySelectorAll('.cell'));


        const selectedTraps = trapsOptions[currentTrapsIndex];
        const cellsToOpen = trapsToCellsOpenMapping[selectedTraps];
  
        const selectedCellsIndexes = []; 
  
        while (selectedCellsIndexes.length < cellsToOpen) {
          const randomIndex = Math.floor(Math.random() * updatedCells.length);
          if (!selectedCellsIndexes.includes(randomIndex)) {
            selectedCellsIndexes.push(randomIndex);
          }
        }
  
        let starIndex = 0;
        function animateStars() {
          if (starIndex < selectedCellsIndexes.length) {
            const index = selectedCellsIndexes[starIndex];
            const cell = updatedCells[index]; 
  
            cell.classList.add('cell-fade-out');
  
             setTimeout(() => {
              cell.innerHTML = ''; 
              const newImg = document.createElement('img');
              newImg.setAttribute('width', '40');
              newImg.setAttribute('height', '40');
              newImg.style.opacity = '0';
              newImg.style.transform = 'scale(0)';
              newImg.src = 'img/stars.svg'; // *** ИСПРАВЛЕНО: ПУТЬ ТЕПЕРЬ 'img/stars.svg' ***
              newImg.classList.add('star-animation');
              cell.appendChild(newImg);
              setTimeout(() => {
                newImg.classList.add('fade-in');
              }, 50); 
              cell.classList.remove('cell-fade-out');
            }, 500); 
  
            starIndex++;
            setTimeout(animateStars, 650); 
          } else {
            if (currentPlays < MAX_DAILY_PLAYS) {
                enablePlayButton();
            } else {
                disablePlayButton(); 
            }

            if (isFirstPlay) {
              isFirstPlay = false;
            }
          }
        }
        animateStars();
      });
    }

  });
