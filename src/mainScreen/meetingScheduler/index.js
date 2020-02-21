import React from 'react';
import {
  View,
  Text,
  FlatList,
  Dimensions,
  Animated,
  PanResponder,
  ActivityIndicator,
} from 'react-native';
import MonthCalendar from './monthCalendar';
import WeekCalendar from './weekCalendar';
import Header from './header';
import MeetingList from './meetingList';

import XDate from 'xdate';
import {xdateToData, parseDate} from './utils/interface';

import theme from './theme/color';

const windowSize = Dimensions.get('window');

export default class MeetingScheduler extends React.PureComponent {
  static defaultProps = {
    pastScrollRange: 50,
    futureScrollRange: 50,

    collapsed: false,
  };

  constructor(props) {
    super(props);

    const date = parseDate(props.openDate) || XDate();

    this.viewHeight = windowSize.height;
    this.viewWidth = windowSize.width;

    this.dayWidth = (windowSize.width - 40) / 7;
    this.dayHeight = 40;
    this.visibleWeekCount = 6;
    this.calendarHeight = this.dayHeight * this.visibleWeekCount;

    const {months, monthTexts} = this.getInitialMonth(date);
    const {weeks, weekTexts, weekNumber} = this.getInitialWeek(date);

    this.calendarMove = this.props.collapsed ? 0 : this.dayHeight * weekNumber;
    this._calendarMoveAnimation = new Animated.Value(this.calendarMove);

    this.contentHeight = 0;
    this._contentHeightAnimation = new Animated.Value(this.contentHeight);

    this.listOnTop = true;

    this.state = {
      openDate: date,
      openDateForWeek: date,
      selectedDate: date,
      layout: null,
      collapsed: this.props.collapsed,
      weekNumber,

      months,
      monthTexts,

      weeks,
      weekTexts,
    };

    this._bottomPanResponder = PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return (
          (this.state.collapsed && gestureState.dy > 0 && this.listOnTop) ||
          (!this.state.collapsed && gestureState.dy < 0)
        );
      },
      onPanResponderMove: this.onPanResponderMove,
      onPanResponderRelease: this.onPanResponderRelease,
    });
  }

  onPanResponderMove = (evt, gestureState) => {
    const buffer = 40;
    if (Math.abs(gestureState.dy) > buffer) {
      if (
        Math.abs(gestureState.dy) <= 5 * this.dayHeight &&
        this.viewHeight - this.calendarHeight <=
          this.contentHeight - gestureState.dy &&
        this.viewHeight - this.dayHeight >= this.contentHeight - gestureState.dy
      ) {
        this._contentHeightAnimation.setValue(
          this.contentHeight - gestureState.dy + buffer,
        );
        this._calendarMoveAnimation.setValue(
          this.calendarMove +
            gestureState.dy * (this.state.weekNumber / 5) -
            buffer,
        );
      }
    }
  };

  onPanResponderRelease = (evt, gestureState) => {
    const duration = 300;
    const collapseAnimation = Animated.parallel([
      Animated.timing(this._contentHeightAnimation, {
        toValue: this.viewHeight - this.dayHeight * 1,
        duration,
      }),
      Animated.timing(this._calendarMoveAnimation, {
        toValue: 0,
        duration,
      }),
    ]);

    const expandAnimation = Animated.parallel([
      Animated.timing(this._contentHeightAnimation, {
        toValue: this.viewHeight - this.calendarHeight,
        duration,
      }),
      Animated.timing(this._calendarMoveAnimation, {
        toValue: this.dayHeight * this.state.weekNumber,
        duration,
      }),
    ]);

    console.log('hello');

    if (Math.abs(gestureState.dy) > 40) {
      if (gestureState.vy > 0) {
        expandAnimation.start(() => {
          this.contentHeight = this._contentHeightAnimation._value;
          this.calendarMove = this._calendarMoveAnimation._value;
          this.setState({collapsed: false});
        });
      } else if (gestureState.vy < 0) {
        collapseAnimation.start(() => {
          this.contentHeight = this._contentHeightAnimation._value;
          this.calendarMove = this._calendarMoveAnimation._value;
          this.setState({collapsed: true});
        });
      }
    }
  };

  onLayout = ({nativeEvent}) => {
    this.viewHeight = nativeEvent.layout.height;
    this.viewWidth = nativeEvent.layout.width;

    this.contentHeight =
      nativeEvent.layout.height -
      (this.state.collapsed ? this.dayHeight : this.calendarHeight);
    this._contentHeightAnimation.setValue(this.contentHeight);

    this.calendarMove = this.props.collapsed
      ? 0
      : this.dayHeight * this.state.weekNumber;
    this._calendarMoveAnimation.setValue(this.calendarMove);

    this.setState({
      layout: {
        width: nativeEvent.layout.width,
        height: nativeEvent.layout.height,
      },
    });
  };

  onChangeSelectedDate = date => {
    const {months, weeks, weekTexts, weekNumber, selectedDate} = this.state;
    const nextMonths = months.map(month => {
      if (month.getTime && month.getMonth() === date.getMonth()) {
        return date;
      } else {
        return month;
      }
    });

    let nextWeeks = weeks;
    let nextWeekTexts = weekTexts;
    let nextWeekNumber = weekNumber;
    if (this.getWeekNumber(selectedDate) === this.getWeekNumber(date)) {
      nextWeeks = weeks.map(week => {
        if (week.getTime && week.diffDays(selectedDate) === 0) {
          return date;
        } else {
          return week;
        }
      });
    } else {
      const {weeks, weekTexts, weekNumber} = this.getInitialWeek(date);
      nextWeeks = weeks;
      nextWeekTexts = weekTexts;
      nextWeekNumber = weekNumber;
    }

    this.calendarMove = this.dayHeight * nextWeekNumber;
    this._calendarMoveAnimation.setValue(this.calendarMove);

    this.setState({
      months: nextMonths,
      weeks: nextWeeks,
      weekTexts: nextWeekTexts,
      weekNumber: nextWeekNumber,
      selectedDate: date,
    });
  };

  onChangeSelectedDateInWeek = date => {
    const {months, weeks, selectedDate} = this.state;
    const nextMonths = months.map(month => {
      if (month.getTime && month.getMonth() === date.getMonth()) {
        return date;
      } else {
        return month;
      }
    });

    let nextWeeks = weeks.map(week => {
      if (week.getTime && week.diffDays(selectedDate) === 0) {
        return date;
      } else {
        return week;
      }
    });

    this.setState({
      months: nextMonths,
      weeks: nextWeeks,
      selectedDate: date,
    });
  };

  onScrollToMonth = date => {
    const scrollToIndex = this.getMonthIndex(date);

    const nextMonths = this.state.months.map(month => {
      if (month.getTime && month.getMonth() === date.getMonth()) {
        return date;
      } else {
        return month;
      }
    });

    this.setState({months: nextMonths});

    this.monthCalendarRef.scrollToIndex({
      animated: true,
      index: scrollToIndex,
    });
  };

  onScrollToWeek = date => {
    this.onScrollToMonth(date);

    const scrollToIndex = Math.floor(this.getWeekIndex(date));

    const currentWeekIndex = Math.floor(this.getWeekIndex(date));
    console.log(currentWeekIndex);
    console.log(this.state.weeks[currentWeekIndex]);
    const nextWeeks = this.state.weeks;
    for (let i = -1; i <= 1; i++) {
      nextWeeks[currentWeekIndex + i] = date.clone().addWeeks(i);
    }

    const weekNumber = this.getWeekNumber(date);
    this.calendarMove = this.dayHeight * weekNumber;
    this._calendarMoveAnimation.setValue(this.calendarMove);

    console.log(nextWeeks);

    this.setState({
      weeks: nextWeeks,
      weekNumber,
      selectedDate: date,
    });

    // this.weekCalendarRef.scrollToIndex({
    //   index: scrollToIndex,
    //   animated: false,
    // });

    // const nextWeeks = this.state.weeks.map(week => {
    //   if (week.getTime) {
    //     console.log(week, date);
    //     console.log(week.getWeek(), date.getWeek());
    //     return date;
    //   } else {
    //     return week;
    //   }
    // });

    // console.log(nextWeeks);
  };

  onViewableMonthsChanged = ({viewableItems}) => {
    const {pastScrollRange} = this.props;
    function rowIsCloseToViewable(index, distance) {
      for (let i = 0; i < viewableItems.length; i++) {
        if (Math.abs(index - parseInt(viewableItems[i].index)) <= distance) {
          return true;
        }
      }
      return false;
    }

    const prevMonths = this.state.months;
    const nextMonths = [];
    const visibleMonths = [];

    for (let i = 0; i < prevMonths.length; i++) {
      let val = prevMonths[i];

      const rowShouldBeRendered = rowIsCloseToViewable(i, 1);
      if (rowShouldBeRendered && !prevMonths[i].getTime) {
        if (i === pastScrollRange) {
          val = this.state.openDate
            .clone()
            .addMonths(i - pastScrollRange, true);
        } else {
          val = this.state.openDate
            .clone()
            .addMonths(i - pastScrollRange, true)
            .setDate(1);
        }
      } else if (!rowShouldBeRendered) {
        val = this.state.monthTexts[i];
      }

      nextMonths.push(val);
      if (rowIsCloseToViewable(i, 0)) {
        visibleMonths.push(xdateToData(val));
      }
    }

    let nextWeeks = this.state.weeks;
    let nextWeekTexts = this.state.weekTexts;
    let nextWeekNumber = this.state.weekNumber;
    let nextOpenDateForWeek = this.state.openDateForWeek;
    if (!this.state.collapsed && viewableItems.length === 1) {
      const {weeks, weekTexts, weekNumber} = this.getInitialWeek(
        parseDate(visibleMonths[0]),
      );

      nextWeeks = weeks;
      nextWeekTexts = weekTexts;
      nextWeekNumber = weekNumber;
      nextOpenDateForWeek = parseDate(visibleMonths[0]);

      this.calendarMove = this.dayHeight * weekNumber;
      this._calendarMoveAnimation.setValue(this.calendarMove);

      this.weekCalendarRef.scrollToIndex({
        animated: false,
        index: this.props.pastScrollRange,
      });
    }

    this.setState({
      months: nextMonths,
      weeks: nextWeeks,
      weekTexts: nextWeekTexts,
      weekNumber: nextWeekNumber,
      openDateForWeek: nextOpenDateForWeek,
      selectedDate: parseDate(visibleMonths[0]),
    });
  };

  onViewableWeeksChanged = ({viewableItems}) => {
    function rowIsCloseToViewable(index, distance) {
      for (let i = 0; i < viewableItems.length; i++) {
        if (Math.abs(index - parseInt(viewableItems[i].index)) <= distance) {
          return true;
        }
      }
      return false;
    }

    const prevWeeks = this.state.weeks;
    const nextWeeks = [];
    const visibleWeeks = [];

    for (let i = 0; i < prevWeeks.length; i++) {
      let val = prevWeeks[i];

      const rowShouldBeRendered = rowIsCloseToViewable(i, 1);
      if (rowShouldBeRendered && !prevWeeks[i].getTime) {
        val = this.state.openDateForWeek
          .clone()
          .addWeeks(i - this.props.pastScrollRange);
      } else if (!rowShouldBeRendered) {
        val = this.state.weekTexts[i];
      }

      nextWeeks.push(val);
      if (rowIsCloseToViewable(i, 0)) {
        visibleWeeks.push(xdateToData(val));
      }
    }

    this.onScrollToMonth(parseDate(visibleWeeks[0]));

    this.setState({
      weeks: nextWeeks,
      weekNumber: this.getWeekNumber(parseDate(visibleWeeks[0])),
      selectedDate: parseDate(visibleWeeks[0]),
    });
  };

  getItemLayout = (data, index) => {
    return {
      length: windowSize.width,
      offset: windowSize.width * index,
      index,
    };
  };

  getInitialMonth(xd) {
    const {pastScrollRange, futureScrollRange} = this.props;
    const months = [];
    const monthTexts = [];
    for (let i = 0; i <= pastScrollRange + futureScrollRange; i++) {
      let rangeDate;
      if (i === pastScrollRange) {
        rangeDate = xd.clone().addMonths(i - pastScrollRange, true);
      } else {
        rangeDate = xd
          .clone()
          .addMonths(i - pastScrollRange, true)
          .setDate(1);
      }
      const rangeDateStr = rangeDate.toString('MMM yyyy');

      monthTexts.push(rangeDateStr);

      if (
        (pastScrollRange - 1 <= i && i <= pastScrollRange + 1) ||
        (!pastScrollRange && i <= pastScrollRange + 2)
      ) {
        months.push(rangeDate);
      } else {
        months.push(rangeDateStr);
      }
    }

    return {months, monthTexts};
  }

  getInitialWeek(xd) {
    const {pastScrollRange, futureScrollRange} = this.props;
    const weeks = [];
    const weekTexts = [];
    const weekNumber = this.getWeekNumber(xd);

    for (let i = 0; i <= pastScrollRange + futureScrollRange; i++) {
      const rangeDate = xd.clone().addWeeks(i - pastScrollRange);
      const rangeDateStr = rangeDate.toString('dd MMM yyyy');

      weekTexts.push(rangeDateStr);

      if (
        (pastScrollRange - 1 <= i && i <= pastScrollRange + 1) ||
        (!pastScrollRange && i <= pastScrollRange + 2)
      ) {
        weeks.push(rangeDate);
      } else {
        weeks.push(rangeDateStr);
      }
    }

    return {weeks, weekTexts, weekNumber};
  }

  getMonthIndex(date) {
    let diffMonths = Math.round(
      this.state.openDate
        .clone()
        .setDate(1)
        .diffMonths(date.clone().setDate(1)),
    );

    return diffMonths + this.props.pastScrollRange;
  }

  getWeekIndex(date) {
    let diffWeeks = this.state.openDateForWeek.diffWeeks(date);

    return diffWeeks + this.props.pastScrollRange;
  }

  getWeekNumber(date) {
    let firstDay = date
      .clone()
      .setDate(1)
      .getDay();

    return Math.floor((firstDay - 1 + date.getDate()) / 7);
  }

  renderMonthCalendar = ({item}) => {
    return (
      <MonthCalendar
        item={item}
        dayLayout={{width: this.dayWidth, height: this.dayHeight}}
        onChangeSelectedDate={this.onChangeSelectedDate}
        onScrollToMonth={this.onScrollToMonth}
      />
    );
  };

  renderWeekCalendar = ({item}) => {
    return (
      <WeekCalendar
        item={item}
        dayLayout={{width: this.dayWidth, height: this.dayHeight}}
        onChangeSelectedDate={this.onChangeSelectedDateInWeek}
        onScrollToWeek={this.onScrollToWeek}
      />
    );
  };

  render() {
    const {weekNumber, selectedDate, layout, collapsed} = this.state;
    const initialListSize =
      this.props.pastScrollRange + this.props.futureScrollRange + 1;

    const meetings = this.props.meetings[selectedDate.toString('yyyy-MM-dd')]
      ? this.props.meetings[selectedDate.toString('yyyy-MM-dd')]
      : [];

    return (
      <View style={{flex: 1, backgroundColor: '#fff'}}>
        <Header currentDate={this.state.selectedDate} />
        <View style={{flex: 1}} onLayout={this.onLayout}>
          {layout ? (
            <>
              <Animated.View
                style={{
                  flex: 1,
                  position: 'absolute',
                  top: -this.dayHeight * weekNumber,
                  transform: [
                    {
                      translateY: this._calendarMoveAnimation,
                    },
                  ],
                  backgroundColor: theme.CALENDAR_BACKGROUND,
                }}>
                <FlatList
                  ref={r => (this.monthCalendarRef = r)}
                  data={this.state.months}
                  renderItem={this.renderMonthCalendar}
                  initialListSize={initialListSize}
                  initialScrollIndex={this.getMonthIndex(this.state.openDate)}
                  getItemLayout={this.getItemLayout}
                  showsHorizontalScrollIndicator={false}
                  onViewableItemsChanged={this.onViewableMonthsChanged}
                  horizontal={true}
                  pagingEnabled={true}
                  keyExtractor={(item, index) => String(index)}
                />
                <View
                  style={{
                    height: this.dayHeight,
                    width: layout.width,
                    position: 'absolute',
                    top: this.dayHeight * weekNumber,
                    left: 0,
                    opacity: collapsed ? 1 : 0,
                    zIndex: collapsed ? 100 : -100,
                    backgroundColor: theme.CALENDAR_BACKGROUND,
                  }}>
                  <FlatList
                    ref={r => (this.weekCalendarRef = r)}
                    data={this.state.weeks}
                    renderItem={this.renderWeekCalendar}
                    initialListSize={initialListSize}
                    initialScrollIndex={this.getWeekIndex(
                      this.state.openDateForWeek,
                    )}
                    getItemLayout={this.getItemLayout}
                    showsHorizontalScrollIndicator={false}
                    onViewableItemsChanged={this.onViewableWeeksChanged}
                    horizontal={true}
                    pagingEnabled={true}
                    keyExtractor={(item, index) => String(index)}
                  />
                </View>
              </Animated.View>
              <Animated.View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: layout.width,
                  height: this._contentHeightAnimation,
                  backgroundColor: '#fff',
                  paddingTop: 10,
                  borderTopLeftRadius: 10,
                  borderTopRightRadius: 10,
                }}
                {...this._bottomPanResponder.panHandlers}>
                <MeetingList
                  meetings={meetings}
                  onScrollTop={({listOnTop}) => {
                    this.listOnTop = listOnTop;
                  }}
                />
              </Animated.View>
            </>
          ) : (
            <View
              style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
              <ActivityIndicator />
            </View>
          )}
        </View>
      </View>
    );
  }
}
