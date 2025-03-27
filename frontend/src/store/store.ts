import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// Initial state types
interface AuthState {
  isAuthenticated: boolean;
  user: null | {
    id: string;
    name: string;
    email: string;
    role: 'student' | 'instructor';
  };
}

interface UIState {
  sidebarOpen: boolean;
  notifications: Array<{
    id: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
  }>;
}

// Initial states
const initialAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
};

const initialUIState: UIState = {
  sidebarOpen: true,
  notifications: [],
};

// Create slices
const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    setAuth: (state: AuthState, action: PayloadAction<AuthState>) => {
      state.isAuthenticated = action.payload.isAuthenticated;
      state.user = action.payload.user;
    },
    logout: (state: AuthState) => {
      state.isAuthenticated = false;
      state.user = null;
    }
  }
});

const uiSlice = createSlice({
  name: 'ui',
  initialState: initialUIState,
  reducers: {
    toggleSidebar: (state: UIState) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    addNotification: (state: UIState, action: PayloadAction<Omit<UIState['notifications'][0], 'id'>>) => {
      state.notifications.push({
        ...action.payload,
        id: Date.now().toString()
      });
    },
    removeNotification: (state: UIState, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter((notification) => notification.id !== action.payload);
    }
  }
});

// Export actions
export const { setAuth, logout } = authSlice.actions;
export const { toggleSidebar, addNotification, removeNotification } = uiSlice.actions;

// Create the store
export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    ui: uiSlice.reducer,
  },
});

// Typed hooks
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;