async function fetchReleasesByType(releaseType) {
    try {
        const response = await fetch(`/releases/${releaseType}`);

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const releases = await response.json();
        console.log(releases)
        displayReleases(releases); // Функция для отображения релизов
    } catch (error) {
        console.error('Error fetching releases:', error);
        alert('Ошибка при загрузке релизов. Попробуйте позже.');
    }
}

function displayReleases(releases) {
    const releasesContainer = document.getElementById('reliseList');
    releasesContainer.innerHTML = ''; // Очистить контейнер

    if (releases.length === 0) {
        releasesContainer.innerHTML = '<p>Нет релизов для данного типа.</p>';
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
        `;
        releasesContainer.appendChild(releaseElement);
    });
}

function href(id) {
    window.location.replace('/relisePage.html?relise_id=' + id)
}

function handleSelectChange(selectElement) {
    var selectedValue
    if (selectElement.value == 'альбом')
        selectedValue = "album";
    else if (selectElement.value == "сингл")
        selectedValue = "single";
    else
        selectedValue = "EP"

    fetchReleasesByType(selectedValue)
}

fetchReleasesByType("album")