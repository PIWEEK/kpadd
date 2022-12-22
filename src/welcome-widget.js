import GObject from "gi://GObject";
import Gtk from "gi://Gtk";
import GLib from "gi://GLib";
import Soup from "gi://Soup?version=2.4";

export const WelcomeWidget = GObject.registerClass(
  {
    GTypeName: "KpaddWelcomeWidget",
    CssName: "welcome",
    Template: "resource:///net/kaleidos/kpadd/gtk/welcome-widget.ui",
    Children: ["grid"],
    InternalChildren: [
      "weatherIcon",
      "weatherCode",
      "weatherMax",
      "weatherMin",
      "dateDayName",
      "dateYMD",
    ],
  },
  class extends Gtk.Widget {
    constructor() {
      super();

      this.getWeather();
      this.getDate();
    }

    getDate() {
      const dayName = GLib.DateTime.new_now_local().format("%A");
      const dayNum = GLib.DateTime.new_now_local().format("%e");
      const monthName = GLib.DateTime.new_now_local().format("%B");
      const yearNum = GLib.DateTime.new_now_local().format("%Y");

      const date = `${dayNum} ${monthName} ${yearNum}`;

      this._dateDayName.set_text(dayName);
      this._dateYMD.set_text(date);
    }

    getWeather() {
      const session = new Soup.Session();
      const url =
        "https://api.open-meteo.com/v1/forecast?latitude=40.60&longitude=-3.71&daily=weathercode,temperature_2m_max,temperature_2m_min&current_weather=true&timezone=Europe%2FBerlin";
      // const uri = GLib.Uri.parse(url, GLib.UriFlags.NONE);

      const message = new Soup.Message({
        method: "GET",
        uri: new Soup.URI(url),
      });
      // message.request_headers.append("Content-Type", "application/json");

      session.queue_message(message, (session, message) => {
        const data = JSON.parse(message.response_body.data);

        this.setMaxWeather(data.daily.temperature_2m_max);
        this.setMinWeather(data.daily.temperature_2m_min);
        this.setWeatherDescription(data.current_weather.weathercode);
      });
    }

    setMaxWeather(maxWeatherList) {
      const weatherMax = Math.max(...maxWeatherList);
      this._weatherMax.set_text(`${weatherMax}°`);
    }

    setMinWeather(minWeatherList) {
      const weatherMin = Math.min(...minWeatherList);
      this._weatherMin.set_text(`${weatherMin}°`);
    }

    setWeatherDescription(weathercode) {
      let weatherCondition = "Unknown";
      let weatherIcon = "clear";
      switch (weathercode) {
        case 0:
          weatherCondition = "Clear sky";
          weatherIcon = "clear";
          break;
        case 1:
        case 2:
        case 3:
          weatherCondition = "Partly cloudy";
          weatherIcon = "few-clouds";
          break;
        case 45:
        case 48:
          weatherCondition = "Fog";
          weatherIcon = "fog";
          break;
        case 51:
        case 53:
        case 55:
        case 56:
        case 57:
          weatherCondition = "Drizzle";
          weatherIcon = "overcast";
          break;
        case 61:
        case 63:
        case 65:
        case 66:
        case 67:
          weatherCondition = "Rain";
          weatherIcon = "showers-scattered";
          break;
        case 71:
        case 73:
        case 75:
        case 77:
          weatherCondition = "Snow";
          weatherIcon = "snow";
          break;
        case 80:
        case 81:
        case 82:
        case 85:
        case 86:
          weatherCondition = "Rain showers";
          weatherIcon = "showers";
          break;
        case 95:
        case 96:
        case 99:
          weatherCondition = "Thunderstorm";
          weatherIcon = "storm";
          break;
        default:
          weatherCondition = "Unknown";
          weatherIcon = "clear";
      }

      this._weatherCode.set_text(weatherCondition);
      this._weatherIcon.set_from_icon_name(`weather-${weatherIcon}-symbolic`);
    }
  }
);
