import React, {useCallback, useEffect, useState} from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import HomeScreen from './src/screens/HomeScreen';
import FAQScreen from './src/screens/FAQScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import LoginScreen from './src/screens/LoginScreen';
import LoyaltyPointsScreen from './src/screens/LoyaltyPointsScreen';
import CartScreen from './src/screens/CartScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import OrderConfirmationScreen from './src/screens/OrderConfirmationScreen';
import OrderHistoryScreen from './src/screens/OrderHistoryScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import ProductListScreen from './src/screens/ProductListScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import ReviewScreen from './src/screens/ReviewScreen';
import SignupScreen from './src/screens/SignupScreen';
import {
  addCartItem,
  clearAuthToken,
  fetchCurrentUser,
  fetchCart,
  getAuthToken,
  hydrateAuthToken,
} from './src/services/api';
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
  const [isHydratingAuth, setIsHydratingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  const updateCartCountFromSnapshot = cartSnapshot => {
    const itemTotal = (cartSnapshot?.items || []).reduce(
      (totalQuantity, item) => totalQuantity + item.quantity,
      0,
    );
    setCartCount(itemTotal);
  };

  const refreshCartCount = useCallback(async () => {
    if (!getAuthToken()) {
      setCartCount(0);
      return {items: []};
    }

    try {
      const cartSnapshot = await fetchCart();
      updateCartCountFromSnapshot(cartSnapshot);
      return cartSnapshot;
    } catch (_error) {
      setCartCount(0);
      return {items: []};
    }
  }, []);

  useEffect(() => {
    const bootstrapAuth = async () => {
      await hydrateAuthToken();
      const token = getAuthToken();
      if (!token) {
        setIsAuthenticated(false);
        setCurrentUser(null);
        setIsHydratingAuth(false);
        return;
      }

      try {
        const user = await fetchCurrentUser();
        setCurrentUser(user || null);
        setIsAuthenticated(true);
      } catch (_error) {
        await clearAuthToken();
        setCurrentUser(null);
        setIsAuthenticated(false);
      }

      setIsHydratingAuth(false);
    };

    bootstrapAuth();
  }, []);

  useEffect(() => {
    if (!isHydratingAuth && isAuthenticated) {
      refreshCartCount();
    }
  }, [isAuthenticated, isHydratingAuth, refreshCartCount]);

  const handleAddToCart = async (product, quantity) => {
    await addCartItem(product.id, quantity);
    await refreshCartCount();
  };

  const handleLoginSuccess = async user => {
    setCurrentUser(user || null);
    setIsAuthenticated(true);
    await refreshCartCount();
  };

  const handleSignupSuccess = async user => {
    setCurrentUser(user || null);
    setIsAuthenticated(true);
    await refreshCartCount();
  };

  const handleLogout = async () => {
    await clearAuthToken();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setCartCount(0);
  };

  const initialRouteName = isHydratingAuth
    ? 'Login'
    : isAuthenticated
      ? 'Home'
      : 'Login';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={palette.black} />
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator
          key={initialRouteName}
          initialRouteName={initialRouteName}
          screenOptions={{
            headerShown: false,
            contentStyle: {backgroundColor: palette.cream},
            animation: 'slide_from_right',
          }}>
          <Stack.Screen name="Login">
            {props => (
              <LoginScreen
                {...props}
                onLoginSuccess={handleLoginSuccess}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Signup">
            {props => (
              <SignupScreen
                {...props}
                onSignupSuccess={handleSignupSuccess}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          <Stack.Screen name="Home">
            {props => (
              <HomeScreen
                {...props}
                cartCount={cartCount}
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            )}
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
          <Stack.Screen name="Cart">
            {props => (
              <CartScreen
                {...props}
                onCartUpdated={updateCartCountFromSnapshot}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Checkout">
            {props => (
              <CheckoutScreen
                {...props}
                onCartUpdated={updateCartCountFromSnapshot}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
          <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
          <Stack.Screen name="FAQ" component={FAQScreen} />
          <Stack.Screen name="LoyaltyPoints" component={LoyaltyPointsScreen} />
          <Stack.Screen name="Review" component={ReviewScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
