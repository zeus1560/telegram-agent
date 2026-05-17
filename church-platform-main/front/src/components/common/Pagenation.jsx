import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, IconButton } from '@mui/material';
import PrevArrow from '../../assets/images/ic_arr_prev.svg?react';
import NextArrow from '../../assets/images/ic_arr_next.svg?react';
import PrevIconM from '../../assets/images/ic_prev_m.svg?react';
import NextIconM from '../../assets/images/ic_next_m.svg?react';

const Pagination = ({
  pageChangeHandler,
  totalRows,
  rowsPerPage,
  currentPage,
  mobile,
  ...props
}) => {
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoNext, setCanGoNext] = useState(true);
  const pageCount = Math.ceil(totalRows / rowsPerPage);
  const currentPageDivision = Math.floor((currentPage - 1) / 10);
  const partPageCount = Math.min(pageCount - currentPageDivision * 10, 10);
  const pageArr = [];
  let startIndex = currentPageDivision * 10;
  for (let i = 0; i < partPageCount; i += 1) {
    pageArr.push(startIndex);
    startIndex += 1;
  }
  const handleChangePage = page => {
    pageChangeHandler(page);
  };
  const onNextPage = () => handleChangePage(currentPage + 1);
  const onPrevPage = () => handleChangePage(currentPage - 1);
  const onPageSelect = pageNo => handleChangePage(pageNo);

  useEffect(() => {
    if (currentPage === 1) {
      setCanGoBack(false);
    } else {
      setCanGoBack(true);
    }
    if (currentPage === pageCount) {
      setCanGoNext(false);
    } else {
      setCanGoNext(true);
    }
  }, [pageCount, currentPage]);

  return (
    <Box {...props}>
      {mobile ? (
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{ width: '100%' }}
        >
          <IconButton
            onClick={onPrevPage}
            type="button"
            disabled={!canGoBack}
            sx={{ width: '32px', height: '32px' }}
          >
            <PrevIconM />
          </IconButton>
          <Box display="flex" alignItems="center">
            <Box
              sx={{
                fontWeight: '600',
                fontSize: '15px',
                lineHeight: '20px',
                color: '#34383a',
                whiteSpace: 'pre',
              }}
            >
              {`${currentPage}   /   ${pageCount} `}
            </Box>
            <Box
              sx={{
                fontWeight: '600',
                fontSize: '15px',
                lineHeight: '24px',
                color: '#7c8288',
              }}
            >
              페이지
            </Box>
          </Box>

          <IconButton
            onClick={onNextPage}
            type="button"
            disabled={!canGoNext}
            sx={{ width: '32px', height: '32px', ml: '5px' }}
          >
            <NextIconM />
          </IconButton>
        </Box>
      ) : (
        <div>
          <IconButton
            onClick={onPrevPage}
            type="button"
            disabled={!canGoBack}
            sx={{ width: '48px', height: '48px' }}
          >
            <PrevArrow />
          </IconButton>{' '}
          <span>
            {pageArr.map(item => {
              return (
                <IconButton
                  key={item}
                  sx={{
                    p: '0px',
                    width: '32px',
                    height: '32px',
                    mr: '5px',
                  }}
                  onClick={() => onPageSelect(item + 1)}
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    sx={{
                      lineHeight: '20px',
                      color: currentPage - 1 === item ? '#34383a' : '#7c8288',
                      fontSize: '15px',
                      fontWeight: currentPage - 1 === item ? '600' : '400',
                      maxWidth: '32px',
                      width: '32px',
                      height: '32px',
                    }}
                  >
                    {item + 1}
                  </Box>
                </IconButton>
              );
            })}
          </span>
          <IconButton
            onClick={onNextPage}
            type="button"
            disabled={!canGoNext}
            sx={{ width: '48px', height: '48px', ml: '5px' }}
          >
            <NextArrow />
          </IconButton>
        </div>
      )}
    </Box>
  );
};

Pagination.propTypes = {
  pageChangeHandler: PropTypes.func.isRequired,
  totalRows: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  mobile: PropTypes.bool,
  currentPage: PropTypes.number,
};

Pagination.defaultProps = {
  currentPage: 1,
  mobile: false,
};

export default Pagination;
