import React, {useEffect, useState} from 'react';
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
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import ProductListScreen from './src/screens/ProductListScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import ReviewScreen from './src/screens/ReviewScreen';
import SignupScreen from './src/screens/SignupScreen';
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
  const [registeredUser, setRegisteredUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            // Migrate from old format (products) to new format (ids)
            const ids = parsed.map(item => 
              typeof item === 'object' && item.id ? item.id : item
            ).filter(id => id != null);
            setFavorites(ids);
          }
        }
      } catch (_error) {
        // Clear corrupted data
        await AsyncStorage.removeItem(FAVORITES_STORAGE_KEY);
      }
    };
    loadFavorites();
  }, []);

  useEffect(() => {
    const saveFavorites = async () => {
      try {
        await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
      } catch (_error) {}
    };
    saveFavorites();
  }, [favorites]);

  const handleToggleFavorite = product => {
    if (!product || !product.id) return;
    setFavorites(current => {
      if (current.includes(product.id)) {
        return current.filter(id => id !== product.id);
      }
      return [...current, product.id];
    });
  };

  const isFavorited = productId => favorites.includes(productId);

  const handleSignup = userData => {
    setRegisteredUser(userData);
  };

  const handlePasswordReset = newPassword => {
    setRegisteredUser(currentUser => {
      if (!currentUser) return currentUser;
      return {...currentUser, password: newPassword};
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
            {props => <LoginScreen {...props} registeredUser={registeredUser} />}
          </Stack.Screen>
          <Stack.Screen name="Signup">
            {props => <SignupScreen {...props} onSignup={handleSignup} />}
          </Stack.Screen>
          <Stack.Screen name="ForgotPassword">
            {props => <ForgotPasswordScreen {...props} registeredUser={registeredUser} />}
          </Stack.Screen>
          <Stack.Screen name="ResetPassword">
            {props => <ResetPasswordScreen {...props} onResetPassword={handlePasswordReset} />}
          </Stack.Screen>
          <Stack.Screen name="Home">
            {props => <HomeScreen {...props} cartCount={cartCount} favoritesCount={favorites.length} isFavorited={isFavorited} onToggleFavorite={handleToggleFavorite} />}
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
          <Stack.Screen name="FAQ" component={FAQScreen} />
          <Stack.Screen name="LoyaltyPoints" component={LoyaltyPointsScreen} />
          <Stack.Screen name="Review" component={ReviewScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;