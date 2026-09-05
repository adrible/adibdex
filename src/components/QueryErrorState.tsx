import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QueryErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function QueryErrorState({
  title = 'Não foi possível carregar os dados',
  message = 'Verifique sua conexão e tente novamente.',
  onRetry,
}: QueryErrorStateProps) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center"
    >
      <AlertTriangle className="mx-auto mb-3 h-7 w-7 text-destructive" />
      <h3 className="text-base font-bold tracking-tight text-foreground">{title}</h3>
      <p className="text-support mt-2">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4 gap-2" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" />
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
