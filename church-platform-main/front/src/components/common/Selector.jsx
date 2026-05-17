import React from 'react';
import PropTypes from 'prop-types';
import { OutlinedInput, Select, MenuItem, FormControl } from '@mui/material';

const CPSelect = ({ value, list, onChange, sx, mobile }) => {
  return (
    <FormControl sx={{ ...sx }}>
      <Select
        displayEmpty={false}
        value={value}
        onChange={event => onChange(event.target.value)}
        input={
          <OutlinedInput
            sx={{
              '&.MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
                borderColor: mobile ? '#e6eaed' : '#fff',
                borderWidth: '1px',
                borderRadius: '3px',
              },
              '&.MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline':
                {
                  borderColor: '#212529',
                },
              '&.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline':
                {
                  borderColor: '#212529',
                },
              '.MuiSvgIcon-root': {
                fill: '#848484 !important',
              },
            }}
          />
        }
        MenuProps={{
          PaperProps: {
            sx: {
              '& .MuiMenuItem-root.Mui-selected': {
                backgroundColor: '#fff',
              },
              '& .MuiMenuItem-root:hover': {
                backgroundColor: '#edf7fe',
              },
            },
          },
          MenuListProps: {
            disablePadding: true,
          },
        }}
        inputProps={{ 'aria-label': 'Without label' }}
        style={{
          height: '40px',
          fontSize: '14px',
          fontWeight: '400',
          lineHeight: '20px',
          color: '#212529',
          ...sx,
        }}
      >
        {list.map(item => (
          <MenuItem
            key={item.value}
            value={item.value}
            style={{
              fontSize: '14px',
              fontWeight: '400',
              lineHeight: '20px',
              color: '#212529',
              height: '36px',
            }}
          >
            {item.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

CPSelect.propTypes = {
  // onClose: PropTypes.func,
  onChange: PropTypes.func.isRequired,
  // open: PropTypes.bool,
  list: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  ).isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  sx: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  mobile: PropTypes.bool,
};

CPSelect.defaultProps = {
  // onClose: null,
  // onChange: null,
  // open: false,
  sx: {},
  mobile: false,
};

export default CPSelect;
