document.getElementById('releaseForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // Предотвращаем стандартную отправку формы

    const artist_name = document.getElementById('artist_name').value;
    const title = document.getElementById('title').value;
    const cover_image_url = document.getElementById('cover_image_url').value;
    const type = document.getElementById('type').value;
    const release_date = document.getElementById('release_date').value;

    const releaseData = {
        artist_name,
        title,
        cover_image_url,
        type,
        release_date
    };

    try {
        const response = await fetch('/releases', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(releaseData)
        });

        const responseMessage = await response.json();

        if (response.ok) {
            document.getElementById('responseMessage').innerHTML = `<div class="alert alert-success">Релиз успешно добавлен (Release ID: ${responseMessage.release_id})</div>`;
            document.getElementById('releaseForm').reset(); // Сброс формы после успешной отправки

            // Скрываем форму для добавления релиза и показываем форму для оценки
            document.getElementById('releaseForm').style.display = 'none'; // Скрываем форму добавления
            document.getElementById('ratingFormContainer').style.display = 'block'; // Показываем форму для оценки

            // Устанавливаем ID релиза в скрытое поле формы оценки
            document.getElementById('release_id').value = responseMessage.release_id;
        } else {
            document.getElementById('responseMessage').innerHTML = `<div class="alert alert-danger">Error: ${responseMessage.message}</div>`;
        }
    } catch (error) {
        document.getElementById('responseMessage').innerHTML = `<div class="alert alert-danger">Error submitting release</div>`;
        console.error('Error:', error);
    }
});