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
      this.props.onScrollToMonth(date);
    } else {
      this.props.onChangeSelectedDate(date);
    }
  };

  renderWeek(days, id) {
    const week = [];
    days.forEach((day, id2) => {
      week.push(this.renderDay(day, id2));
    }, this);

    return (
      <View
        key={id}
        style={{
          flexDirection: 'row',
          marginHorizontal: 20,
        }}>
        {week}
      </View>
    );
  }

  renderDay = (day, id) => {
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

    console.log('RENDER out of month!!!!!');

    if (!item.getTime) {
      return (
        <View
          style={{
            width: width,
            height: width,
            backgroundColor: theme.CALENDAR_BACKGROUND,
          }}>
          <Text>Out of Moth</Text>
        </View>
      );
    }

    const days = dateUtils.monthPage(item);
    const weeks = [];
    while (days.length) {
      weeks.push(this.renderWeek(days.splice(0, 7), weeks.length));
    }

    console.log('RENDER Month calendar ', item);

    return (
      <View
        style={{
          width: width,
          height: width,
          backgroundColor: theme.CALENDAR_BACKGROUND,
        }}>
        {weeks}
      </View>
    );
  }
}
