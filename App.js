/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Alert, PermissionsAndroid } from 'react-native';
import MapView, {PROVIDER_GOOGLE} from "react-native-maps";
import DeviceInfo from "react-native-device-info";
// import Geolocation from "react-native-geolocation-service";
import TimerMixin from "react-timer-mixin";

mixins: [TimerMixin];

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

type Props = {};
export default class App extends Component<Props> {
  state = {
    users: [],
    circleLatitude: 33.77065956,
    circleLongitude: -84.39161369

  }

  componentDidMount() {
    this.requestLocationPermission();
    this.interval = setInterval(() => this.update(), 10000); //6 seconds
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  async update() {
    console.log("hi")
    this.getMarkers()
    this.updateLocation()
  }

  async getMarkers() {
    fetch(`http://9633b07b.ngrok.io/users/user/${DeviceInfo.getUniqueID()}/circle`)
      .then((response) => {
        console.log(response)
        console.log(JSON.stringify(response))
        return response.json()
      })
      .then((responseJson) => {
        var markers = []
        console.log(responseJson)
        for (var i = 0; i < responseJson.locations.length; i++) {
          const u = {
            coordinate: {
              latitude: responseJson.locations[i][0],
              longitude: responseJson.locations[i][1]
            }
          }
          markers.push(u)
        }
        this.setState({
          users: markers,
          circleLatitude: responseJson.centroid[0],
          circleLongitude: responseJson.centroid[1]
        })
      })
  }

  async updateLocation() {
    // get location, make update request
    try {
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      if (granted) {
        console.log("You can use the ACCESS_FINE_LOCATION");
        navigator.geolocation.getCurrentPosition(
          position => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            fetch(`http://9633b07b.ngrok.io/users/user/${DeviceInfo.getUserId()}`, {
              method: "PUT",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                id: DeviceInfo.getUniqueID(),
                latitude: latitude,
                longitude: longitude
              })
            })
              .then(() => {
                return fetch(
                  `http://9633b07b.ngrok.io/users/user/${DeviceInfo.getUniqueID()}/circle`
                );
              })
              .then(response => {
                console.log(response);
                console.log(JSON.stringify(response));
                return response.json();
              })
              .then(responseJson => {
                var markers = [];
                console.log(responseJson);
                for (var i = 0; i < responseJson.locations.length; i++) {
                  const u = {
                    coordinate: {
                      latitude: responseJson.locations[i][0],
                      longitude: responseJson.locations[i][1]
                    }
                  };
                  markers.push(u);
                }
                this.setState({
                  users: markers,
                  circleLatitude: responseJson.centroid[0],
                  circleLongitude: responseJson.centroid[1]
                });
              })
              .catch(err => {
                console.log(DeviceInfo.getUniqueID());
                console.log(err);
              });
          },
          error => Alert.alert(error.message),
          { enableHighAccuracy: true, timeout: 20000 }
        );
      } else {
        console.log("ACCESS_FINE_LOCATION permission denied");
      }
    } catch (err) {
      console.warn(err);
    }
  }

  async requestLocationPermission() {
  try {
    const granted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    if (granted) {
      console.log("You can use the ACCESS_FINE_LOCATION");
      navigator.geolocation.getCurrentPosition(
        position => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          fetch("http://9633b07b.ngrok.io/users/user", {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              id: DeviceInfo.getUniqueID(),
              latitude: latitude,
              longitude: longitude
            })
          }).then(() => {
            return fetch(`http://9633b07b.ngrok.io/users/user/${DeviceInfo.getUniqueID()}/circle`)
          })
            .then((response) => {
              console.log(response)
              console.log(JSON.stringify(response))
              return response.json()
            })
            .then((responseJson) => {
              var markers = []
              console.log(responseJson)
              for (var i = 0; i < responseJson.locations.length; i++) {
                const u = {
                  coordinate: {
                    latitude: responseJson.locations[i][0],
                    longitude: responseJson.locations[i][1]
                  }
                }
                markers.push(u)
              }
              this.setState({
                users: markers,
                circleLatitude: responseJson.centroid[0],
                circleLongitude: responseJson.centroid[1]
              })
            })
            .catch(err => {
              console.log(DeviceInfo.getUniqueID())
              console.log(err)
            })
              
        },
        error => Alert.alert(error.message),
        { enableHighAccuracy: true, timeout: 20000 }
      );
    } else {
      console.log("ACCESS_FINE_LOCATION permission denied");
    }
  } catch (err) {
    console.warn(err);
  }
}

  render() {
    return (
      <MapView
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        region={{
          latitude: this.state.circleLatitude,
          longitude: this.state.circleLongitude,
          latitudeDelta: 0.009,
          longitudeDelta: 0.004
        }}
      >
        {this.state.users.map((marker, index) => {
          return (
            <MapView.Marker
              key={index}
              coordinate={marker.coordinate}
              pinColor="blue"
            />
          );
        })}
        <MapView.Marker
          coordinate={{
            latitude: this.state.circleLatitude,
            longitude: this.state.circleLongitude
          }}
        />
        <MapView.Circle
          center={{
            latitude: this.state.circleLatitude,
            longitude: this.state.circleLongitude
          }}
          radius={150}
          fillColor={"rgba(68,85,90,0.5)"}
        />
      </MapView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
