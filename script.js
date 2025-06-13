document.addEventListener('DOMContentLoaded', function () {
    const cellsBoard = document.querySelector('.cells-board');
    if (!cellsBoard) {
      console.error('Элемент .cells-board не найден.');
      return;
    }
  
    // Сохраняем начальное состояние cellsBoard, чтобы его можно было сбросить.
    // Важно: если ячейки генерируются динамически после загрузки страницы,
    // вам может потребоваться функция для их пересоздания, а не просто innerHTML.
    let originalCellsHtml = cellsBoard.innerHTML; 
  
    const params = new URLSearchParams(window.location.search);
    const botName = params.get('botName') || 'Unknown';
    const language = params.get('language') || 'en';

    const botNameElement = document.getElementById('botName');
    if (botNameElement) {
      botNameElement.textContent = botName;
      botNameElement.style.display = 'block';
      botNameElement.style.color = 'white';
    }
  
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
      5: 3,
      7: 1
    };
  
    const trapsAmountElement = document.getElementById('trapsAmount');
    let currentTrapsIndex = 0;
  
    // Обновление количества ловушек
    function updateTrapsAmount() {
      trapsAmountElement.textContent = trapsOptions[currentTrapsIndex];
    }
  
    // Кнопки для переключения количества ловушек
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
  
    updateTrapsAmount(); // Инициализация при загрузке
  
    const playButton = document.getElementById('playButton'); 
    const playsCounterElement = document.getElementById('playsCounter'); 

    // --- Новая логика для ограничения игр ---
    const MAX_DAILY_PLAYS = 3;
    const RESET_HOUR_MOSCOW = 8; // 8 AM Moscow time (UTC+3)

    function getMoscowTime() {
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000); // Преобразовать в UTC
        const moscowOffset = 3 * 3600000; // Москва = UTC+3 (для летнего времени может быть +4, но 8:00 МСК обычно стабильно)
        return new Date(utc + moscowOffset);
    }

    function checkAndResetPlays() {
        const todayMoscow = getMoscowTime();
        const lastPlayDateStr = localStorage.getItem('lastPlayDate');
        let playsToday = parseInt(localStorage.getItem('playsToday') || '0', 10);

        if (lastPlayDateStr) {
            const lastPlayDate = new Date(lastPlayDateStr);
            const lastPlayMoscow = new Date(lastPlayDate.getTime() + (lastPlayDate.getTimezoneOffset() * 60000) + (3 * 3600000)); // Преобразовать в Московское время

            // Проверяем, наступил ли новый день ИЛИ если это тот же день, но уже после часа сброса (8:00 МСК),
            // и при этом последний сброс был до 8:00 МСК.
            // Это условие обеспечивает, что сброс произойдет один раз после 8 утра, даже если пользователь не заходил.
            if (todayMoscow.getDate() !== lastPlayMoscow.getDate() || 
                (todayMoscow.getDate() === lastPlayMoscow.getDate() && 
                 todayMoscow.getHours() >= RESET_HOUR_MOSCOW && 
                 lastPlayMoscow.getHours() < RESET_HOUR_MOSCOW)) {
                
                console.log('Сброс дневного лимита игр...');
                playsToday = 0;
            }
        }
        
        // Обновляем дату последней игры каждый раз, чтобы правильно отслеживать сброс
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
            playButton.querySelector('span').textContent = 'Лимит исчерпан'; // Изменено для span внутри кнопки
            playButton.style.background = '#6c757d'; // Пример изменения стиля для отключенной кнопки
            playButton.style.cursor = 'not-allowed';
        }
    }

    function enablePlayButton() {
        if (playButton) {
            playButton.disabled = false;
            playButton.querySelector('span').textContent = 'Play'; // Изменено для span внутри кнопки
            playButton.style.background = 'linear-gradient(93.73deg, #108de7, #0855c4)'; // Возвращаем оригинальный цвет
            playButton.style.cursor = 'pointer';
        }
    }

    // Инициализация счетчика и состояния кнопки при загрузке страницы
    let currentPlays = checkAndResetPlays();
    updatePlaysCounter(currentPlays);
    if (currentPlays >= MAX_DAILY_PLAYS) {
        disablePlayButton();
    } else {
        enablePlayButton(); // Убедимся, что кнопка включена, если лимит не исчерпан
    }
    // --- Конец новой логики ---

    let isFirstPlay = true; // Отслеживаем первый запуск анимации (если это используется)

    if (playButton) {
      playButton.addEventListener('click', () => {
        currentPlays = checkAndResetPlays(); // Проверяем и обновляем количество игр перед каждой новой игрой
        
        if (currentPlays >= MAX_DAILY_PLAYS) {
            disablePlayButton();
            alert('Вы достигли дневного лимита игр!'); 
            return; // Прерываем выполнение, если лимит исчерпан
        }

        currentPlays++;
        localStorage.setItem('playsToday', currentPlays.toString());
        localStorage.setItem('lastPlayDate', getMoscowTime().toISOString()); // Обновляем дату последней игры
        updatePlaysCounter(currentPlays);

        // Отключаем кнопку сразу после нажатия, пока идет игра/анимация
        disablePlayButton(); 
        
        // Сброс состояния доски и ячеек перед новой игрой
        cellsBoard.innerHTML = originalCellsHtml; 
        // !!! Важно: после перезаписи innerHTML, DOM-элементы ячеек становятся новыми объектами.
        // Поэтому нужно заново получить ссылки на них.
        const updatedCells = Array.from(document.querySelectorAll('.cell'));


        const selectedTraps = trapsOptions[currentTrapsIndex];
        const cellsToOpen = trapsToCellsOpenMapping[selectedTraps];
  
        const selectedCellsIndexes = []; // Используем индексы для выбора
  
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
            const cell = updatedCells[index]; // Используем обновленные ссылки на ячейки
  
            cell.classList.add('cell-fade-out');
  
             setTimeout(() => {
              cell.innerHTML = ''; // Очищаем содержимое ячейки
              const newImg = document.createElement('img');
              newImg.setAttribute('width', '40');
              newImg.setAttribute('height', '40');
              newImg.style.opacity = '0';
              newImg.style.transform = 'scale(0)';
              newImg.src = 'output_svgs/stars.svg'; // ИСПРАВЛЕННЫЙ ПУТЬ К ИЗОБРАЖЕНИЮ ЗВЕЗДЫ
              newImg.classList.add('star-animation');
              cell.appendChild(newImg);
              setTimeout(() => {
                newImg.classList.add('fade-in');
              }, 50); // Небольшая задержка для запуска fade-in
              cell.classList.remove('cell-fade-out');
            }, 500); // Задержка перед началом анимации звезды (после cell-fade-out)
  
            starIndex++;
            setTimeout(animateStars, 650); // Задержка между анимациями звезд
          } else {
            // После завершения анимации, проверяем, нужно ли снова включить кнопку "Play"
            if (currentPlays < MAX_DAILY_PLAYS) {
                enablePlayButton();
            } else {
                disablePlayButton(); // Если лимит достигнут, оставляем кнопку отключенной
            }

            if (isFirstPlay) {
              isFirstPlay = false;
            }
          }
        }
        animateStars();
      });
    }

    // Обработчики для ячеек (если они нужны, так как в вашем коде они есть)
    // Важно: если `cellsBoard.innerHTML = originalCellsHtml;` выполняется перед назначением
    // обработчиков кликов для ячеек, то эти обработчики нужно переназначать
    // для новых элементов после каждого сброса доски.
    // В текущей логике animateStars уже используются обновленные ссылки `updatedCells`.
    // Если вам нужна отдельная логика для клика по ячейке вне анимации Play:
    /*
    cellsBoard.addEventListener('click', (event) => {
        const clickedCell = event.target.closest('.cell');
        if (clickedCell) {
            clickedCell.classList.add('clicked');
            // Дополнительная логика для клика по ячейке, если необходимо
            console.log('Клик по ячейке: ', clickedCell.id);
        }
    });
    */

  });
