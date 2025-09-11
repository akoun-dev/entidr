import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { withRadixWrapper } from '@/components/ui/utils';

describe('withRadixWrapper', () => {
  it('should render component with base classes', () => {
    const Button = withRadixWrapper('button', 'px-4 py-2 bg-blue-500');
    render(React.createElement(Button, null, 'Test Button'));

    const button = screen.getByRole('button');
    expect(button).toHaveClass('px-4 py-2 bg-blue-500');
    expect(button).toHaveTextContent('Test Button');
  });

  it('should merge className props', () => {
    const Button = withRadixWrapper('button', 'base-class');
    render(React.createElement(Button, { className: 'additional-class' }, 'Test'));

    expect(screen.getByRole('button')).toHaveClass('base-class additional-class');
  });

  it('should forward ref', () => {
    const Button = withRadixWrapper('button', '');
    const ref = React.createRef<HTMLButtonElement>();

    render(React.createElement(Button, { ref: ref }, 'Test'));
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('should preserve displayName', () => {
    const TestComponent = () => React.createElement('div');
    TestComponent.displayName = 'TestComponent';

    const Wrapped = withRadixWrapper(TestComponent, '');
    expect(Wrapped.displayName).toBe('withRadixWrapper(TestComponent)');
  });
});
