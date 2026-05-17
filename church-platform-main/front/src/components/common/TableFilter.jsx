import React from 'react';
import { Box, InputBase, IconButton, Paper } from '@mui/material';
import PropTypes from 'prop-types';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import SearchIcon from '../../assets/images/ic_search.svg?react';

const TableFilter = ({ onChange, value }) => {
  const inputRef = React.createRef();
  const [focused, setFocused] = React.useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('desktop'));
  const handleKeyDown = event => {
    if (event.keyCode === 13) {
      event.preventDefault();
      onChange(inputRef.current.value);
    }
  };

  const handleClick = () => {
    onChange(inputRef.current.value);
  };

  return (
    <Paper
      component="form"
      elevation={0}
      sx={
        isMobile
          ? {
              pl: '8px',
              pr: '8px',
              height: '40px',
              border: '1px solid #e6eaed',
              flexGrow: '1',
            }
          : {
              pl: '12px',
              pr: '12px',
              border: focused ? '1px solid #212529' : '1px solid #fff',
              width: '240px',
              minHeight: '32px',
              borderRadius: '3px',
              height: '40px',
            }
      }
    >
      <Box display="flex" alignItems="center">
        <InputBase
          onKeyDown={handleKeyDown}
          inputRef={inputRef}
          defaultValue={value}
          sx={{
            flex: 1,
            height: '100%',
            paddingLeft: '0px',
            fontWeight: 400,
            fontSize: '12px',
            lineHeight: '16px',
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          inputProps={{
            sx: {
              color: '#171717',
              fontWeight: '400',
              fontSize: isMobile ? '14px' : '16px',
              '&::placeholder': {
                color: '#adb5bd',
                fontWeight: '400',
                fontSize: isMobile ? '14px' : '16px',
                lineHeight: '28px',
              },
            },
          }}
          placeholder="검색어를 입력해 주세요"
        />
        <IconButton onClick={handleClick}>
          <SearchIcon />
        </IconButton>
      </Box>
    </Paper>
  );
};

TableFilter.propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.string,
};

TableFilter.defaultProps = {
  onChange: null,
  value: '',
};
export default TableFilter;
