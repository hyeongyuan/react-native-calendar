import React from 'react';
import {View, Text, Dimensions} from 'react-native';
import theme from '../theme/color';

const WEEKS = ['일', '월', '화', '수', '목', '금', '토'];
const windowSize = Dimensions.get('window');

const WeekDays = () => {
  return (
    <View
      style={{
        paddingHorizontal: 20,
        zIndex: 100,
        backgroundColor: theme.CALENDAR_BACKGROUND,
      }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          borderBottomWidth: 0.2,
          paddingBottom: 5,
          borderBottomColor: '#DCDCDC',
          zIndex: 100,
          backgroundColor: theme.CALENDAR_BACKGROUND,
          opacity: 0.8,
        }}>
        {WEEKS.map(day => (
          <View
            key={day}
            style={{
              width: (windowSize.width - 40) / 7,
              alignItems: 'center',
            }}>
            <Text
              allowFontScaling={false}
              style={[
                {fontSize: 11, color: '#fff'},
                day === '일' && {color: 'red'},
                day === '토' && {color: 'blue'},
              ]}>
              {day}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default WeekDays;
