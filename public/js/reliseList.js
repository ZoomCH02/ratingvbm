async function fetchReleasesByType(releaseType, year = new Date().getFullYear(), month = (new Date().getMonth() + 1).toString().padStart(2, '0')) {
    try {
        // Формируем URL с фильтрами по типу, году и месяцу
        let url = `/releases/${releaseType}`;
        if (year || month) {
            url += `?year=${year}&month=${month}`;
        }
        console.log(`Release ID: ${releaseType}, Year: ${year}, Month: ${month}`);
        console.log(`Fetching from URL: ${url}`);
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const releases = await response.json();
        console.log(releases);
        displayReleases(releases); // Отображаем релизы
    } catch (error) {
        console.error('Error fetching releases:', error);
        alert('Ошибка при загрузке релизов. Попробуйте позже.');
    }
}

function applyDateFilter() {
    const year = document.getElementById('yearFilter').value || new Date().getFullYear();
    const month = document.getElementById('monthFilter').value || (new Date().getMonth() + 1).toString().padStart(2, '0');
    const selectedType = document.querySelector('.selectForm').value;

    let releaseType;
    if (selectedType === 'альбом') releaseType = 'album';
    else if (selectedType === 'сингл') releaseType = 'single';
    else releaseType = 'EP';

    fetchReleasesByType(releaseType, year, month);
}

// Обработчик изменения выбора
function handleSelectChange(selectElement) {
    applyDateFilter();
}

// Функция отображения релизов
function displayReleases(releases) {
    const releasesContainer = document.getElementById('reliseList');
    releasesContainer.innerHTML = ''; // Очистить контейнер

    if (releases.length === 0) {
        // Создание элемента с сообщением
        const messageElement = document.createElement('div');
        messageElement.className = 'no-releases-message'; // Добавление класса
        messageElement.innerHTML = 'Нет релизов для данного типа.';
        releasesContainer.appendChild(messageElement); // Добавление сообщения в контейнер
        return;
    }

    releases.forEach(release => {
        const releaseElement = document.createElement('div');
        releaseElement.innerHTML = `
            <div class="col-12 col-lg-4 offset-lg-1 bg-gray-900 mt-5 reliseDiv" onclick="href(${release.release_id})">
                <img class="imgOfReliseMini" src="${release.cover_image}" alt="${release.title}">
                <div class="info_bout_relise_mini">
                    <div style="display: block;">
                        <h3 class="h3">${release.title}</h3>
                        <p class="text-secondary h3">${release.name}</p>
                    </div>
                    <div class="raitingMiniRelise">${release.average_rating}</div>
                </div>
            </div>
        `;
        releasesContainer.appendChild(releaseElement);
    });
}

function href(id) {
    window.location.replace('/relisePage.html?relise_id=' + id);
}

// Инициализация с текущим годом и месяцем
fetchReleasesByType('album');