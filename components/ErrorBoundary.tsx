import { Component, ErrorInfo, ReactNode } from 'react';

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
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-light-surface dark:bg-dark-surface rounded-2xl shadow-2xl p-8 text-center">
                        <div className="text-6xl mb-4">⚠️</div>
                        <h1 className="text-2xl font-bold text-light-text dark:text-dark-text mb-4">
                            Oops! Something went wrong
                        </h1>
                        <p className="text-light-text-muted dark:text-dark-text-muted mb-6">
                            The application encountered an unexpected error. Don't worry, your data is safe.
                        </p>
                        {this.state.error && (
                            <details className="mb-6 text-left">
                                <summary className="cursor-pointer text-sm text-light-text-muted dark:text-dark-text-muted hover:text-light-text dark:hover:text-dark-text">
                                    Technical details
                                </summary>
                                <pre className="mt-2 p-3 bg-light-surface-accent dark:bg-dark-surface-accent rounded-lg text-xs overflow-auto max-h-40">
                                    {this.state.error.toString()}
                                </pre>
                            </details>
                        )}
                        <button
                            onClick={this.handleReset}
                            className="px-6 py-3 bg-gradient-to-r from-brand-purple to-brand-pink text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
                        >
                            Reload Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
