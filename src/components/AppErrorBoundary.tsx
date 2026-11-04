import { Component, type ErrorInfo, type ReactNode } from 'react';
import { QueryErrorState } from '@/components/QueryErrorState';
import { localized } from '@/lib/language';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('Erro não tratado na interface:', error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen bg-background px-4 py-20">
          <div className="mx-auto max-w-2xl">
            <QueryErrorState
              title={localized('Ocorreu um erro inesperado', 'An unexpected error occurred')}
              message={localized(
                'Recarregue a aplicação para tentar recuperar a tela.',
                'Reload the app to recover this page.',
              )}
              onRetry={() => window.location.reload()}
            />
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
