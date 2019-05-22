import React, { Component } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker, Callout } from "react-native-maps";
import { PermissionsAndroid } from "react-native";
import { apiKey } from "./apiKey";
import { initialMarkers } from "./initialMarkers";
import CustomCallout from "./CustomCallout";

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      latitude: null,
      longitude: null,
      error: null,
      locationGranted: null,
      currentWeather: "Loading weather data..."
    };
    this.requestLocationPermission = this.requestLocationPermission.bind(this);
    this.getWeather = this.getWeather.bind(this);
    this.setMarkerRefresh = this.setMarkerRefresh.bind(this);
  }

  componentDidMount() {
    this.requestLocationPermission();
  }

  componentDidUpdate() {
    setTimeout(() => {
      this.currentMarker.showCallout();
    }, 1);
  }

  async getWeather(lat, long) {
    try {
      let response = await fetch(
        `https://api.darksky.net/forecast/${apiKey}/${lat},${long}`
      );
      let responseJson = await response.json();
      let thisHour = responseJson.hourly.data[0];
      this.setState({
        currentWeather: `${thisHour.temperature} ${thisHour.windSpeed} ${
          thisHour.summary
        }`
      });
    } catch (error) {
      console.error(error);
    }
  }

  setMarkerRefresh() {
    setTimeout(() => {
      this.currentMarker.showCallout();
    }, 1000);
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
            this.setState({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              error: null,
              locationGranted: true
            });
            this.getWeather(
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
              latitudeDelta: 0.025,
              longitudeDelta: 0.025
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
