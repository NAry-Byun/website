import React from 'react';

export const Card = React.forwardRef(({ className = '', children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`rounded-lg border border-border bg-card text-card-foreground shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export const CardHeader = React.forwardRef(({ className = '', children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`flex flex-col space-y-1.5 p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef(({ className = '', children, ...props }, ref) => {
  return (
    <h3
      ref={ref}
      className={`text-2xl font-semibold leading-none tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
});

CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef(({ className = '', children, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={`text-sm text-muted-foreground ${className}`}
      {...props}
    >
      {children}
    </p>
  );
});

CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef(({ className = '', children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`p-6 pt-0 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

CardContent.displayName = 'CardContent';
