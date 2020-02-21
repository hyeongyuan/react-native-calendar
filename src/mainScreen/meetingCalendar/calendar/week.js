import React from 'react';
import {View, Text, Dimensions} from 'react-native';
import XDate from 'xdate';

import Day from './components/day';

import dateUtils from '../utils/date';

const {width} = Dimensions.get('window');
export default class WeekCalendar extends React.Component {
  constructor(props) {
    super(props);

    this.dayWidth = (width - 40) / 7;

    const {firstDate, lastDate} = this.getMonthRange(this.props.week);

    this.state = {
      selectedDate: this.props.week,
      firstDate,
      lastDate,
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.week.getMonth() !== prevState.selectedDate.getMonth()) {
      const year = nextProps.week.getFullYear(),
        month = nextProps.week.getMonth();
      const days = new Date(year, month + 1, 0).getDate();

      const firstDate = new XDate(year, month, 1, 0, 0, 0, true);
      const lastDate = new XDate(year, month, days, 0, 0, 0, true);

      return {firstDate, lastDate};
    }

    return null;
  }

  getMonthRange(xd) {
    const year = xd.getFullYear(),
      month = xd.getMonth();
    const days = new Date(year, month + 1, 0).getDate();

    const firstDate = new XDate(year, month, 1, 0, 0, 0, true);
    const lastDate = new XDate(year, month, days, 0, 0, 0, true);

    return {firstDate, lastDate};
  }

  onPressDay = date => {
    this.props.onChangeDate(date);
    // this._handleDayInteraction(date, this.props.onDayPress);
  };

  renderDay = (day, id) => {
    const today = dateUtils.sameDate(day, XDate.today());
    const selected = dateUtils.sameDate(day, this.props.week);

    let state = '';
    if (
      !dateUtils.isGTE(day, this.state.firstDate) ||
      !dateUtils.isLTE(day, this.state.lastDate)
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
        layout={{
          width: this.dayWidth,
          height: this.dayWidth,
        }}
        onPress={this.onPressDay}
      />
    );
  };

  render() {
    const weekDate = this.props.week;
    const days = dateUtils.weekPage(weekDate);
    console.log('RENDER WEEK', weekDate);

    const week = [];
    days.forEach((day, i) => {
      week.push(this.renderDay(day, i));
    }, this);

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
