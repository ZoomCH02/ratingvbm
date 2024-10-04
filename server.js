const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const https = require('https');
const { v4: uuidv4 } = require('uuid');


const app = express();
const db = new sqlite3.Database('./db.db');

app.use(express.static('./public/'))
app.use('/uploads', express.static('uploads'));


const uploadDir = path.join(__dirname, 'uploads');

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'your_secret_key123213',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }  // Set to true if using HTTPS
}));

// Функция для скачивания изображения по URL и сохранения его на сервере
function downloadImage(url, filename) {
    const uploadsDir = path.join(__dirname, 'uploads'); // Путь к папке uploads
    const filePath = path.join(uploadsDir, filename); // Полный путь к файлу

    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filePath);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close(() => {
                    resolve(`uploads/${filename}`); // Возвращаем относительный путь
                });
            });
        }).on('error', (err) => {
            fs.unlink(filePath); // Удаляем файл при ошибке
            reject(err);
        });
    });
}

app.get('/releases/:release_id', (req, res) => {
    const release_id = req.params.release_id; // Это будет 'single'
    const { year, month } = req.query; // Здесь получаем year и month

    console.log('Release ID:', release_id); // Должно выводить 'single'
    console.log('Year:', year); // Должно выводить '2024'
    console.log('Month:', month); // Должно выводить '10'

    let query = `
        SELECT ra.release_id, ra.user_id, ra.rhymes_imagery, ra.structure_rhythm, ra.style_execution, ra.individuality_charisma, ra.atmosphere_vibe, ra.trendiness_genre_relevance, ra.average_rating, re.title, re.cover_image, re.release_date, re.type, a.name
        FROM Ratings ra
        JOIN Releases re ON ra.release_id = re.id
        JOIN Artists a ON re.artist_id = a.id
        WHERE re.type = ?
        AND strftime('%Y', re.release_date) = ? 
        AND strftime('%m', re.release_date) = ?;
    
    `;
    const params = [release_id]; // Здесь release_id будет 'single'

    // Фильтрация по году
    if (year) {
        query += ` AND strftime('%Y', re.release_date) = ?`;
        params.push(year);
    }

    // Фильтрация по месяцу
    if (month) {
        query += ` AND strftime('%m', re.release_date) = ?`;
        params.push(month.padStart(2, '0'));
    }
    db.all(query, params, (err, ratings) => {
        console.log(params)
        if (err) {
            //console.log(err)
            return res.status(500).send('Error fetching ratings');
        }

        console.log('Returned Ratings:', ratings); // Логируем возвращаемые рейтинги
        res.json(ratings);
    });
});

app.get('/top-releases/:year', (req, res) => {
    const year = req.params.year;
    console.log(year);

    // SQL запрос для получения топ-3 альбомов, синглов и EP
    const query = `
        SELECT *
        FROM Releases re, Ratings ra, Artists a
        WHERE strftime('%Y', re.release_date) = ? AND re.id = ra.release_id AND re.type = ? AND re.artist_id = a.id
        ORDER BY ra.average_rating DESC
        LIMIT 3;
    `;

    const releaseTypes = ['album', 'single', 'ep'];
    const promises = releaseTypes.map(type => {
        return new Promise((resolve, reject) => {
            db.all(query, [year, type], (err, rows) => {
                if (err) {
                    return reject(err);
                }
                resolve({ type, releases: rows });
            });
        });
    });

    Promise.all(promises)
        .then(results => {
            const topReleases = {};
            results.forEach(({ type, releases }) => {
                topReleases[type] = releases;
            });
            res.json(topReleases);
        })
        .catch(err => {
            console.error('Error fetching top releases:', err);
            res.status(500).send('Error fetching top releases');
        });
});







// Check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.status(401).send('Unauthorized: Please log in');
    }
}

// Register a new user
app.post('/register', (req, res) => {
    const { username, password, email } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    db.run(`INSERT INTO Users (username, password, email, role) VALUES (?, ?, ?, 0)`,
        [username, hashedPassword, email], function (err) {
            if (err) {
                return res.status(500).send('Error registering user');
            }
            res.send('User registered successfully');
        });
});

// Login a user
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get(`SELECT * FROM Users WHERE username = ?`, [username], (err, user) => {
        if (err || !user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).send('Invalid credentials');
        }

        req.session.user = user;
        res.send('Logged in successfully');
    });
});

// Logout a user
app.post('/logout', (req, res) => {
    req.session.destroy();
    res.send('Logged out successfully');
});

// Get all artists
app.get('/artists', (req, res) => {
    db.all(`SELECT * FROM Artists`, (err, artists) => {
        if (err) {
            return res.status(500).send('Error fetching artists');
        }
        res.json(artists);
    });
});

