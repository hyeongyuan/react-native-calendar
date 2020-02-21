import React from 'react';
import {View, Text} from 'react-native';
import WeekDays from './weekDays';
import theme from '../theme/color';

const Header = ({currentDate}) => {
  return (
    <>
      <View
        style={{
          zIndex: 100,
          paddingHorizontal: 20,
          paddingVertical: 10,
          backgroundColor: theme.CALENDAR_BACKGROUND,
        }}>
        <Text style={{fontSize: 30, color: '#fff'}}>회의 일정</Text>

        <Text style={{marginLeft: 10, color: '#fff'}}>
          {currentDate.toString('yyyy년 MM월')}
        </Text>
      </View>
      <WeekDays />
    </>
  );
};

export default Header;
