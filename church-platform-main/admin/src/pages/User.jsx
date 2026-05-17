import { Box, Button, Typography } from '@mui/material';
import React, { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import useGetQuery from '../hooks/useGetData';
import PaginationDataGrid from '../lib/PaginationDataGrid';
import { UserUrl } from '../api/urlDefine';
import AddUserDialog from '../components/user/AddUserDialog';
import { userApi } from '../api/user';
// import AddUserDialog from '../../components/adminDialog/AddUserDialog';

function UserType({ value }) {
  return <span>{value ? '관리자' : '일반'}</span>;
}

UserType.propTypes = {
  value: PropTypes.bool.isRequired,
};

function User() {
  const gridRef = useRef();
  const navigate = useNavigate();
  const [openAdd, setOpenAdd] = useState(false);
  const location = useLocation();
  const navigation = useNavigate();
  const query = queryString.parse(location.search);

  const pageSize = query.limit || 10;
  const url = UserUrl.list;
  const { data: rowData, refetch } = useGetQuery(
    `${url}?limit=${pageSize}&offset=${query.offset}`,
    { count: 0, rows: [] },
  );

  // eslint-disable-next-line react/no-unstable-nested-components
  const ApprovedCell = ({ data }) => {
    if (data.approved) {
      return <span>승인됨</span>;
    }
    return (
      <Button
        onClick={async () => {
          try {
            await userApi.approve(data.id);
            refetch();
          } catch (err) {
            window.alert(err?.response?.data?.message);
          }
        }}
      >
        승인
      </Button>
    );
  };

  const columnDefs = [
    { field: 'id', headerName: 'NO', sortable: false },
    { field: 'mail', sortable: false },
    { field: 'name', filter: true, sortable: true, unSortIcon: true },
    {
      headerName: '승인 여부',
      cellRendererFramework: ApprovedCell,
    },
    {
      field: 'admin',
      headerName: '유저 분류',
      cellRenderer: UserType,
      sortable: true,
      unSortIcon: true,
    },
  ];

  return (
    <Box>
      <Typography variant="h5">유저 리스트</Typography>
      <Box sx={{ mt: '10px', textAlign: 'right' }}>
        <Button
          variant="contained"
          onClick={() => {
            setOpenAdd(true);
          }}
        >
          추가
        </Button>
      </Box>
      <Box sx={{ mt: '15px' }}>
        <PaginationDataGrid
          pageSize={pageSize}
          ref={gridRef}
          rowData={rowData.rows}
          totalRows={rowData.count}
          columnDefs={columnDefs}
          offset={query.offset || 0}
          onChangePage={page => {
            navigation(
              `${location.pathname}?offset=${
                pageSize * (page - 1)
              }&limit=${pageSize}`,
            );
          }}
        />
      </Box>
      <AddUserDialog
        open={openAdd}
        onClose={isChanged => {
          setOpenAdd(false);
          if (isChanged) {
            navigate(0);
          }
        }}
      />
    </Box>
  );
}

export default User;
