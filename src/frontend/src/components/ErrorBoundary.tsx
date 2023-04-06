import { Component } from 'react';
import ErrorPage from '../pages/ErrorPage';

interface ErrorBoundaryProps {}

interface ErrorBoundaryState {
  hasError: boolean;
  error: undefined | Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: undefined };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorPage
          message={
            'Please send a screenshot of this error to the software team, and try reloading the page to resolve the issue.'
          }
          error={this.state.error}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
