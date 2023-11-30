// This function is to display the current day data by grabbing the elements by ID and displaying them, it also creates an img element and displays the img that is in the API.
function displayToday(data) {
    const box = document.getElementById('today-box');
    box.innerHTML = '';
    const tempText = document.getElementById('city-temp');
    const windText = document.getElementById('city-wind');
    const humidityText = document.getElementById('city-humidity');
    const cityText = document.getElementById('city-name');
    tempText.textContent = data.main.temp.toFixed() + '°F';
    windText.textContent = data.wind.speed.toFixed() + 'MPH';
    humidityText.textContent = data.main.humidity + '%';
    const date = new Date(data.dt * 1000);
    const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: '2-digit'
    });
    cityText.textContent = data.name + ' ' + formattedDate;
    const img = document.createElement('img');
    img.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
    box.appendChild(img);
}
// This function creates html elements for the five day data to be displayed in and add styling.
function displayFiveDay(data) {
    const box = document.getElementById('five-day-box')
    box.innerHTML = '';
    let parsedArr = [];
    data.list.forEach(item => {
        let date = new Date(item.dt * 1000);
        if (date.getHours() === 12) {
            parsedArr.push(item);
        }
    })
    parsedArr.forEach(item => {
        let div = document.createElement('div');
        let futureDate = document.createElement('p')
        let tempText = document.createElement('p');
        let windText = document.createElement('p');
        let humidityText = document.createElement('p');
        let img = document.createElement('img');
        img.src = `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`
        tempText.textContent = item.main.temp.toFixed() + '°F';
        windText.textContent = item.wind.speed.toFixed() + 'MPH';
        humidityText.textContent = item.main.humidity + '%';
        let date = new Date(item.dt * 1000);
        let formattedDate = date.toLocaleDateString('en-US', {
            year: '2-digit',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit'
        });
        futureDate.textContent = formattedDate;
        div.classList.add("col", "w-25", "border", "border-dark-subtle", "m-2", "rounded-4")
        div.appendChild(futureDate);
        div.appendChild(tempText);
        div.appendChild(windText);
        div.appendChild(humidityText);
        div.appendChild(img);
        box.appendChild(div);
    })
}

async function runFetch(city) {
    try {
        const todayData = await fetchWeatherData(city, 'weather');
        const fiveDayData = await fetchWeatherData(city, 'forecast');

        // Display today and 5 day data after fetch
        displayToday(todayData);
        displayFiveDay(fiveDayData);

    } catch (error) {
        console.error('Error:', error);
    }

}
// This function shows the search history from localStorage and displays them in the DOM. It also adds styling to the created html elements.
function displaySearchHistory(data) {
    const box = document.getElementById('button-box');
    box.innerHTML = '';
    const heading = document.createElement('p')
    heading.textContent = 'Saved Cities'
    heading.classList.add('fw-bold', 'my-1')
    box.appendChild(heading)

    data.forEach(item => {
        let btn = document.createElement('button');
        btn.classList.add('btn', 'btn-primary', 'col-12', 'my-1');
        btn.textContent = item;
        //Causes infinte loop
        btn.addEventListener("click", () => runFetch(item));
        box.appendChild(btn)
    })
}

function init() {
    // Display search history from localStorage on page load
    const history = JSON.parse(localStorage.getItem('cityArr'))

    // If it exists, run a fetch on the 0 index city for content on page load
    if (history) {
        runFetch(history[0])
    }

    // If it doesn't exist, we need to create it
    if (history === null) {
        let tempArr = []
        localStorage.setItem('cityArr', JSON.stringify(tempArr))
    } else {
        // Display history in any case
        displaySearchHistory(history)
    }
}


async function fetchWeatherData(city, type) {
    const apiKey = 'f340ce323ac79b293e9c0699e025d466';
    const units = 'imperial';
    // type includes 'forcast' for 5 day data, and 'weather' for today only
    const apiUrl = `https://api.openweathermap.org/data/2.5/${type}?q=${city}&appid=${apiKey}&units=${units}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching weather data:', error.message);
    }
}

async function startSearch(event) {
    event.preventDefault();
    // Get formdata for city entered
    const formData = new FormData(event.target);
    var city = formData.get('city');

    try {
        const todayData = await fetchWeatherData(city, 'weather');
        const fiveDayData = await fetchWeatherData(city, 'forecast');

        // Display today and 5 day data after fetch if successful
        if (todayData.cod !== '404' && fiveDayData.cod !== '404') {
            console.log(todayData)
            displayToday(todayData);
            displayFiveDay(fiveDayData);

            // Check if city is not empty
            if (city != '') {
                let tempArr = JSON.parse(localStorage.getItem('cityArr'))
                // Check if the city exists in localStorage
                if (!tempArr.includes(city)) {
                    // If it doesn't exit, add it and append the country code for clarity
                    let cityConcat = `${city}, ${todayData.sys.country}`
                    tempArr.push(cityConcat)
                    localStorage.setItem('cityArr', JSON.stringify(tempArr))
                }
                // Display updated search history in any case
                displaySearchHistory(tempArr)
            }
        } else {
            throw new Error(`Bad status codes: \n Weather API: ${todayData.cod} \n Forecast API: ${fiveDayData.cod}`)
        }

    } catch (error) {
        console.error(error);
        // show toast from bootstrap docs
        const toastTrigger = document.getElementById('liveToastBtn')
        const toastLiveExample = document.getElementById('liveToast')
        const toastBody = document.getElementById('toast-body');

        const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample)
        toastTrigger.addEventListener('click', () => {
            toastBootstrap.show()
        })
        toastTrigger.click();
        toastBody.textContent = `You entered '${city}'. This city does not exist.`
    }
}


init()