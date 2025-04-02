import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { ChatMessage, ChatParticipant, ChatRoom } from '../types/chat';
import { chatService } from '../services/chatService';

interface ChatState {
  messages: ChatMessage[];
  participants: ChatParticipant[];
  currentRoom: ChatRoom | null;
  loading: boolean;
  error: string | null;
}

interface ChatContextValue extends ChatState {
  sendMessage: (content: string) => Promise<void>;
  joinRoom: (roomId: string) => Promise<void>;
  leaveRoom: (roomId: string) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  addReaction: (messageId: string, reaction: string) => Promise<void>;
  removeReaction: (messageId: string, reaction: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

type ChatAction =
  | { type: 'SET_MESSAGES'; payload: ChatMessage[] }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_PARTICIPANTS'; payload: ChatParticipant[] }
  | { type: 'SET_ROOM'; payload: ChatRoom | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_REACTION'; payload: { messageId: string; reactions: Record<string, string[]> } };

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'SET_PARTICIPANTS':
      return { ...state, participants: action.payload };
    case 'SET_ROOM':
      return { ...state, currentRoom: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'UPDATE_REACTION':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.messageId
            ? { ...msg, reactions: action.payload.reactions }
            : msg
        ),
      };
    default:
      return state;
  }
};

interface ChatProviderProps {
  children: React.ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, {
    messages: [],
    participants: [],
    currentRoom: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    chatService.onMessageReceived((message) => {
      dispatch({ type: 'ADD_MESSAGE', payload: message });
    });

    chatService.onUserJoined((participant) => {
      dispatch({
        type: 'SET_PARTICIPANTS',
        payload: [...state.participants, participant],
      });
    });

    chatService.onUserLeft((participant) => {
      dispatch({
        type: 'SET_PARTICIPANTS',
        payload: state.participants.filter((p) => p.id !== participant.id),
      });
    });

    return () => {
      chatService.disconnect();
    };
  }, []);

  const joinRoom = async (roomId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      await chatService.connect();
      chatService.joinRoom(roomId);

      const [messages, participants, room] = await Promise.all([
        chatService.getMessages(roomId),
        chatService.getRoomParticipants(roomId),
        chatService.getRoom(roomId),
      ]);

      dispatch({ type: 'SET_MESSAGES', payload: messages });
      dispatch({ type: 'SET_PARTICIPANTS', payload: participants });
      dispatch({ type: 'SET_ROOM', payload: room });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to join room',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const leaveRoom = async (roomId: string) => {
    chatService.leaveRoom(roomId);
    dispatch({ type: 'SET_MESSAGES', payload: [] });
    dispatch({ type: 'SET_PARTICIPANTS', payload: [] });
    dispatch({ type: 'SET_ROOM', payload: null });
  };

  const sendMessage = async (content: string) => {
    if (!state.currentRoom) return;
    try {
      const message = await chatService.sendMessage(state.currentRoom.id, content);
      dispatch({ type: 'ADD_MESSAGE', payload: message });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to send message',
      });
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await chatService.markAsRead(state.currentRoom?.id || '');
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  };

  const addReaction = async (messageId: string, reaction: string) => {
    try {
      await chatService.addReaction(messageId, reaction);
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  const removeReaction = async (messageId: string, reaction: string) => {
    try {
      await chatService.removeReaction(messageId, reaction);
    } catch (error) {
      console.error('Failed to remove reaction:', error);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        ...state,
        sendMessage,
        joinRoom,
        leaveRoom,
        markAsRead,
        addReaction,
        removeReaction,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};