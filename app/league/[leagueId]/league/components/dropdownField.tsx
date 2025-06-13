import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { capitalize } from '@/app/lib/utils';
import { muiStyles } from './muiStyles';

interface DropdownFieldProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

export function DropdownField({
  label,
  value,
  options,
  onChange,
}: DropdownFieldProps) {
  return (
    <FormControl variant="outlined" size="small" fullWidth sx={muiStyles}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        label={label}
      >
        {options.map((opt) => (
          <MenuItem key={opt} value={opt}>
            {capitalize(opt)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
