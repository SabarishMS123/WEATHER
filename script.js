let cityInput = document.getElementById('city-input'),
    searchBtn = document.getElementById('searchBtn'),
    locationBtn = document.getElementById('locationBtn'), // Get the location button
    api_key = 'b1dfde59b571cb810b862bab50a87bdd'; 
currentWeatherCard = document.querySelector('.current-weather'),
    forecastItems = document.querySelectorAll('.forecast-item'),
    humidityVal = document.getElementById('humidityVal'),
    pressureVal = document.getElementById('pressureVal'),
    visibilityVal = document.getElementById('visibilityVal'),
    windspeedVal = document.getElementById('windspeedVal'),
    feelsVal = document.getElementById('feelsVal'),
    sunriseVal = document.querySelector('.sunrise-sunset .item:nth-child(1) h2'),
    sunsetVal = document.querySelector('.sunrise-sunset .item:nth-child(2) h2'),
    airQualityIndex = document.querySelector('.air-index'),
    airIndices = document.querySelectorAll('.air-indices h2'),
    hourlyForecastCards = document.querySelectorAll('.hourly-forecast .card');

function getWeatherDetails(name, lat, lon, country) {
    let FORECAST_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${api_key}&units=metric`,
        WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}&units=metric`;

    // Fetch current weather
    fetch(WEATHER_API_URL)
        .then(res => res.json())
        .then(data => {
            currentWeatherCard.innerHTML = `
                <div class="details">
                    <p>Now</p>
                    <h2>${data.main.temp.toFixed(1)}&deg;C</h2>
                    <p>${data.weather[0].description}</p>
                </div>
                <div class="weather-icon">
                    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="">
                </div>
            `;
            document.querySelector('.card-footer').innerHTML = `
                <p class="icon-spacing"><i class="fa-light fa-calendar"></i> <span class="gap">${new Date().toLocaleDateString()}</span></p>
                <p class="icon-spacing"><i class="fa-light fa-location-dot"></i> <span class="gap">${name}, ${country}</span></p>
            `;
            // Update today's highlights
            humidityVal.innerText = `${data.main.humidity}%`;
            pressureVal.innerText = `${data.main.pressure} hPa`;
            visibilityVal.innerText = `${(data.visibility / 1000).toFixed(1)} km`;
            windspeedVal.innerText = `${data.wind.speed} m/s`;
            feelsVal.innerText = `${data.main.feels_like.toFixed(1)}°C`;
            sunriseVal.innerText = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
            sunsetVal.innerText = new Date(data.sys.sunset * 1000).toLocaleTimeString();
        })
        .catch(() => {
            alert('Failed to fetch current weather!');
        });

    // Fetch air quality data
    fetchAirQuality(lat, lon); // Fetch air quality after getting weather details

    // Fetch forecast data
    fetch(FORECAST_API_URL)
        .then(res => res.json())
        .then(data => {
            updateForecast(data);
            updateHourlyForecast(data);
        })
        .catch(() => {
            alert('Failed to fetch the weather forecast');
        });
}

function fetchAirQuality(lat, lon) {
    let AIR_QUALITY_API_URL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${api_key}`;
    
    fetch(AIR_QUALITY_API_URL)
        .then(res => res.json())
        .then(data => {
            const aqi = data.list[0].main.aqi;
            airQualityIndex.innerText = getAQIText(aqi);
            airQualityIndex.className = `air-index aqi-${aqi}`; // Set the class based on AQI value
            const airQualityValues = data.list[0].components;
            airIndices[0].innerText = airQualityValues.pm2_5.toFixed(1);
            airIndices[1].innerText = airQualityValues.pm10.toFixed(1);
            airIndices[2].innerText = airQualityValues.so2.toFixed(1);
            airIndices[3].innerText = airQualityValues.co.toFixed(1);
            airIndices[4].innerText = airQualityValues.no.toFixed(1);
            airIndices[5].innerText = airQualityValues.no2.toFixed(1);
            airIndices[6].innerText = airQualityValues.nh3.toFixed(1);
            airIndices[7].innerText = airQualityValues.o3.toFixed(1);
        })
        .catch(() => {
            alert('Failed to fetch air quality data!');
        });
}

function getAQIText(aqi) {
    switch (aqi) {
        case 1: return 'Good';
        case 2: return 'Fair';
        case 3: return 'Moderate';
        case 4: return 'Poor';
        case 5: return 'Very Poor';
        default: return 'Unknown';
    }
}

function updateForecast(data) {
    for (let i = 0; i < forecastItems.length; i++) {
        const forecast = data.list[i * 8]; // Get the forecast for every 24 hours
        if (forecast) {
            forecastItems[i].querySelector('span').innerText = `${forecast.main.temp.toFixed(1)}°C`;
            forecastItems[i].querySelector('p:nth-of-type(1)').innerText = new Date(forecast.dt * 1000).toLocaleDateString();
            forecastItems[i].querySelector('img').src = `https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`;
        }
    }
}

function updateHourlyForecast(data) {
    const today = new Date();
    const todayDate = today.toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

    let hourlyForecasts = data.list.filter(item => {
        const forecastDate = new Date(item.dt * 1000).toISOString().split('T')[0];
        return forecastDate === todayDate; // Filter for today's forecasts
    });

    // Display hourly forecast for specific times (e.g., 9 AM, 10 AM, etc.)
    hourlyForecastCards.forEach((card, index) => {
        const forecast = hourlyForecasts[index];
        if (forecast) {
            const forecastTime = new Date(forecast.dt * 1000);
            card.querySelector('p:nth-of-type(1)').innerText = `${forecastTime.getHours()} AM`;
            card.querySelector('p:nth-of-type(2)').innerText = `${forecast.main.temp.toFixed(1)}°C`;
        } else {
            card.querySelector('p:nth-of-type(1)').innerText = '';
            card.querySelector('p:nth-of-type(2)').innerText = '_____°C';
        }
    });
}

function getCityCoordinates() {
    let cityName = cityInput.value.trim();
    cityInput.value = '';
    if (!cityName) return;
    let GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${api_key}`;
    fetch(GEOCODING_API_URL)
        .then(res => res.json())
        .then(data => {
            if (data.length > 0) {
                let { name, lat, lon, country } = data[0];
                getWeatherDetails(name, lat, lon, country);
            } else {
                alert(`City not found: ${cityName}`);
            }
        })
        .catch(() => {
            alert(`Failed to fetch coordinates of ${cityName}`);
        });
}

// Function to get the current location
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            // Reverse geocoding to get the location name
            let REVERSE_GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&appid=${api_key}`;
            fetch(REVERSE_GEOCODING_API_URL)
                .then(res => res.json())
                .then(data => {
                    if (data.length > 0) {
                        let { name, country } = data[0];
                        getWeatherDetails(name, lat, lon, country); // Pass the location name and coordinates
                    } else {
                        alert('Location not found.');
                    }
                })
                .catch(() => {
                    alert('Failed to fetch location name.');
                });
        }, () => {
            alert("Unable to retrieve your location.");
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

// Event listeners
searchBtn.addEventListener('click', getCityCoordinates);
locationBtn.addEventListener('click', getCurrentLocation); // Add event listener for the location button