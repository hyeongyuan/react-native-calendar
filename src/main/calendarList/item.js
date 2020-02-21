import React from 'react';
import {View, Text, Dimensions} from 'react-native';

import {xdateToData, parseDate} from '../interface';
import dateUtils from '../dateUtils';
import XDate from 'xdate';

import Calendar from '../calendar';

const windowSize = Dimensions.get('window');

export default class CalendarListItem extends React.Component {
  constructor(props) {
    super(props);

    this.dayWidth = (windowSize.width - 40) / 7;

    this.state = {
      currentMonth: props.current ? parseDate(props.current) : XDate(),
    };
  }

  shouldComponentUpdate(nextProps) {
    const c = this.state.currentMonth;
    const s1 = this.props.selected;
    const s2 = nextProps.selected;
    const r1 = this.props.row;
    const r2 = nextProps.row;

    return (
      (this.isSameYearMonth(r1, s2) &&
        !this.isSameDay(s1, s2) &&
        this.props.isMonth) ||
      !this.isSameYearMonth(r1, r2) ||
      !!(r2.propbump && r2.propbump !== r1.propbump)
    );
  }

  isSameYearMonth(date1, date2) {
    return date1.toString('yyyy MM') === date2.toString('yyyy MM');
  }

  isSameDay(date1, date2) {
    return date1.toString('dd') === date2.toString('dd');
  }

  render() {
    const {isMonth, row} = this.props;
    if (row.getTime) {
      return (
        <Calendar
          isMonth={isMonth}
          current={row}
          onChangeSelectedDate={this.props.onChangeSelectedDate}
          selected={this.props.selected}
        />
      );
    } else {
      const text = row.toString();
      return (
        <View style={{height: 100, width: windowSize.width}}>
          <Text>{text}</Text>
        </View>
      );
    }
  }
}
