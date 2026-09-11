// components/ui/form.tsx
import * as React from "react";
import {
  useFormContext,
  Controller,
  FormProvider,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  type UseFormReturn,
} from "react-hook-form";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

// ----------------------------------------------
// 1. Form Provider & Root Component
// ----------------------------------------------
interface FormProps<T extends FieldValues = FieldValues>
  extends React.ComponentProps<"form"> {
  form: UseFormReturn<T>;
}

const Form = React.forwardRef<HTMLFormElement, FormProps<FieldValues>>(
  ({ form, className, children, ...props }, ref) => {
    return (
      <FormProvider {...(form as UseFormReturn<FieldValues>)}>
        <form ref={ref} className={cn("space-y-4", className)} {...props}>
          {children}
        </form>
      </FormProvider>
    );
  }
) as (<T extends FieldValues = FieldValues>(
  props: FormProps<T> & React.RefAttributes<HTMLFormElement>
) => React.ReactElement | null) & { displayName?: string };
Form.displayName = "Form";

// ----------------------------------------------
// 2. FormField
// ----------------------------------------------
type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

// ----------------------------------------------
// 3. useFormField hook
// ----------------------------------------------
const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const formContext = useFormContext(); // now it will have context

  if (!fieldContext) {
    throw new Error("useFormField must be used within <FormField>");
  }
  if (!formContext) {
    throw new Error("useFormField must be used within <Form>");
  }

  const { getFieldState, formState } = formContext;
  const fieldState = getFieldState(fieldContext.name, formState);
  const id = React.useId();

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

// ----------------------------------------------
// 4. FormItem
// ----------------------------------------------
const FormItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-slot="form-item"
      className={cn("space-y-1.5", className)}
      {...props}
    />
  );
});
FormItem.displayName = "FormItem";

// ----------------------------------------------
// 5. FormLabel
// ----------------------------------------------
const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.ComponentProps<typeof Label>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField();
  return (
    <Label
      ref={ref}
      data-slot="form-label"
      className={cn(
        "text-sm font-medium leading-6 peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        error && "text-destructive",
        className
      )}
      htmlFor={formItemId}
      {...props}
    />
  );
});
FormLabel.displayName = "FormLabel";

// ----------------------------------------------
// 6. FormControl
// ----------------------------------------------
const FormControl = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();
  return (
    <div
      ref={ref}
      data-slot="form-control"
      className={cn(className)}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
});
FormControl.displayName = "FormControl";

// ----------------------------------------------
// 7. FormDescription
// ----------------------------------------------
const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<"p">
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();
  return (
    <p
      ref={ref}
      data-slot="form-description"
      id={formDescriptionId}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
});
FormDescription.displayName = "FormDescription";

// ----------------------------------------------
// 8. FormMessage
// ----------------------------------------------
const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<"p">
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message) : children;
  if (!body) return null;
  return (
    <p
      ref={ref}
      data-slot="form-message"
      id={formMessageId}
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  );
});
FormMessage.displayName = "FormMessage";

export {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
};