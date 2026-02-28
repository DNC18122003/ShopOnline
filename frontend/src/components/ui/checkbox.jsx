import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const checkboxVariants = cva(
    `
  peer shrink-0
  rounded-sm
  border-2 border-gray-400
  bg-white
  shadow-sm
  transition-all duration-200
  focus-visible:outline-none
  focus-visible:ring-2 focus-visible:ring-primary
  disabled:cursor-not-allowed disabled:opacity-50

  data-[state=checked]:bg-primary
  data-[state=checked]:border-primary
  data-[state=checked]:text-white
  `,
    {
        variants: {
            variant: {
                default: '',
                destructive: 'border-red-500 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500',
            },
            size: {
                default: 'h-5 w-5',
                sm: 'h-4 w-4',
                lg: 'h-6 w-6',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
);

function Checkbox({ className, variant, size, ...props }) {
    return (
        <CheckboxPrimitive.Root
            data-slot="checkbox"
            className={cn(checkboxVariants({ variant, size }), className)}
            {...props}
        >
            <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
                <Check className="h-3 w-3" />
            </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
    );
}

export { Checkbox, checkboxVariants };
