class DarkSkyWeatherCard extends HTMLElement {
  set hass(hass) {
    if (!this.content) {
      const card = document.createElement('ha-card');
      const link = document.createElement('link');
      link.type = 'text/css';
      link.rel = 'stylesheet';
      link.href = '/local/custom_ui/dark-sky-weather-card.css';
      card.appendChild(link);
      this.content = document.createElement('div');
      this.content.className = 'card';
      card.appendChild(this.content);
      this.appendChild(card);
    }

    const getUnit = function (measure) {
      const lengthUnit = hass.config.unit_system.length;
      switch (measure) {
        case 'air_pressure':
          return lengthUnit === 'km' ? 'hPa' : 'mbar';
        case 'length':
          return lengthUnit;
        case 'precipitation':
          return lengthUnit === 'km' ? 'mm' : 'in';
        default:
          return hass.config.unit_system[measure] || '';
      }
    };

    const transformDayNight = {
      "below_horizon": "night",
      "above_horizon": "day",
    }
    const sunLocation = transformDayNight[hass.states[this.config.entity_sun].state];
    const weatherIcons = {
      'clear-day': 'day',
      'clear-night': 'night',
      'rain': 'rainy-5',
      'snow': 'snowy-6',
      'sleet': 'rainy-6',
      'wind': 'cloudy',
      'fog': 'cloudy',
      'cloudy': 'cloudy',
      'partly-cloudy-day': 'cloudy-day-3',
      'partly-cloudy-night': 'cloudy-night-3',
      'hail': 'rainy-7',
      'lightning': 'thunder',
      'thunderstorm': 'thunder',
      'windy-variant': `cloudy-${sunLocation}-3`,
      'exceptional': '!!',
    }
    const windDirections = [ 'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW', 'N' ];

    var other_words = [ "Feels like", "Today", "Forecast" ];
    if (this.config.other_words) {
      other_words = this.config.other_words;
    }
    
    var day_names = [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ];
    if (this.config.day_names) {
      day_names = this.config.day_names;
    }   
    function dayName(dayNum) {
        if ( dayNum > 6 ) {
            dayNum -= 7;
        }
        return day_names[dayNum];
    }
 
    var d = new Date();
    const forecast1 = { date: dayName(d.getDay()+1),
    				   condition: this.config.entity_forecast_icon_1,
    				   temphigh: this.config.entity_forecast_high_temp_1,
    				   templow:  this.config.entity_forecast_low_temp_1, 
               pop: this.config.entity_forecast_pop_1, };
    const forecast2 = { date: dayName(d.getDay()+2),
    				   condition: this.config.entity_forecast_icon_2,
    				   temphigh: this.config.entity_forecast_high_temp_2,
    				   templow:  this.config.entity_forecast_low_temp_2,
               pop: this.config.entity_forecast_pop_2, };
    const forecast3 = { date: dayName(d.getDay()+3),
    				   condition: this.config.entity_forecast_icon_3,
    				   temphigh: this.config.entity_forecast_high_temp_3,
    				   templow:  this.config.entity_forecast_low_temp_3,
               pop: this.config.entity_forecast_pop_3, };
    const forecast4 = { date: dayName(d.getDay()+4),
    				   condition: this.config.entity_forecast_icon_4,
    				   temphigh: this.config.entity_forecast_high_temp_4,
    				   templow:  this.config.entity_forecast_low_temp_4,
               pop: this.config.entity_forecast_pop_4, };
    const forecast5 = { date: dayName(d.getDay()+5),
    				   condition: this.config.entity_forecast_icon_5,
    				   temphigh: this.config.entity_forecast_high_temp_5,
    				   templow:  this.config.entity_forecast_low_temp_5,
               pop: this.config.entity_forecast_pop_5, };

    const forecast = [forecast1,forecast2,forecast3,forecast4,forecast5];
    
    const currentConditions = hass.states[this.config.entity_current_conditions].state;
    const humidity = hass.states[this.config.entity_humidity].state;
    const pressure = Math.round(hass.states[this.config.entity_pressure].state);
    const temperature = Math.round(hass.states[this.config.entity_temperature].state);
    const feelstemperature = Math.round(hass.states[this.config.entity_feelstemp].state);  
    const visibility = hass.states[this.config.entity_visibility].state;
    const windBearing = windDirections[(Math.round((hass.states[this.config.entity_wind_bearing].state / 360) * 16))];
    const windSpeed = Math.round(hass.states[this.config.entity_wind_speed].state);

    var sunSetOrRiseA = new Date(hass.states[this.config.entity_sun].attributes.next_setting);
    var sunSetOrRiseIconA = "mdi:weather-sunset-down";
    var sunSetOrRiseB = new Date(hass.states[this.config.entity_sun].attributes.next_rising);
    var sunSetOrRiseIconB = "mdi:weather-sunset-up";
    // A == sunset   B == sunrise
    if ( hass.states[this.config.entity_sun].state == "above_horizon" ) {
        // sun has risen, but hasn't set
        // sunset is today (no date displayed). sunrise is tomorrow (display date)
        // next is sunset == A
        sunSetOrRiseA = sunSetOrRiseA.toLocaleTimeString();
        var ssrI = sunSetOrRiseA.lastIndexOf(":");
        sunSetOrRiseA = sunSetOrRiseA.substr(0,ssrI) + sunSetOrRiseA.substr(ssrI+4);
        sunSetOrRiseB = dayName(sunSetOrRiseB.getDay()) + " " + sunSetOrRiseB.toLocaleTimeString();
        ssrI = sunSetOrRiseB.lastIndexOf(":");
        sunSetOrRiseB = sunSetOrRiseB.substr(0,ssrI) + sunSetOrRiseB.substr(ssrI+4);
    } else {
        // next is sunrise == B
        var ss = new Date(sunSetOrRiseA);
        if ( new Date().getDate() != sunSetOrRiseB.getDate() ) {
            // sun hasn't risen, and it's not same day
            // so display dates for both
            sunSetOrRiseA = dayName(sunSetOrRiseB.getDay()) + " " + sunSetOrRiseB.toLocaleTimeString();
            sunSetOrRiseB = dayName(ss.getDay()) + " " + ss.toLocaleTimeString();
        } else {
            // sun hasn't risen, but it's the same day
            // since rise and set are today, no dates displayed
            sunSetOrRiseA = sunSetOrRiseB.toLocaleTimeString();
            sunSetOrRiseB = ss.toLocaleTimeString();
        }
        var ssrI = sunSetOrRiseA.lastIndexOf(":");
        sunSetOrRiseA = sunSetOrRiseA.substr(0,ssrI) + sunSetOrRiseA.substr(ssrI+4);
        ssrI = sunSetOrRiseB.lastIndexOf(":");
        sunSetOrRiseB = sunSetOrRiseB.substr(0,ssrI) + sunSetOrRiseB.substr(ssrI+4);
        sunSetOrRiseIconA = "mdi:weather-sunset-up";
        sunSetOrRiseIconB = "mdi:weather-sunset-down";     
    }

    this.content.innerHTML = `
      <div>
      <span class="icon bigger" style="background: none, url(/local/icons/weather_icons/animated/${weatherIcons[currentConditions]}.svg) no-repeat; background-size: contain;"></span>
        <div class="divtemp">
          <span class="temp">${temperature}<span class="tempc"> ${getUnit('temperature')}</span></span>
          <span class="feels"><span class="feelslike">${other_words[0]}<span class="feelstemp">${feelstemperature}<span class="feelstempc">${getUnit('temperature')}</span></span></span></span>
        </div>
      </div>
      <span class="tdaysum"><span style="font-weight:bold">${other_words[1]}:</span> ${hass.states[this.config.entity_today_summary].state} <br><span style="font-weight:bold">${other_words[2]}:</span> ${hass.states[this.config.entity_daily_summary].state}</span>
      <span>
        <ul class="variations right">
            <li><span class="ha-icon"><ha-icon icon="mdi:water-percent"></ha-icon></span>${humidity}<span class="unit"> %</span></li>
            <li><span class="ha-icon"><ha-icon icon="mdi:gauge"></ha-icon></span>${pressure}<span class="unit"> ${getUnit('air_pressure')}</span></li>
            <li><span class="ha-icon"><ha-icon icon=${sunSetOrRiseIconB}></ha-icon></span>${sunSetOrRiseB}</li>
        </ul>
        <ul class="variations">
            <li><span class="ha-icon"><ha-icon icon="mdi:weather-windy"></ha-icon></span>${windBearing} ${windSpeed}<span class="unit"> ${getUnit('length')}/h</span></li>
            <li><span class="ha-icon"><ha-icon icon="mdi:eye"></ha-icon></span>${visibility}<span class="unit"> ${getUnit('length')}</span></li>
            <li><span class="ha-icon"><ha-icon icon=${sunSetOrRiseIconA}></ha-icon></span>${sunSetOrRiseA}</li>
        </ul>
      </span>
      <div class="forecast clear">
          ${forecast.map(daily => `
              <div class="day">
                  <span class="dayname">${daily.date}</span>
                  <br><i class="icon" style="background: none, url(/local/icons/weather_icons/animated/${weatherIcons[hass.states[daily.condition].state]}.svg) no-repeat; background-size: contain;"></i>
                  <br><span class="highTemp">${Math.round(hass.states[daily.temphigh].state)}${getUnit('temperature')}</span>
                  <br><span class="lowTemp">${Math.round(hass.states[daily.templow].state)}${getUnit('temperature')}</span>
                  <br><span class="highTemp">${Math.round(hass.states[daily.pop].state)}%</span>
              </div>`).join('')}
      </div>
      <span class="threedaysum">
          <span style="font-weight:bold">${forecast[0].date}:</span> ${hass.states[this.config.entity_forecast_sum_1].state}<br>
          <span style="font-weight:bold">${forecast[1].date}:</span> ${hass.states[this.config.entity_forecast_sum_2].state}<br>
          <span style="font-weight:bold">${forecast[2].date}:</span> ${hass.states[this.config.entity_forecast_sum_3].state}<br>
      </span>      
      `;
  }
 
  setConfig(config) {
    if (!config.entity_current_conditions || 
    		!config.entity_humidity ||
    		!config.entity_pressure ||
     		!config.entity_temperature ||
    		!config.entity_visibility ||
    		!config.entity_wind_bearing ||
    		!config.entity_wind_speed) {
      throw new Error('Please define entities');
    }
    this.config = config;
  }

  // @TODO: This requires more intelligent logic
  getCardSize() {
    return 3;
  }
}

customElements.define('dark-sky-weather-card', DarkSkyWeatherCard);
