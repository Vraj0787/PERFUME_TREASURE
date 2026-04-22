import React, {useState} from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import HomeScreen from './src/screens/HomeScreen';
import FAQScreen from './src/screens/FAQScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import LoginScreen from './src/screens/LoginScreen';
import LoyaltyPointsScreen from './src/screens/LoyaltyPointsScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import ProductListScreen from './src/screens/ProductListScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import ReviewScreen from './src/screens/ReviewScreen';
import SignupScreen from './src/screens/SignupScreen';
import AccountDescriptionScreen from './src/screens/AccountDescriptionScreen';
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
  const [cartItems, setCartItems] = useState([]);

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

  const handleAddToCart = (product, quantity) => {
    setCartItems(currentItems => {
      const existingItem = currentItems.find(item => item.id === product.id);

      if (existingItem) {
        return currentItems.map(item =>
          item.id === product.id
            ? {...item, quantity: item.quantity + quantity}
            : item,
        );
      }

      return [...currentItems, {...product, quantity}];
    });
  };

  const cartCount = cartItems.reduce(
    (totalQuantity, item) => totalQuantity + item.quantity,
    0,
  );

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
          <Stack.Screen name="Home">
            {props => <HomeScreen {...props} cartCount={cartCount} />}
          </Stack.Screen>
          <Stack.Screen name="ProductList">
            {props => <ProductListScreen {...props} cartCount={cartCount} />}
          </Stack.Screen>
          <Stack.Screen name="ProductDetail">
            {props => (
              <ProductDetailScreen
                {...props}
                onAddToCart={handleAddToCart}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="FAQ" component={FAQScreen} />
          <Stack.Screen name="LoyaltyPoints" component={LoyaltyPointsScreen} />
          <Stack.Screen name="Review" component={ReviewScreen} />
          <Stack.Screen name="AccountDescription" component={AccountDescriptionScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
