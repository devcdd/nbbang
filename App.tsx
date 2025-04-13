/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {StyleSheet} from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import MemberScreen from './src/screens/MemberScreen';
import SettlementScreen from './src/screens/SettlementScreen';
import {useMemberStore} from './src/store/memberStore';

export type RootStackParamList = {
  Home: undefined;
  Member: undefined;
  Settlement: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  const loadMembers = useMemberStore(state => state.loadMembers);

  useEffect(() => {
    loadMembers().catch(error => {
      console.error('Failed to load members:', error);
    });
  }, [loadMembers]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
            }}>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Member" component={MemberScreen} />
            <Stack.Screen name="Settlement" component={SettlementScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
