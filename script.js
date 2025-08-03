const cityInput = document.querySelector('.city-input');
const searchButton = document.querySelector('.search-button');
const weatherInfoSection = document.querySelector('.weather-info');
const notFoundSection = document.querySelector('.not-found');
const searchCitySection = document.querySelector('.search-city');
const countryText = document.querySelector('.country-text');
const temperatureText = document.querySelector('.temp-text');
const conditionText = document.querySelector('.condition-text');
const humidityValueText = document.querySelector('.humidity-value'); // fixed
const windValueText = document.querySelector('.wind-speed-text');
const weatherSummaryImg = document.querySelector('.weather-summary-image'); // fixed 
const currentDateText = document.querySelector('.current-data-text'); // fixed
const forecastItemsContainer = document.querySelector('.forecast-items-container');
const apiKey = '940658fdfd67094ce6f94d6eacf890c8'


async function getFetchData(endPoint, city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&units=metric`;
    const response = await fetch(apiUrl);
    return response.json();
}


showDisplaySection(searchCitySection);


searchButton.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        updateWeatherInfo(city);
    }
});


cityInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            updateWeatherInfo(city);
        }
    }
});

function getWeatherIcon(id) {
    if (id >= 200 && id <= 232) return 'thunderstorm.svg';
    if (id >= 300 && id <= 321) return 'drizzle.svg';
    if (id >= 500 && id <= 531) return 'rain.svg';
    if (id >= 600 && id <= 622) return 'snow.svg';
    if (id >= 701 && id <= 781) return 'atmosphere.svg';
    if (id === 800) return 'clear.svg';
    return 'clouds.svg';
}

function getCurrentDate() {
    const currentDate = new Date();
    const options = { weekday: 'short', month: 'short', day: '2-digit' }
    return currentDate.toLocaleDateString('en-GB', options)
}

async function updateWeatherInfo(city) {
    const weatherData = await getFetchData('weather', city);
    if (weatherData.cod !== 200) {
        showDisplaySection(notFoundSection);
        return;
    }
    showDisplaySection(weatherInfoSection);

    const {
        name: cityName,
        sys: { country },
        main: { temp, humidity },
        weather: [{ id, main }],
        wind: { speed },
    } = weatherData;

    countryText.textContent = `${cityName}, ${country}`;
    temperatureText.textContent = Math.round(temp) + ' °C';
    conditionText.textContent = main;
    humidityValueText.textContent = humidity + '%';
    windValueText.textContent = speed + ' m/s';
    currentDateText.textContent = getCurrentDate();
    weatherSummaryImg.src = `assets/weather/${getWeatherIcon(id)}`;

    await updateForecastInfo(city);
}

async function updateForecastInfo(city) {
    const forecastData = await getFetchData('forecast', city);
    const timeTaken = '12:00:00';
    const todayDate = new Date().toISOString().split('T')[0];

    const dates = [];
    const temperatures = [];

    forecastItemsContainer.innerHTML = '';
    forecastData.list.forEach(forecastWeather => {
        if (forecastWeather.dt_txt.includes(timeTaken) && !forecastWeather.dt_txt.includes(todayDate)) {
            updateForecastItems(forecastWeather);

            const dateTaken = new Date(forecastWeather.dt_txt);
            const dateOption = { day: '2-digit', month: 'short' };
            const dateLabel = dateTaken.toLocaleDateString('en-GB', dateOption);
            dates.push(dateLabel);

            temperatures.push(Math.round(forecastWeather.main.temp));
        }
    });
    createOrUpdateChart(dates, temperatures);
}


function updateForecastItems(weatherData) {
    const {
        dt_txt: date,
        weather: [{ id }],
        main: { temp },
    } = weatherData;

    const dateTaken = new Date(date);
    const dateOption = { day: '2-digit', month: 'short' };
    const dateResult = dateTaken.toLocaleDateString('en-GB', dateOption);

    const forecastItem = `
        <div class="forecast-item">
            <h5 class="forecast-item-date regular-text">${dateResult}</h5>
            <img src="assets/weather/${getWeatherIcon(id)}" class="forecast-item-img">
            <h5 class="forecast-item-temp">${Math.round(temp)} °C</h5>
        </div>
    `;
    forecastItemsContainer.insertAdjacentHTML('beforeend', forecastItem);
}

function showDisplaySection(section) {
    [weatherInfoSection, notFoundSection, searchCitySection].forEach(sec =>
        sec.style.display = 'none'
    );
    section.style.display = 'flex';
}


let myChart; 

function createOrUpdateChart(dates, temperatures) {
    if (myChart) {
        myChart.data.labels = dates;
        myChart.data.datasets[0].data = temperatures;
        myChart.update();
    } else {
        const ctx = document.getElementById('myChart').getContext('2d');
        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Temperature Variation',
                    data: temperatures,
                    fill: true,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    }
}