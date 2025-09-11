import * as React from 'react';
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export function withRadixWrapper(component: React.ComponentType<any> | keyof JSX.IntrinsicElements, baseClasses: string) {
  const WrappedComponent = React.forwardRef<any, React.ComponentProps<any>>(({ className, ...props }, ref) => {
    const Comp = typeof component === 'string' ? component : component;

    if (typeof component === 'string') {
      return (
        <Comp
          className={cn(baseClasses, className)}
          ref={ref}
          {...props}
        />
      );
    }

    return (
      <Comp
        className={cn(baseClasses, className)}
        ref={ref}
        {...props}
      />
    );
  });

  WrappedComponent.displayName = `withRadixWrapper(${typeof component === 'string' ? component : component.displayName || 'Component'})`;

  return WrappedComponent;
}
