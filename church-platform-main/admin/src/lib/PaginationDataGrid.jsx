/* eslint-disable no-console */
/* eslint-disable react/jsx-no-bind */

import React, { useMemo, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';
import { Box } from '@mui/material';
import Pagination from '../components/common/Pagination';

function PaginationDataGrid({
  height,
  width,
  columnDefs,
  rowData,
  onCellClicked,
  pageSize,
  offset,
  onChangePage,
  totalRows,
}) {
  const gridRef = useRef(); // Optional - for accessing Grid's API

  const defaultColDef = useMemo(
    () => ({
      unSortIcon: true,
      sortable: true,
      fliter: false,
      flex: 1,
      cellStyle: { backgroundColor: 'white' },
    }),
    [],
  );

  // Example of consuming Grid Event
  const cellClickedListener = useCallback(
    event => {
      // eslint-disable-next-line no-console
      console.log('cellClicked', event);
      if (onCellClicked) {
        onCellClicked(event);
      }
    },
    [onCellClicked],
  );

  function handleChangePage(page) {
    onChangePage(page);
  }

  return (
    <Box>
      <div
        className="ag-theme-alpine"
        style={{ width: width || '100%', height: height || 577 }}
      >
        <AgGridReact
          ref={gridRef} // Ref for accessing Grid's API
          rowData={rowData} // Row Data for Rows
          columnDefs={columnDefs} // Column Defs for Columns
          defaultColDef={defaultColDef} // Default Column Properties
          animateRows // Optional - set to 'true' to have rows animate when sorted
          rowSelection="multiple" // Options - allows click selection of rows
          onCellClicked={cellClickedListener} // Optional - registering for Grid Event
        />
      </div>
      <Box sx={{ mt: '20px', textAlign: 'center' }}>
        <Pagination
          currentPage={offset / pageSize + 1}
          pageChangeHandler={handleChangePage}
          totalRows={totalRows}
          rowsPerPage={pageSize}
        />
      </Box>
    </Box>
  );
}

export default PaginationDataGrid;

PaginationDataGrid.defaultProps = {
  height: undefined,
  width: undefined,
  columnDefs: [],
  rowData: [],
  onCellClicked: undefined,
};

PaginationDataGrid.propTypes = {
  pageSize: PropTypes.number.isRequired,
  height: PropTypes.number,
  width: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  columnDefs: PropTypes.array,
  // eslint-disable-next-line react/forbid-prop-types
  rowData: PropTypes.array,
  onCellClicked: PropTypes.func,
  onChangePage: PropTypes.func.isRequired,
  offset: PropTypes.number.isRequired,
};
