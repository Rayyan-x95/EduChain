import { Tabs } from 'expo-router';
import { Home, Award, Search, User, Bell, Wallet } from 'lucide-react-native';
import { EduChainLogo } from '../../src/components/EduChainLogo';

const ACTIVE = '#72E0E3';
const INACTIVE = '#9AA3B2';
const BG = '#0b0f12';
const HEADER_BG = '#111820';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: HEADER_BG },
        headerTintColor: '#E6EEF3',
        headerLeft: () => <EduChainLogo size={24} />,
        headerLeftContainerStyle: { paddingLeft: 16 },
        tabBarStyle: { backgroundColor: BG, borderTopColor: 'rgba(255,255,255,0.06)' },
        tabBarActiveTintColor: ACTIVE,
        tabBarInactiveTintColor: INACTIVE,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="credentials"
        options={{
          title: 'Credentials',
          tabBarIcon: ({ color, size }) => <Award size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, size }) => <Bell size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color, size }) => <Wallet size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
