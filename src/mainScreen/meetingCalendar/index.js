import React from 'react';
import {
  View,
  Text,
  FlatList,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import Calendar from './calendar';
import Header from './header';
import MeetingList from './meetingList';

import XDate from 'xdate';
import {xdateToData, parseDate} from './utils/interface';

import theme from './theme/color';

const windowSize = Dimensions.get('window');

const dummy = {
  '2020-02-01': [{title: '회의방1'}, {title: '회의방2'}],
  '2020-02-06': [{title: '회의방1'}, {title: '회의방2'}, {title: '회의방3'}],
  '2020-03-01': [],
};

export default class MeetingCalendar extends React.Component {
  static defaultProps = {
    pastScrollRange: 50,
    futureScrollRange: 50,
  };

  constructor(props) {
    super(props);

    this.viewHeight = windowSize.height;
    this.viewWidth = windowSize.width;

    this.dayWidth = (windowSize.width - 40) / 7;
    this.dayHeight = 42.7;
    this.showWeeks = 6;
    this.calendarHeight = this.dayHeight * this.showWeeks;

    const date = parseDate(props.openDate) || XDate();

    const {months, monthTexts} = this.getInitialMonth(date);
    const {weeks, weekTexts} = this.getInitialWeek(date);

    this.state = {
      months,
      monthTexts,

      weeks,
      weekTexts,

      openDate: date,
      openWeek: date,
      currentMonth: date,
      currentWeek: date,

      selectedDate: date,

      weekCount: this.getWeekNumber(date),
      collapsed: true,
    };

    this.listOnTop = true;

    this.contentHeight = this.viewHeight - this.calendarHeight;
    this._contentHeightAnimation = new Animated.Value(
      this.state.collapsed
        ? this.viewHeight - this.dayHeight
        : this.contentHeight,
    );

    this.calendarMove = this.dayHeight * this.state.weekCount;
    this._calendarMoveAnimation = new Animated.Value(this.calendarMove);

    this._bottomPanResponder = PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const {collapsed} = this.state;
        return (
          (collapsed && gestureState.dy > 0 && this.listOnTop) ||
          (!collapsed && gestureState.dy < 0)
        );
      },
      onPanResponderMove: this.onPanResponderMove,
      onPanResponderRelease: this.onPanResponderRelease,
    });
  }

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

    return {weeks, weekTexts};
  }

  initializeWeekCalendar = date => {
    const weekCount = this.getWeekNumber(date);

    this._calendarMoveAnimation.setValue(this.dayHeight * weekCount);
    this.calendarMove = this._calendarMoveAnimation._value;

    this.weekCalendarRef.scrollToIndex({
      animated: false,
      index: this.props.pastScrollRange,
    });

    return {
      weekCount,
      ...this.getInitialWeek(date),
    };
  };

  onLayout = ({nativeEvent}) => {
    this.viewHeight = nativeEvent.layout.height;
    this.viewWidth = nativeEvent.layout.width;

    this.contentHeight = this.viewHeight - this.calendarHeight;

    this._contentHeightAnimation.setValue(
      this.state.collapsed
        ? this.viewHeight - this.dayHeight
        : this.viewHeight - this.calendarHeight,
    );
  };

  onPanResponderMove = (evt, gestureState) => {
    if (
      Math.abs(gestureState.dy) <= 5 * this.dayHeight &&
      this.viewHeight - this.calendarHeight <=
        this.contentHeight - gestureState.dy &&
      this.viewHeight - this.dayHeight >= this.contentHeight - gestureState.dy
    ) {
      this._contentHeightAnimation.setValue(
        this.contentHeight - gestureState.dy,
      );
      this._calendarMoveAnimation.setValue(
        this.calendarMove + gestureState.dy * (this.state.weekCount / 5),
      );
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
        toValue: this.dayHeight * this.state.weekCount,
        duration,
      }),
    ]);

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

    let nextState = {
      months: nextMonths,
      selectedDate: parseDate(visibleMonths[0]),
    };

    if (viewableItems.length === 1 && !this.state.collapsed) {
      const openWeek = viewableItems[0].item;
      const weekCount = this.getWeekNumber(openWeek);

      this._calendarMoveAnimation.setValue(this.dayHeight * weekCount);
      this.calendarMove = this._calendarMoveAnimation._value;

      this.weekCalendarRef.scrollToIndex({
        animated: false,
        index: 50,
      });

      nextState = {
        weekCount,
        openWeek,
        ...nextState,
        ...this.getInitialWeek(openWeek),
      };
    }

    this.setState(nextState);
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
        val = this.state.openWeek
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

    let nextMonths;
    // if (viewableItems.length === 1) {
    //   this.scrollToMonth(viewableItems[0].item);
    //   nextMonths = this.state.months.map(month => {
    //     if (
    //       month.getTime &&
    //       month.getMonth() === viewableItems[0].item.getMonth()
    //     ) {
    //       return viewableItems[0].item;
    //     } else {
    //       return month;
    //     }
    //   });
    //   //   this.onSelectedDateChanged(viewableItems[0].item);
    // }

    this.setState({
      weeks: nextWeeks,
      months: nextMonths ? nextMonths : this.state.months,
      weekCount: this.getWeekNumber(viewableItems[0].item),
      currentWeek: parseDate(visibleWeeks[0]),
      selectedDate: viewableItems[0].item,
    });
  };

  onSelectedDateChangedInMonth = date => {
    const nextState = {
      openWeek: date,
      selectedDate: date,
    };

    nextState.months = this.state.months.map(month => {
      if (month.getTime && month.getMonth() === date.getMonth()) {
        return date;
      } else {
        return month;
      }
    });

    let weeksClone = this.state.weeks;
    const centerDate = weeksClone[50];
    if (this.getWeekNumber(centerDate) === this.getWeekNumber(date)) {
      for (let i = -1; i <= 1; i++) {
        weeksClone[this.props.pastScrollRange + i] = date.clone().addWeeks(i);
      }

      nextState.weeks = weeksClone;
    } else {
      const {weekCount, weekTexts, weeks} = this.initializeWeekCalendar(date);
      nextState.weeks = weeks;
      nextState.weekTexts = weekTexts;
      nextState.weekCount = weekCount;
    }

    this.setState(nextState);
  };

  onSelectedDateChangedInWeek = date => {
    const nextState = {
      selectedDate: date,
      openWeek: date,
    };
    nextState.months = this.state.months.map(month => {
      if (month.getTime && month.getMonth() === date.getMonth()) {
        return date;
      } else {
        return month;
      }
    });

    let diffDays = Math.floor(this.state.selectedDate.diffDays(date));
    nextState.weeks = this.state.weeks.map(week => {
      if (week.getTime) {
        return week.clone().addDays(diffDays);
      } else {
        return week;
      }
    });

    this.setState(nextState);
  };

  onScrollToMonth = xd => {
    const day = parseDate(xd);
    const scrollToIndex = this.getMonthIndex(day);

    const nextMonths = this.state.months.map(month => {
      if (month.getTime && month.getMonth() === day.getMonth()) {
        return day;
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

  getItemLayout = (data, index) => {
    return {
      length: this.viewWidth,
      offset: this.viewWidth * index,
      index,
    };
  };

  scrollToMonth(m) {
    const month = parseDate(m);
    const scrollTo = month || this.state.openDate;
    const scrollToIndex = this.getMonthIndex(scrollTo);

    this.monthCalendarRef.scrollToIndex({
      animated: false,
      index: scrollToIndex,
    });
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

  getWeekIndex(week) {
    let diffWeeks = this.state.openDate.diffWeeks(week);

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
      <Calendar
        item={item}
        isMonth={true}
        scrollToDate={this.onScrollToMonth}
        onChangeSelectedDate={this.onSelectedDateChangedInMonth}
      />
    );
  };

  renderWeekCalendar = ({item}) => {
    return (
      <Calendar
        item={item}
        isMonth={false}
        onChangeSelectedDate={this.onSelectedDateChangedInWeek}
      />
    );
  };

  renderMeeting({item}) {
    return <Meeting meeting={item} />;
  }

  render() {
    const initialListSize =
      this.props.pastScrollRange + this.props.futureScrollRange + 1;

    const meetings = dummy[this.state.selectedDate.toString('yyyy-MM-dd')]
      ? dummy[this.state.selectedDate.toString('yyyy-MM-dd')]
      : [];

    return (
      <View style={{flex: 1, backgroundColor: '#fff'}}>
        <Header current={this.state.selectedDate} />
        <View style={{flex: 1}} onLayout={this.onLayout}>
          <Animated.View
            style={{
              flex: 1,
              position: 'absolute',
              top: -this.dayHeight * this.state.weekCount,
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
                width: this.viewWidth,

                position: 'absolute',
                top: this.dayHeight * this.state.weekCount,
                left: 0,
                opacity: this.state.collapsed ? 1 : 0,

                zIndex: this.state.collapsed ? 100 : -100,
              }}>
              <FlatList
                ref={r => (this.weekCalendarRef = r)}
                data={this.state.weeks}
                renderItem={this.renderWeekCalendar}
                initialListSize={initialListSize}
                initialScrollIndex={this.getWeekIndex(this.state.openDate)}
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
              width: windowSize.width,
              height: this._contentHeightAnimation,
              backgroundColor: '#fff',
              paddingTop: 10,
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
            }}
            {...this._bottomPanResponder.panHandlers}>
            <MeetingList meetings={meetings} />
          </Animated.View>
        </View>
      </View>
    );
  }
}
