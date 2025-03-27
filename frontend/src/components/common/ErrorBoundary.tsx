import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
            <div className="text-center">
              <div className="mb-4">
                <img 
                  src="https://source.unsplash.com/featured/?error,maintenance" 
                  alt="Error illustration" 
                  className="w-64 h-64 mx-auto rounded-lg object-cover"
                />
              </div>
              <h1 className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong</h1>
              <p className="text-gray-600 mb-6">
                We're sorry for the inconvenience. Our team has been notified and is working on the issue.
              </p>
              <div className="space-y-4">
                <button 
                  onClick={() => window.location.reload()} 
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  Refresh Page
                </button>
                <button 
                  onClick={() => window.location.href = '/'} 
                  className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition duration-200"
                >
                  Go to Homepage
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;