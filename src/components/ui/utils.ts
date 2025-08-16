import * as React from 'react';
import { cn } from "@/lib/utils";

export const commonVariants = {
  base: "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  disabled: "opacity-50 pointer-events-none",
  focus: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
};

type WithRadixWrapperProps<C extends React.ElementType> = {
  as?: C;
  className?: string;
} & React.ComponentPropsWithoutRef<C>;

export function withRadixWrapper<C extends React.ElementType>(
  Component: C,
  baseClasses: string
) {
  const WrappedComponent = React.forwardRef<
    React.ElementRef<C>,
    WithRadixWrapperProps<C>
  >((props, ref) => {
    const { className, ...rest } = props;
    return React.createElement(Component, {
      ...rest,
      ref,
      className: cn(baseClasses, className)
    });
  });

  WrappedComponent.displayName = `withRadixWrapper(${
    typeof Component === 'string' ? Component : Component.displayName || Component.name
  })`;

  return WrappedComponent;
}
