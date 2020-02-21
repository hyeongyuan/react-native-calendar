import React from 'react';

import {TouchableOpacity, View, Text} from 'react-native';

import theme from '../../theme/color';

const Day = ({day, state, selected, layout, onPress}) => {
  const date = day.getDate();

  const containerStyle = [
    {
      width: layout.width,
      height: layout.height - 5,
      alignItems: 'center',
      paddingTop: 1,
      paddingBottom: 15,
      backgroundColor: theme.CALENDAR_BACKGROUND,
      marginTop: 1,
      marginBottom: 1,
    },
  ];

  const innerStyle = [
    {
      width: layout.width - 18,
      height: layout.height - 18,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: (layout.width - 18) / 2,
      backgroundColor: theme.CALENDAR_BACKGROUND,
    },
  ];
  const textStyle = [{fontSize: 14, color: '#fff'}];

  if (selected) {
    innerStyle.push({
      backgroundColor: theme.PURPLE,
    });
    // containerStyle.push({borderWidth: 0.5, borderColor: 'green'});
  } else if (state === 'disabled') {
    textStyle.push({opacity: 0.2});
  } else if (state === 'today') {
    textStyle.push({color: theme.PURPLE});
  }

  function onPressDay() {
    onPress(day);
  }

  return (
    <TouchableOpacity style={containerStyle} onPress={onPressDay}>
      <View style={innerStyle}>
        <Text allowFontScaling={false} style={textStyle}>
          {date}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default Day;