app.post('/rate', isAuthenticated, (req, res) => {
    const {
        release_id,
        rhymes_imagery,
        structure_rhythm,
        style_execution,
        individuality_charisma,
        atmosphere_vibe,
        trendiness_genre_relevance
    } = req.body;

    const user_id = req.session.user.id;

    // Расчет общего рейтинга
    const baseScore =
        rhymes_imagery +
        structure_rhythm +
        style_execution +
        individuality_charisma; //   40 + 20 + 30

    // Рассчитываем процентные добавления
    const atmosphereBonus = (atmosphere_vibe / 10) * baseScore; // 50% за 5, 40% за 4 и так далее
    const trendinessBonus = (trendiness_genre_relevance / 10) * (atmosphereBonus + baseScore); // То же для trendiness_genre_relevance

    const totalScore = Math.round(baseScore + atmosphereBonus + trendinessBonus);

    const created_at = new Date().toISOString();

    db.run(`
        INSERT INTO Ratings (release_id, user_id, rhymes_imagery, structure_rhythm, style_execution, individuality_charisma, atmosphere_vibe, trendiness_genre_relevance, average_rating, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [release_id, user_id, rhymes_imagery, structure_rhythm, style_execution, individuality_charisma, atmosphere_vibe, trendiness_genre_relevance, totalScore, created_at],
        function (err) {
            if (err) {
                return res.status(500).send('Error submitting rating');
            }
            res.send('Rating submitted successfully');
        }
    );
});


app.post('/releases', isAuthenticated, (req, res) => {
    const { artist_name, title, cover_image_url, type, release_date } = req.body;

    if (!artist_name || !title || !cover_image_url || !type || !release_date) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Найдем артиста по имени
    db.get(`SELECT id FROM Artists WHERE name = ?`, [artist_name], async (err, artist) => {
        if (err) {
            return res.status(500).json({ message: 'Error searching for artist' });
        }

        if (!artist) {
            db.run(`INSERT INTO Artists (name) VALUES (?)`, [artist_name], function (err) {
                if (err) {
                    return res.status(500).json({ message: 'Error creating artist' });
                }

                const new_artist_id = this.lastID;
                addRelease(new_artist_id);
            });
        } else {
            addRelease(artist.id);
        }
    });

    async function addRelease(artist_id) {
        try {
            // Генерация уникального имени файла
            const filename = `${uuidv4()}.png`; // или любой другой формат, который вам нужен

            // Скачиваем и сохраняем изображение в папку uploads
            const relativeImagePath = await downloadImage(cover_image_url, filename);

            // Вставляем данные в таблицу Releases, сохраняя только относительный путь
            db.run(`INSERT INTO Releases (artist_id, title, cover_image, type, release_date)
                    VALUES (?, ?, ?, ?, ?)`,
                [artist_id, title, relativeImagePath, type, release_date],
                function (err) {
                    if (err) {
                        return res.status(500).json({ message: 'Error creating release' });
                    }
                    res.json({
                        message: 'Release created successfully',
                        release_id: this.lastID
                    });
                }
            );
        } catch (error) {
            console.error('Error downloading image:', error);
            res.status(500).json({ message: 'Error downloading or saving image' });
        }
    }

    function sanitizeFileName(url) {
        // Извлекаем имя файла из URL
        const baseName = path.basename(url);
        // Заменяем недопустимые символы (например, https://) на пустую строку
        return baseName.replace(/https?:\/\//, '').replace(/[\/\\]/g, '_');
    }


});

// Get all ratings for a release
app.get('/rating/:release_id', (req, res) => {
    const release_id = req.params.release_id;

    db.all(`SELECT ra.release_id, ra.user_id, ra.rhymes_imagery, ra.structure_rhythm, ra.style_execution, ra.individuality_charisma, ra.atmosphere_vibe, ra.trendiness_genre_relevance, ra.average_rating, re.title, re.cover_image, re.release_date, re.type, a.name, re.release_date
    FROM Ratings ra, Releases re, Artists a
    WHERE ra.release_id = ? AND ra.release_id = re.id AND re.artist_id = a.id`, [release_id], (err, ratings) => {
        if (err) {
            return res.status(500).send('Error fetching ratings');
        }
        res.json(ratings);
    });
});

// Получить все релизы по типу и отсортировать по average_rating
app.get('/releases/:type', (req, res) => {
    const releaseType = req.params.type;

    db.all(`
        SELECT * FROM Releases re, Ratings ra, Artists a
        WHERE re.type = ? AND re.id = ra.release_id AND a.id = re.artist_id
        ORDER BY ra.average_rating DESC`,
        [releaseType],
        (err, releases) => {
            if (err) {
                console.log(err)
                return res.status(500).send('Error fetching releases');
            }
            res.json(releases);
        }
    );
});

// Получить все релизы
app.get('/releases', (req, res) => {
    const releaseType = req.params.type;

    db.all(`
    SELECT re.id, a.name, re.title FROM Releases re, Ratings ra, Artists a
    WHERE re.id = ra.release_id AND a.id = re.artist_id
    ORDER BY ra.average_rating DESC`,
        [releaseType],
        (err, releases) => {
            if (err) {
                console.log(err)
                return res.status(500).send('Error fetching releases');
            }
            res.json(releases);
        }
    );
});

app.get('/image/:id', (req, res) => {
    const id = parseInt(req.params.id);
    db.get('SELECT cover_image FROM Releases WHERE id = ?', [id], (err, row) => {
        if (err || !row) {
            return res.status(404).send('Image not found');
        }

        res.redirect(row.cover_image); // Перенаправляем на URL изображения
    });
});



app.get('/ratings/', (req, res) => {
    db.all(`SELECT * FROM Ratings`, (err, ratings) => {
        if (err) {
            return res.status(500).send('Error fetching ratings');
        }
        res.json(ratings);
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
