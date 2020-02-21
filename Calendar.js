import React, {Component} from 'react';
import {
  View,
  Text,
  Dimensions,
  PanResponder,
  Animated,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import ViewPager from '@react-native-community/viewpager';
import dateUtils from './dateUtils';
import WeekDays from './WeekDays';

const CAL_MONTHLY = [
  [
    [29, 30, 31, 1, 2, 3, 4],
    [5, 6, 7, 8, 9, 10, 11],
    [12, 13, 14, 15, 16, 17, 18],
    [19, 20, 21, 22, 23, 24, 25],
    [26, 27, 28, 29, 30, 31, 1],
    [2, 3, 4, 5, 6, 7, 8],
  ],
  [
    [26, 27, 28, 29, 30, 31, 1],
    [2, 3, 4, 5, 6, 7, 8],
    [9, 10, 11, 12, 13, 14, 15],
    [16, 17, 18, 19, 20, 21, 22],
    [23, 24, 25, 26, 27, 28, 29],
    [1, 2, 3, 4, 5, 6, 7],
  ],
];
const CAL_WEEKLY = [
  [29, 30, 31, 1, 2, 3, 4],
  [5, 6, 7, 8, 9, 10, 11],
  [12, 13, 14, 15, 16, 17, 18],
  [19, 20, 21, 22, 23, 24, 25],
  [26, 27, 28, 29, 30, 31, 1],
];

const windowSize = Dimensions.get('window');

export default class Calendar extends Component {
  constructor(props) {
    super(props);

    this.viewHeight = windowSize.height;
    this.viewWidth = windowSize.width;

    this.state = {
      selectedDate: 30,
      collapsed: false,
      weekNum: 2,
    };

    this.contentHeight = 0;
    this.dateWidth = (this.viewWidth - 40) / 7;
    this.calendarMove = this.dateWidth * (this.state.weekNum - 1);

    this._animationMoveValue = new Animated.Value(this.calendarMove);

    this.state = {
      selectedDate: 2,
    };
  }

  renderMonth(month) {
    return (
      <View>
        {month.map((week, i) => (
          <View key={i}>{this.renderWeek(week)}</View>
        ))}
      </View>
    );
  }

  renderWeek(week) {
    return (
      <View
        style={{
          flexDirection: 'row',
          marginHorizontal: 20,
        }}>
        {week.map((date, i) => {
          let outOfMonth = true;
          if (i < week.length - 1) {
          }
          return this.renderDate(date);
        })}
      </View>
    );
  }

  renderDate(date) {
    const {selectedDate} = this.state;
    return (
      <TouchableOpacity
        key={date}
        style={{
          width: this.dateWidth,
          height: this.dateWidth,
          alignItems: 'center',
          paddingTop: 5,
          paddingBottom: 15,
        }}
        onPress={() => {}}>
        <View
          style={{
            backgroundColor: selectedDate === date ? 'blue' : 'transparent',
            width: this.dateWidth - 20,
            height: this.dateWidth - 20,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: (this.dateWidth - 20) / 2,
          }}>
          <Text
            style={{
              color: selectedDate === date ? 'white' : 'black',
              fontWeight: '600',
              fontSize: 16,
            }}>
            {date}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <WeekDays />

        <ViewPager
          style={{
            flex: 1,
            position: 'absolute',
            top: -this.dateWidth * (this.state.weekNum - 1),
            transform: [
              {
                translateY: this._animationMoveValue,
              },
            ],
          }}
          initialPage={1}>
          {CAL_MONTHLY.map(month => this.renderMonth(month))}
        </ViewPager>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  viewPager: {
    flex: 1,
  },
});
