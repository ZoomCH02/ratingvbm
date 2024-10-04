async function fetchTopReleasesByYear(year) {
    try {
        const url = `/top-releases/${year}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const topReleases = await response.json();
        displayTopReleases(year, topReleases);
    } catch (error) {
        console.error('Error fetching top releases:', error);
    }
}

function displayTopReleases(year, releases) {
    const container = document.getElementById('topReleasesContainer');

    // Создаем контейнер для года
    const yearContainer = document.createElement('div');
    yearContainer.className = 'year-block mb-5 text-center'; // Центрируем текст
    yearContainer.innerHTML = `<h2 class="h2 font-weight-bold">${year}</h2><hr><br>`; // Жирный шрифт

    // Альбомы, синглы и EP
    ['album', 'single', 'ep'].forEach(type => {
        const releasesOfType = releases[type];
        const typeContainer = document.createElement('div');
        typeContainer.className = 'release-type mb-4'; // Добавляем отступ

        // Заголовок типа релиза
        typeContainer.innerHTML = `<h3 class="h3">${type.charAt(0).toUpperCase() + type.slice(1)}</h3>`;

        const releasesRow = document.createElement('div');
        releasesRow.className = 'releases-row'; // Обертка для релизов

        // Если нет релизов данного типа
        if (!releasesOfType || releasesOfType.length === 0) {
            releasesRow.innerHTML = `<p>Нет релизов</p>`;
        } else {
            releasesOfType.slice(0, 3).forEach((release, index) => {
                const releaseElement = document.createElement('div');
                releaseElement.className = 'release-item'; // Элемент релиза

                // Определяем класс для обводки в зависимости от места
                let borderClass = '';
                if (index === 0) {
                    borderClass = 'border-gold'; // Золотая обводка
                } else if (index === 1) {
                    borderClass = 'border-silver'; // Серая обводка
                } else if (index === 2) {
                    borderClass = 'border-bronze'; // Бронзовая обводка
                }

                // Обновленная разметка с обводкой только у обложки
                releaseElement.innerHTML = `
                    <div class="release-image ${borderClass}">
                        <img src="${release.cover_image}" alt="${release.title}" class="imgOfReliseMini">
                    </div>
                    <hr>
                    <h4 class="h4">${release.title}</h4>
                    <p>${release.name}</p>
                    <div class="rating-circle">${release.average_rating}</div> <!-- Рейтинг в круге -->
                `;
                releasesRow.appendChild(releaseElement);
            });
        }

        typeContainer.appendChild(releasesRow);
        yearContainer.appendChild(typeContainer);
    });

    container.appendChild(yearContainer);
}


// Инициализация
fetchTopReleasesByYear(2024); // Запрашиваем топ-рейтинги за 2024 год
