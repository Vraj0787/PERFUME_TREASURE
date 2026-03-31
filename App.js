import React, {useState} from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import HomeScreen from './src/screens/HomeScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import LoginScreen from './src/screens/LoginScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import SignupScreen from './src/screens/SignupScreen';
import {palette} from './src/theme';

const Stack = createNativeStackNavigator();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: palette.cream,
    card: palette.ivory,
    text: palette.black,
    border: palette.border,
    primary: palette.gold,
  },
};

function App() {
  const [registeredUser, setRegisteredUser] = useState(null);

  const handleSignup = userData => {
    setRegisteredUser(userData);
  };

  const handlePasswordReset = newPassword => {
    setRegisteredUser(currentUser => {
      if (!currentUser) {
        return currentUser;
      }

      return {
        ...currentUser,
        password: newPassword,
      };
    });
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={palette.black} />
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,
            contentStyle: {backgroundColor: palette.cream},
            animation: 'slide_from_right',
          }}>
          <Stack.Screen name="Login">
            {props => (
              <LoginScreen {...props} registeredUser={registeredUser} />
            )}
          </Stack.Screen>
          <Stack.Screen name="Signup">
            {props => <SignupScreen {...props} onSignup={handleSignup} />}
          </Stack.Screen>
          <Stack.Screen name="ForgotPassword">
            {props => (
              <ForgotPasswordScreen {...props} registeredUser={registeredUser} />
            )}
          </Stack.Screen>
          <Stack.Screen name="ResetPassword">
            {props => (
              <ResetPasswordScreen
                {...props}
                onResetPassword={handlePasswordReset}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Home" component={HomeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
