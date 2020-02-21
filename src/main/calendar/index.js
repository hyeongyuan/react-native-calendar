import React from 'react';
import {View, Text, Dimensions, TouchableOpacity} from 'react-native';
import Day from './day';

import {xdateToData, parseDate} from '../interface';
import XDate from 'xdate';
import dateUtils from '../dateUtils';

const windowSize = Dimensions.get('window');

export default class Calendar extends React.Component {
  constructor(props) {
    super(props);

    this.dayWidth = (windowSize.width - 40) / 7;

    const year = props.current.getFullYear();
    const month = props.current.getMonth();
    const days = new Date(year, month + 1, 0).getDate();

    const firstDay = new XDate(year, month, 1, 0, 0, 0, true);
    const lastDay = new XDate(year, month, days, 0, 0, 0, true);

    this.state = {
      firstDay,
      lastDay,

      currentMonth: props.current ? parseDate(props.current) : XDate(),
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const current = parseDate(nextProps.current);
    if (
      current &&
      current.toString('yyyy MM') !==
        this.state.currentMonth.toString('yyyy MM')
    ) {
      this.setState({
        currentMonth: current.clone(),
      });
    }
  }

  renderMonth(days) {
    const weeks = [];

    while (days.length) {
      weeks.push(this.renderWeek(days.splice(0, 7), weeks.length));
    }

    return <View>{weeks}</View>;
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

  onPress = day => {
    this.props.onChangeSelectedDate(day);
  };

  renderDay(day, id) {
    const today = day.diffDays(XDate.today()) === 0;
    const selected = day.diffDays(this.props.selected) === 0;

    let state = '';
    if (
      !dateUtils.isGTE(day, this.state.firstDay) ||
      !dateUtils.isLTE(day, this.state.lastDay)
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
        onPress={this.onPress}
      />
    );
  }

  render() {
    if (this.props.isMonth) {
      const days = dateUtils.monthPage(this.state.currentMonth);
      return this.renderMonth(days);
    } else {
      const days = dateUtils.weekPage(this.state.currentMonth);
      return this.renderWeek(days);
    }
  }
}
