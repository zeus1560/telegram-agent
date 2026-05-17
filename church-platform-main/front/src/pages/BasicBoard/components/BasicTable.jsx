/* eslint-disable no-unused-vars */
import React from 'react';
import { useTable } from 'react-table';
import PropTypes from 'prop-types';

const BasicTable = ({ columns, data, mobile, numbering }) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    pageCount,
  } = useTable({
    columns,
    data,
    initialState: { pageSize: 20, pageIndex: 0 },
    manualPagination: true,
    autoResetPage: false,
  });

  const rowWidth = !mobile ? ['100px', '1200px'] : ['100%'];
  const rowMinWidth = !mobile ? ['100px', '997px'] : ['360px'];
  const tdStyle = {
    borderBottom: '1px solid #ebebeb',
    textAlign: 'left',
    padding: '24px 0px 24px 7px',
  };
  return (
    <table
      {...getTableProps()}
      style={{
        width: '100%',
        // borderTop: '2px solid #000',
        tableLayout: 'fixed',
      }}
    >
      <thead style={{ display: 'none', width: '100%' }}>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getFooterGroupProps()}>
            {headerGroup.headers.map((column, i) => (
              <th
                {...column.getHeaderProps()}
                style={{
                  height: '0px',
                  borderBottom: '1px solid #616161',
                  width: rowWidth[i],
                  minWidth: rowMinWidth[i],
                  textAlign: 'left',
                  paddingLeft: '8px',
                  paddingRight: '4px',
                }}
              >
                {column.render('Header')}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody
        {...getTableBodyProps()}
        style={{
          height: '100%',
        }}
      >
        {rows.map(row => {
          prepareRow(row);
          return (
            <tr
              {...row.getRowProps()}
              style={{
                '&:hover': {
                  backgroundColor: '#000',
                },
                width: 'auto',
              }}
            >
              {row.cells.map((cell, i) => {
                return (
                  <td
                    {...cell.getCellProps()}
                    style={
                      !numbering && !mobile && i === 0
                        ? {
                            ...tdStyle,
                            width: 'auto',
                            minWidth: rowMinWidth[i],
                            display: 'none',
                          }
                        : {
                            ...tdStyle,
                            width: rowWidth[i],
                            minWidth: rowMinWidth[i],
                          }
                    }
                  >
                    {cell.render('Cell')}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

BasicTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      Header: PropTypes.string.isRequired,
      accessor: PropTypes.string.isRequired,
    }),
  ).isRequired,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      b: PropTypes.string,
      title: PropTypes.string,
      createdAt: PropTypes.string,
      status: PropTypes.number,
    }),
  ).isRequired,
  mobileWidth: PropTypes.number,
  mobile: PropTypes.bool,
  numbering: PropTypes.bool,
};

BasicTable.defaultProps = {
  mobileWidth: 0,
  mobile: false,
  numbering: true,
};

export default BasicTable;
