document.getElementById('ratingForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const release_id = document.getElementById('release_id').value;
    const rhymes_imagery = parseInt(document.getElementById('rhymes_imagery').value);
    const structure_rhythm = parseInt(document.getElementById('structure_rhythm').value);
    const style_execution = parseInt(document.getElementById('style_execution').value);
    const individuality_charisma = parseInt(document.getElementById('individuality_charisma').value);
    const atmosphere_vibe = parseInt(document.getElementById('atmosphere_vibe').value);
    const trendiness_genre_relevance = parseInt(document.getElementById('trendiness_genre_relevance').value);

    const ratingData = {
        release_id,
        rhymes_imagery,
        structure_rhythm,
        style_execution,
        individuality_charisma,
        atmosphere_vibe,
        trendiness_genre_relevance
    };

    try {
        const response = await fetch('/rate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ratingData)
        });

        const message = await response.text();
        document.getElementById('responseMessage').innerText = "Релиз успешно оценён!";

        if (response.ok) {
            document.getElementById('ratingForm').reset();
            window.location.replace('/')
        }
    } catch (error) {
        document.getElementById('responseMessage').innerText = 'Error submitting rating. Please try again.';
        console.error('Error:', error);
    }
});

// Обновляем текст значений при изменении ползунков
document.querySelectorAll('input[type="range"]').forEach(function (input) {
    input.addEventListener('input', function () {
        const valueSpan = document.getElementById(input.id + '_value');
        valueSpan.innerText = input.value;
    });
});
