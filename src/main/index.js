import React from 'react';
import {SafeAreaView, Text} from 'react-native';
import CalendarList from './calendarList';

export default class Main extends React.Component {
  render() {
    return (
      <SafeAreaView style={{flex: 1}}>
        <CalendarList current={'2020-02-11'}>
          <Text>내용</Text>
        </CalendarList>
      </SafeAreaView>
    );
  }
}
