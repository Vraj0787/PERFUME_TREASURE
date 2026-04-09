import React, {useCallback, useEffect, useState} from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HomeScreen from './src/screens/HomeScreen';
import FAQScreen from './src/screens/FAQScreen';
import FavoritesScreen from './src/screens/Favoritesscreen';
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
const FAVORITES_STORAGE_KEY = 'perfume_treasure_favorites';

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
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const storedFavorites = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
        if (!storedFavorites) {
          return;
        }

        const parsedFavorites = JSON.parse(storedFavorites);
        if (Array.isArray(parsedFavorites)) {
          setFavorites(parsedFavorites);
        }
      } catch (_error) {
        setFavorites([]);
      }
    };

    loadFavorites();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites)).catch(() => {});
  }, [favorites]);

  const isFavorited = useCallback(
    productId => favorites.includes(productId),
    [favorites],
  );

  const handleToggleFavorite = useCallback(product => {
    const productId = product?.id;
    if (!productId) {
      return;
    }

    setFavorites(previousFavorites => {
      if (previousFavorites.includes(productId)) {
        return previousFavorites.filter(id => id !== productId);
      }

      return [...previousFavorites, productId];
    });
  }, []);

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

  const handleLoyaltyEarned = pointsEarned => {
    const pointsValue = Number(pointsEarned || 0);
    if (!pointsValue) {
      return;
    }

    setCurrentUser(user => {
      if (!user) {
        return user;
      }

      return {
        ...user,
        loyalty_points_balance: Number(user.loyalty_points_balance || 0) + pointsValue,
      };
    });
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
                favoritesCount={favorites.length}
                isFavorited={isFavorited}
                onToggleFavorite={handleToggleFavorite}
                onLogout={handleLogout}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="ProductList">
            {props => (
              <ProductListScreen
                {...props}
                cartCount={cartCount}
                isFavorited={isFavorited}
                onToggleFavorite={handleToggleFavorite}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="ProductDetail">
            {props => (
              <ProductDetailScreen
                {...props}
                cartCount={cartCount}
                onAddToCart={handleAddToCart}
                isFavorited={isFavorited}
                onToggleFavorite={handleToggleFavorite}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Favorites">
            {props => (
              <FavoritesScreen
                {...props}
                favoritesIds={favorites}
                onAddToCart={handleAddToCart}
                onToggleFavorite={handleToggleFavorite}
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
                onLoyaltyEarned={handleLoyaltyEarned}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
          <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
          <Stack.Screen name="FAQ" component={FAQScreen} />
          <Stack.Screen name="LoyaltyPoints">
            {props => <LoyaltyPointsScreen {...props} currentUser={currentUser} />}
          </Stack.Screen>
          <Stack.Screen name="Review" component={ReviewScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
