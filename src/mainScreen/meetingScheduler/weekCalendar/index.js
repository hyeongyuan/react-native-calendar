import React from 'react';
import {View, Text, Dimensions} from 'react-native';

import {xdateToData, parseDate} from '../utils/interface';
import dateUtils from '../utils/date';
import XDate from 'xdate';

import Day from './day';
import theme from '../theme/color';

const {width} = Dimensions.get('window');

export default class MonthCalendar extends React.Component {
  constructor(props) {
    super(props);
    const date = props.item;

    if (date.getTime) {
      const year = date.getFullYear(),
        month = date.getMonth();
      const days = new Date(year, month + 1, 0).getDate();

      this.firstDate = new XDate(year, month, 1, 0, 0, 0, true);
      this.lastDate = new XDate(year, month, days, 0, 0, 0, true);
    }

    this.state = {
      selectedDate: date,
    };
  }

  shouldComponentUpdate(nextProps) {
    const prevDate = this.props.item;
    const nextDate = nextProps.item;

    if (nextDate.getTime) {
      const year = nextDate.getFullYear(),
        month = nextDate.getMonth();
      const days = new Date(year, month + 1, 0).getDate();

      this.firstDate = new XDate(year, month, 1, 0, 0, 0, true);
      this.lastDate = new XDate(year, month, days, 0, 0, 0, true);
    }

    return prevDate.toString('dd yyyy MM') !== nextDate.toString('dd yyyy MM');
  }

  onPressDay = date => {
    if (
      (this.firstDate && !dateUtils.isGTE(date, this.firstDate)) ||
      (this.lastDate && !dateUtils.isLTE(date, this.lastDate))
    ) {
      this.props.onScrollToWeek(date);
    } else {
      this.props.onChangeSelectedDate(date);
    }
  };

  renderDay = (day, id) => {
    const {firstDate, lastDate} = this.state;
    const today = dateUtils.sameDate(day, XDate.today());
    const selected = dateUtils.sameDate(day, this.props.item);

    let state = '';
    if (
      (this.firstDate && !dateUtils.isGTE(day, this.firstDate)) ||
      (this.lastDate && !dateUtils.isLTE(day, this.lastDate))
    ) {
      state = 'disabled';
    } else if (dateUtils.sameDate(day, XDate())) {
      state = 'today';
    }

    return (
      <Day
        key={id}
        state={state}
        selected={selected}
        day={day}
        layout={this.props.dayLayout}
        onPress={this.onPressDay}
      />
    );
  };

  render() {
    const {item} = this.props;

    console.log('RENDER out of week!!!!!');

    if (!item.getTime) {
      return (
        <View
          style={{
            width: width,
            height: width,
            backgroundColor: theme.CALENDAR_BACKGROUND,
          }}>
          <Text>Out of Week</Text>
        </View>
      );
    }

    const days = dateUtils.weekPage(item);

    const week = [];
    days.forEach((day, i) => {
      week.push(this.renderDay(day, i));
    }, this);

    console.log('RENDER Week calendar ', item);

    return (
      <View
        style={{
          flexDirection: 'row',
          marginHorizontal: 20,
        }}>
        {week}
      </View>
    );
  }
}
