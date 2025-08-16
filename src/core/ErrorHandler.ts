interface ToastOptions {
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
}

export class ErrorHandler {
  public static instance: ErrorHandler;
  private toast?: (options: ToastOptions) => void;

  private constructor() {}

  public static init(toastHandler: (options: ToastOptions) => void): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
      ErrorHandler.instance.toast = toastHandler;
    }
    return ErrorHandler.instance;
  }

  public handle(error: unknown, context?: string): void {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error(`[${context || 'Global'}]`, error);

    this.toast?.({
      title: 'Erreur',
      description: `${context ? `${context} : ` : ''}${message}`,
      variant: 'destructive'
    });
  }
}
