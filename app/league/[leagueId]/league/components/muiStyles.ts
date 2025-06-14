export const muiStyles = {
  color: 'rgb(249 250 251)',
  '& .MuiInputLabel-root': {
    color: 'rgb(249 250 251)',
    '&.Mui-focused': {
      color: 'rgb(153 29 29)',
    },
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'rgb(249 250 251)',
    },
    '&:hover fieldset': {
      borderColor: 'rgb(127 29 29)',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'rgb(127 29 29)',

    },
    '& .MuiSelect-select, & .MuiInputBase-input': {
      color: 'rgb(249 250 251)',
      backgroundColor: 'transparent',
      '&:focus-visible': {
        outline: 'none', // Remove outline on focus-visible
      },
    },
    // Target the input element directly to remove focus ring
    '& .MuiInputBase-input': {
      backgroundColor: 'transparent', // Remove background color
      color: 'rgb(249 250 251)',
      '&:focus': {
        boxShadow: 'none', // Remove any box shadow
        backgroundColor: 'transparent', // Keep transparent on focus
      },
    },


  },
};
