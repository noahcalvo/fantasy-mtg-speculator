import { FormControl, InputLabel, OutlinedInput } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClone } from '@fortawesome/free-solid-svg-icons';
import { muiStyles } from './muiStyles';

interface PointsInputProps {
  value: number | '';
  onChange: (value: number | '') => void;
  showIcon?: boolean;
}

export function PointsInput({ value, onChange, showIcon }: PointsInputProps) {
  return (
    <div className="flex items-center gap-2">
      <FormControl size="small" fullWidth sx={muiStyles}>
        <InputLabel>Points</InputLabel>
        <OutlinedInput
          type="number"
          value={value}
          onChange={(e) =>
            onChange(e.target.value === '' ? '' : parseFloat(e.target.value))
          }
          label="Points"
        />
      </FormControl>
      {showIcon && <FontAwesomeIcon icon={faClone} className="w-6" />}
    </div>
  );
}
