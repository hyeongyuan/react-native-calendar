import React from 'react';
import {View, Text, Dimensions} from 'react-native';

import {xdateToData, parseDate} from '../utils/interface';
import dateUtils from '../utils/date';
import XDate from 'xdate';

import MonthCalendar from './month';
import WeekCalendar from './week';
import theme from '../theme/color';
const {width} = Dimensions.get('window');
export default class Calendar extends React.Component {
  shouldComponentUpdate(nextProps) {
    const prevDate = this.props.item;
    const nextDate = nextProps.item;

    return prevDate.toString('dd yyyy MM') !== nextDate.toString('dd yyyy MM');
  }

  render() {
    const {isMonth, item, selectedDate} = this.props;
    console.log('RENDER CONTAINER', item);

    return (
      <View
        style={{
          width: width,
          height: width,
          backgroundColor: theme.CALENDAR_BACKGROUND,
        }}>
        {!item.getTime ? (
          <Text>Out of Moth</Text>
        ) : isMonth ? (
          <MonthCalendar
            month={item}
            date={selectedDate}
            scrollToDate={this.props.scrollToDate}
            onChangeDate={this.props.onChangeSelectedDate}
          />
        ) : (
          <WeekCalendar
            week={item}
            onChangeDate={this.props.onChangeSelectedDate}
          />
        )}
      </View>
    );
  }
}
