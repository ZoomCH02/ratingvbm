async function renderPage() {
    // Получение release_id из URL
    const urlParams = new URLSearchParams(window.location.search);
    const releaseId = urlParams.get('relise_id');

    if (!releaseId) {
        console.error("Release ID не найден в URL");
        return;
    }

    try {
        // Выполнение запроса к серверу для получения данных рейтинга
        const response = await fetch(`/rating/${releaseId}`);
        
        if (!response.ok) {
            throw new Error(`Ошибка получения данных: ${response.statusText}`);
        }

        const ratings = await response.json();

        console.log(ratings);

        displayRatings(ratings);
    } catch (error) {
        console.error("Ошибка:", error);
    }
}

function displayRatings(ratings) {
    var album_title = document.getElementById('album_title');
    var artist = document.getElementById('artist');
    var total = document.getElementById('total')
    var release_img = document.getElementById('release_img')
    var rhymes_imagery = document.getElementById('rhymes_imagery')
    var trendiness_genre_relevance = document.getElementById('trendiness_genre_relevance')
    var style_execution = document.getElementById('style_execution')
    var structure_rhythm = document.getElementById('structure_rhythm')
    var rhymes_imagery = document.getElementById('rhymes_imagery')
    var individuality_charisma = document.getElementById('individuality_charisma')
    var atmosphere_vibe = document.getElementById('atmosphere_vibe')
    var background = document.getElementById('background')
    var date = document.getElementById('date')

    ratings.forEach(rating => {
        artist.innerText = rating.name
        album_title.innerText = rating.title
        total.innerText = rating.average_rating
        atmosphere_vibe.innerText = rating.atmosphere_vibe
        individuality_charisma.innerText = rating.individuality_charisma
        rhymes_imagery.innerText = rating.rhymes_imagery
        structure_rhythm.innerText = rating.structure_rhythm
        style_execution.innerText = rating.style_execution
        trendiness_genre_relevance.innerText = rating.trendiness_genre_relevance
        date.innerText = "Дата релиза: "+rating.release_date.split('-').reverse().join('.');

        release_img.src = rating.cover_image
        background.style.backgroundImage = `url(${rating.cover_image})`;
    });
}

