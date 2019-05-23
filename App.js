import React, { Component } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import MapView, {
  PROVIDER_GOOGLE,
  Marker,
  Callout,
  Polyline
} from "react-native-maps";
import { PermissionsAndroid } from "react-native";
import { apiKey } from "./apiKey";
import {
  initialMarkers,
  initialMarkersArray,
  epiLat,
  epiLong
} from "./initialMarkers";
import CustomCallout from "./CustomCallout";
import { linear, round } from "./regression";

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      latitude: null,
      longitude: null,
      error: null,
      locationGranted: null,
      currentWeather: "Loading weather data...",
      predictLine: null,
      predictionPoints: null,
      predictionWeather: [
        "Loading weather data...",
        "Loading weather data...",
        "Loading weather data...",
        "Loading weather data...",
        "Loading weather data..."
      ]
    };
    this.requestLocationPermission = this.requestLocationPermission.bind(this);
    this.getCurrentWeather = this.getCurrentWeather.bind(this);
    this.setMarkerRefresh = this.setMarkerRefresh.bind(this);
    this.getPolyPoints = this.getPolyPoints.bind(this);
    this.getPredictionPoints = this.getPredictionPoints.bind(this);
    this.getPredictedWeather = this.getPredictedWeather.bind(this);
  }

  componentDidMount() {
    this.requestLocationPermission();
  }

  componentDidUpdate() {
    this.setMarkerRefresh();
  }

  async getCurrentWeather(lat, long) {
    try {
      let response = await fetch(
        `https://api.darksky.net/forecast/${apiKey}/${lat},${long}`
      );
      let responseJson = await response.json();
      let thisHour = responseJson.hourly.data[0];
      this.setState({
        currentWeather: `Weather: ${thisHour.summary} Temperature: ${
          thisHour.temperature
        }F`
      });
    } catch (error) {
      console.error(error);
    }
  }

  async getPredictedWeather() {
    try {
      let weatherArray = [];
      for (let coord of this.state.predictionPoints) {
        let response = await fetch(
          `https://api.darksky.net/forecast/${apiKey}/${coord.latitude},${
            coord.longitude
          }`
        );
        let responseJson = await response.json();
        let thisHour = responseJson.hourly.data[0];
        weatherArray.push(
          `Weather: ${thisHour.summary} Temperature: ${thisHour.temperature}F`
        );
      }
      this.setState({ predictionWeather: weatherArray });
    } catch (error) {
      console.error(error);
    }
  }

  setMarkerRefresh() {
    setTimeout(() => {
      this.currentMarker.showCallout();
    }, 1000);
  }

  getPolyPoints(data, currentLat, currentLong) {
    let dataWithCurrent = data.slice();
    dataWithCurrent.push([currentLong, currentLat]);
    let result = linear(dataWithCurrent, 5);
    let firstPoint = {
      latitude: result.predict(epiLong - 1.65)[1],
      longitude: result.predict(epiLong - 1.65)[0]
    };
    let secondPoint = {
      latitude: result.predict(epiLong + 1.65)[1],
      longitude: result.predict(epiLong + 1.65)[0]
    };
    return [firstPoint, secondPoint];
  }

  getPredictionPoints(data, currentLat, currentLong) {
    let dataWithCurrent = data.slice();
    dataWithCurrent.push([currentLong, currentLat]);
    let result = linear(dataWithCurrent, 5);
    let firstPoint = {
      latitude: result.predict(epiLong + 1.65 * 0.2)[1],
      longitude: result.predict(epiLong + 1.65 * 0.2)[0]
    };
    let secondPoint = {
      latitude: result.predict(epiLong + 1.65 * 0.4)[1],
      longitude: result.predict(epiLong + 1.65 * 0.4)[0]
    };
    let thirdPoint = {
      latitude: result.predict(epiLong + 1.65 * 0.6)[1],
      longitude: result.predict(epiLong + 1.65 * 0.6)[0]
    };
    let fourthPoint = {
      latitude: result.predict(epiLong + 1.65 * 0.8)[1],
      longitude: result.predict(epiLong + 1.65 * 0.8)[0]
    };
    let fifthPoint = {
      latitude: result.predict(epiLong + 1.65)[1],
      longitude: result.predict(epiLong + 1.65)[0]
    };
    return [firstPoint, secondPoint, thirdPoint, fourthPoint, fifthPoint];
  }

  async requestLocationPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Location Permission",
          message:
            "This app needs access to your location to provide you location data.",
          buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        navigator.geolocation.getCurrentPosition(
          position => {
            this.setState(
              {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                error: null,
                locationGranted: true,
                predictLine: this.getPolyPoints(
                  initialMarkersArray,
                  position.coords.latitude,
                  position.coords.longitude
                ),
                predictionPoints: this.getPredictionPoints(
                  initialMarkersArray,
                  position.coords.latitude,
                  position.coords.longitude
                )
              },
              () => this.getPredictedWeather()
            );
            this.getCurrentWeather(
              position.coords.latitude,
              position.coords.longitude
            );
          },
          error => this.setState({ error: error.message }),
          { enableHighAccuracy: true, timeout: 200000, maximumAge: 1000 }
        );
      } else {
        this.setState({ locationGranted: false });
      }
    } catch (err) {
      console.warn(err);
    }
  }

  render() {
    if (this.state.locationGranted === false) {
      return (
        <View>
          <Text> Please enable location to use this app. </Text>
        </View>
      );
    } else if (this.state.latitude === null || this.state.longitude === null) {
      return (
        <View>
          <Text> {this.state.error} </Text>
        </View>
      );
    } else {
      return (
        <View style={styles.container}>
          <MapView
            provider={PROVIDER_GOOGLE} // remove if not using Google Maps
            style={styles.map}
            region={{
              latitude: this.state.latitude,
              longitude: this.state.longitude,
              latitudeDelta: 3.5,
              longitudeDelta: 3.5
            }}
          >
            <Marker
              coordinate={{
                latitude: this.state.latitude,
                longitude: this.state.longitude
              }}
              ref={ref => {
                this.currentMarker = ref;
              }}
            >
              <Callout tooltip={true}>
                <CustomCallout>
                  <Text style={{ color: "white", textAlign: "center" }}>
                    {this.state.currentWeather}
                  </Text>
                </CustomCallout>
              </Callout>
            </Marker>
            {initialMarkers.map((marker, index) => {
              return (
                <Marker coordinate={marker} pinColor={"blue"} key={index}>
                  <Callout tooltip={true}>
                    <CustomCallout>
                      <Text style={{ color: "white", textAlign: "center" }}>
                        Past Location {index + 1}
                      </Text>
                    </CustomCallout>
                  </Callout>
                </Marker>
              );
            })}
            {this.state.predictionPoints.map((coord, index) => {
              return (
                <Marker coordinate={coord} pinColor={"green"} key={index}>
                  <Callout tooltip={true}>
                    <CustomCallout>
                      <Text style={{ color: "white", textAlign: "center" }}>
                        {this.state.predictionWeather[index]}
                      </Text>
                    </CustomCallout>
                  </Callout>
                </Marker>
              );
            })}
            <Polyline
              coordinates={[
                this.state.predictLine[0],
                this.state.predictLine[1]
              ]}
              strokeWidth={3}
              strokeColor={"green"}
            />
          </MapView>
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    justifyContent: "flex-end",
    alignItems: "center"
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  customView: {
    width: 140,
    height: 140
  }
});
