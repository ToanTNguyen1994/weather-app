document.getElementById('getWeatherBtn').addEventListener('click', () => {
    const location = document.getElementById('locationInput').value.trim();
    const errorDiv = document.getElementById('errorDisplay');
    errorDiv.textContent = '';

    if (location) {
        getCoordinates(location);
    } else {
        errorDiv.textContent = "Please enter a valid location.";
    }
});

function getCoordinates(location) {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const lat = data[0].lat;
                const lon = data[0].lon;
                document.getElementById('locationDisplay').textContent = `${data[0].display_name}`;
                getForecast(lat, lon);
            } else {
                document.getElementById('errorDisplay').textContent = "Location not found. Please try again.";
            }
        })
        .catch(err => {
            console.error(err);
            document.getElementById('errorDisplay').textContent = "Failed to fetch location data.";
        });
}

function getForecast(lat, lon) {
    const pointsUrl = `https://api.weather.gov/points/${lat},${lon}`;

    fetch(pointsUrl)
        .then(res => res.json())
        .then(data => {
            const forecastUrl = data.properties.forecast;
            fetch(forecastUrl)
                .then(res => res.json())
                .then(forecastData => {
                    displayForecast(forecastData.properties.periods);
                })
                .catch(err => {
                    console.error(err);
                    document.getElementById('errorDisplay').textContent = "Failed to fetch forecast data.";
                });
        })
        .catch(err => {
            console.error(err);
            document.getElementById('errorDisplay').textContent = "Invalid coordinates or unavailable forecast.";
        });
}

function displayForecast(periods) {
    const forecastDiv = document.getElementById('forecast');
    forecastDiv.innerHTML = '';

    periods.slice(0, 7).forEach(period => {
        const temperatureF = period.temperature;
        const temperatureC = ((temperatureF - 32) * 5 / 9).toFixed(1);

        const conditionIcon = getCustomIcon(period.shortForecast);

        const col = document.createElement('div');
        col.className = 'col-md-4';

        col.innerHTML = `
            <div class="card p-3 h-100">
                <h5 class="card-title">${period.name}</h5>
                <img src="${conditionIcon}" alt="Weather icon" class="img-fluid mb-2" style="max-height:80px;">
                <p><strong>Temperature:</strong> ${temperatureF}°F / ${temperatureC}°C</p>
                <p><strong>Conditions:</strong> ${period.shortForecast}</p>
            </div>
        `;
        forecastDiv.appendChild(col);
    });
}

function getCustomIcon(condition) {
    const lower = condition.toLowerCase();

    if (lower.includes('sunny') || lower.includes('clear')) {
        return 'https://cdn-icons-png.flaticon.com/512/869/869869.png'; // Sunny icon
    } else if (lower.includes('cloudy') || lower.includes('overcast')) {
        return 'https://cdn-icons-png.flaticon.com/512/414/414825.png'; // Cloudy icon
    } else if (lower.includes('rain') || lower.includes('showers')) {
        return 'https://cdn-icons-png.flaticon.com/512/1163/1163624.png'; // Rain icon
    } else if (lower.includes('snow')) {
        return 'https://cdn-icons-png.flaticon.com/512/642/642102.png'; // Snow icon
    } else if (lower.includes('thunder') || lower.includes('storm')) {
        return 'https://cdn-icons-png.flaticon.com/512/1146/1146869.png'; // Thunderstorm icon
    } else if (lower.includes('fog') || lower.includes('mist')) {
        return 'https://cdn-icons-png.flaticon.com/512/1197/1197102.png'; // Fog icon
    } else {
        return 'https://cdn-icons-png.flaticon.com/512/869/869869.png'; // Default sunny icon
    }
}
