
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
function displaySearchHistory(data) {
    const box = document.getElementById('button-box');
    data.forEach(item => {
        console.log(item)
        let btn = document.createElement('button');
        btn.classList.add('btn btn-primary');
        btn.textContent = item;
        box.appendChild(btn)
    })
}

async function init() {
    const history = await JSON.parse(localStorage.getItem('cityArr'))
    if (history.length !== 0) {
        displaySearchHistory(history)
    }
}


async function fetchFiveDay(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=f340ce323ac79b293e9c0699e025d466&units=imperial`
    const response = await fetch(url)
    return await response.json();
}

async function fetchNowData(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=f340ce323ac79b293e9c0699e025d466&units=imperial`
    const response = await fetch(url)
    return await response.json();
}

async function startSearch(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const todayData = await fetchNowData(formData.get('city'));
    const fiveDayData = await fetchFiveDay(formData.get('city'));
    displayToday(todayData);
    displayFiveDay(fiveDayData);

    if (formData.get('city') != '') {
        let tempArr = JSON.parse(localStorage.getItem('cityArr'))
        
            
        tempArr.push(formData.get('city'))
            
        

        localStorage.setItem('cityArr', JSON.stringify(tempArr))
    }
}  

init()