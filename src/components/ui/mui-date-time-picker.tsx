/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { Input } from "@/components/ui/input";
import dayjs, { Dayjs } from "dayjs";
import { XIcon } from "lucide-react";

interface MuiDateTimePickerProps {
  value: Date | null | undefined;
  onChange: (date: Date | null) => void;
  label?: string;
  errorMessage?: string;
  helperText?: string;
  isRequired?: boolean;
  disabled?: boolean;
  type?: "date" | "datetime";
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  clearable?: boolean;
}

export function MuiDateTimePicker({
  value,
  onChange,
  label,
  errorMessage,
  helperText,
  isRequired,
  disabled,
  type = "datetime",
  placeholder,
  minDate,
  maxDate,
  clearable,
}: MuiDateTimePickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleChange = (newValue: Dayjs | null) => {
    onChange(newValue ? newValue.toDate() : null);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  const formattedValue = React.useMemo(() => {
    if (!value) return "";
    const format =
      type === "date" ? "DD MMM YYYY" : "DD MMM YYYY HH:mm [GMT] Z";
    return dayjs(value).format(format);
  }, [value, type]);

  const commonProps = {
    open,
    onOpen: handleOpen,
    onClose: handleClose,
    value: value ? dayjs(value) : null,
    onChange: handleChange,
    disabled,
    minDate: minDate ? dayjs(minDate) : undefined,
    maxDate: maxDate ? dayjs(maxDate) : undefined,
    slotProps: {
      textField: {
        onClick: handleOpen,
        InputProps: {
          readOnly: true,
        },
      },
      // We want to hide the default input and use our custom one as the trigger
      // But MUI Pickers are designed to render an input.
      // A better approach for "custom trigger" in MUI v6/v7 is using `slots.field` or just rendering the picker hidden and controlling `open`.
      // However, rendering hidden picker and controlling open state is easier for "custom trigger" feel.
    },
  };

  const slotProps = React.useMemo(
    () => ({
      ...commonProps.slotProps,
      popper: {
        sx: { zIndex: 9999, pointerEvents: "auto" },
      },
      dialog: {
        disableEnforceFocus: true,
        sx: { zIndex: 9999, pointerEvents: "auto" },
      },
      textField: (params: any) => ({
        ...params,
        InputProps: {
          ...params.InputProps,
          ref: params.InputProps?.ref,
        },
      }),
    }),
    [commonProps.slotProps]
  );

  const slots = React.useMemo(
    () => ({
      textField: (params: any) => (
        <div ref={params.InputProps?.ref} className="w-0 h-0 overflow-hidden" />
      ),
    }),
    []
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="relative w-full group">
        <Input
          label={label}
          value={formattedValue}
          placeholder={placeholder}
          errorMessage={errorMessage}
          helperText={helperText}
          isRequired={isRequired}
          disabled={disabled}
          readOnly
          onClick={!disabled ? handleOpen : undefined}
          className="cursor-pointer pr-8"
          // Add an icon if desired, or keep it simple as per request "input trigger"
        />

        {clearable && value && !disabled && (
          <div
            className="absolute right-4 top-12 cursor-pointer text-muted-foreground hover:text-foreground"
            onClick={handleClear}
          >
            <XIcon className="h-4 w-4" />
          </div>
        )}

        {/* Hidden inputs to capture focus or form submission if needed, but we rely on the visible Input */}

        <div className="absolute top-0 left-0 w-full h-full opacity-0 pointer-events-none overflow-hidden">
          {/*
             We render the picker but hide it visually.
             We control the open state.
             We need to anchor it to the input.
             Actually, MUI Pickers render a TextField by default.
             If we want to use OUR Input, we can use `slots.textField`.
           */}

          {type === "date" ? (
            <DatePicker
              {...commonProps}
              enableAccessibleFieldDOMStructure={false}
              slotProps={slotProps}
              slots={slots}
            />
          ) : (
            <DateTimePicker
              {...commonProps}
              enableAccessibleFieldDOMStructure={false}
              slotProps={slotProps}
              // viewRenderers={{
              //   hours: renderTimeViewClock,
              //   minutes: renderTimeViewClock,
              //   seconds: renderTimeViewClock,
              // }}
              slots={slots}
            />
          )}
        </div>
      </div>
    </LocalizationProvider>
  );
}
