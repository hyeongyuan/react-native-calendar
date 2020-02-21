import React from 'react';
import {FlatList, View, StyleSheet, Text, TouchableOpacity} from 'react-native';

import Meeting from './meeting';

export default class MeetingList extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  renderMeeting({item}) {
    return <Meeting meeting={item} />;
  }

  render() {
    const {meetings} = this.props;
    return (
      <View
        style={{
          flex: 1,
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
        }}>
        {meetings.length !== 0 ? (
          <FlatList
            data={meetings}
            renderItem={this.renderMeeting}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item, index) => String(index)}
          />
        ) : (
          <View
            style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Text>회의방 없음</Text>
          </View>
        )}
      </View>
    );
  }
}
