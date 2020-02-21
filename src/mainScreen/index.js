import React from 'react';
import {SafeAreaView, Text} from 'react-native';
// import MeetingCalendar from './meetingCalendar';
import MeetingScheduler from './meetingScheduler';

const dummy = {
  '2020-02-01': [{title: '회의방1'}, {title: '회의방2'}],
  '2020-02-06': [
    {title: '회의방1'},
    {title: '회의방2'},
    {title: '회의방3'},
    {title: '회의방4'},
    {title: '회의방5'},
    {title: '회의방6'},
    {title: '회의방7'},
    {title: '회의방8'},
  ],
  '2020-03-01': [],
};

export default class MainScreen extends React.Component {
  render() {
    return (
      <SafeAreaView style={{flex: 1}}>
        {/* <MeetingCalendar /> */}
        <MeetingScheduler
          openDate={'2020-02-19'}
          collapsed={true}
          meetings={dummy}
        />
      </SafeAreaView>
    );
  }
}
