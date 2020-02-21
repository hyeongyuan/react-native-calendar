import React from 'react';
import {View, Text, Dimensions} from 'react-native';

import Day from './components/day';
import XDate from 'xdate';
import {xdateToData, parseDate} from '../utils/interface';
import dateUtils from '../utils/date';

const {width} = Dimensions.get('window');
export default class MonthCalendar extends React.Component {
  constructor(props) {
    super(props);

    this.dayWidth = (width - 40) / 7;

    const year = this.props.month.getFullYear(),
      month = this.props.month.getMonth();
    const days = new Date(year, month + 1, 0).getDate();

    const firstDate = new XDate(year, month, 1, 0, 0, 0, true);
    const lastDate = new XDate(year, month, days, 0, 0, 0, true);

    this.state = {
      selectedDate: this.props.month,
      firstDate,
      lastDate,
    };
  }

  componentWillUnmount() {
    // console.log('componentWillUnmount');
  }

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

  onPressDay = date => {
    const day = parseDate(date);

    const {firstDate, lastDate} = this.state;

    if (!dateUtils.isGTE(day, firstDate) || !dateUtils.isLTE(day, lastDate)) {
      this.props.scrollToDate(day);
    } else {
      this.props.onChangeDate(date);
    }
  };

  renderDay = (day, id) => {
    const today = dateUtils.sameDate(day, XDate.today());
    const selected = dateUtils.sameDate(day, this.props.month);

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
    const {selectedDate} = this.state;
    const {month} = this.props;
    console.log('RENDER MONTH', month);

    const days = dateUtils.monthPage(month);
    const weeks = [];

    while (days.length) {
      weeks.push(this.renderWeek(days.splice(0, 7), weeks.length));
    }

    return <View>{weeks}</View>;
  }
}
