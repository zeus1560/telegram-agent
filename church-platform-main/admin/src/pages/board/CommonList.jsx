/* eslint-disable react/no-unstable-nested-components */
import { Box, Button, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import queryString from 'query-string';
import useGetQuery from '../../hooks/useGetData';
import { BoardUrl } from '../../api/urlDefine';
import PaginationDataGrid from '../../lib/PaginationDataGrid';
import CreateBoard from '../../components/board/CreateBoard';
import { boardApi } from '../../api/board';
import EditBoard from '../../components/board/EditBoard';
import Loading from '../../components/common/Loading';

function CommonList({ menu }) {
  const gridRef = useRef();
  const [loading, setLoading] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedBoardId, setSelectedBoardId] = useState(null);
  const navigation = useNavigate();
  const location = useLocation();
  const query = queryString.parse(location.search);

  // const [pageSize, setPageSize] = useState(query.limit || 10);
  const pageSize = query.limit || 10;
  const url = BoardUrl.basicList(menu.id);

  const { data: rowData, refetch } = useGetQuery(
    `${url}?limit=${pageSize}&offset=${query.offset || 0}`,
    { count: 0, rows: [] },
  );

  const columnDefs = [
    { field: 'id', headerName: 'NO', sortable: false },
    { field: 'title', filter: true, sortable: true, unSortIcon: true },
    {
      field: 'isTemp',
      headerName: '임시작성중',
      cellRendererFramework: ({ data }) => {
        return data.isTemp ? '임시작성중' : '완료';
      },
    },
    {
      field: 'creator.name',
      headerName: '작성자',
      sortable: true,
      unSortIcon: true,
    },
    {
      headerName: '수정',
      cellRendererFramework: ({ data }) => {
        return (
          <>
            <Button
              variant="contained"
              onClick={() => {
                setSelectedBoardId(data.id);
                setOpenEdit(true);
              }}
            >
              수정
            </Button>
            <Button
              variant="contained"
              sx={{ ml: '10px' }}
              color="warning"
              onClick={async () => {
                if (window.confirm('삭제하시겠습니까?')) {
                  try {
                    setLoading(true);
                    await boardApi.delete(menu.id, data.id);
                    setLoading(false);
                    refetch();
                  } catch (e) {
                    // eslint-disable-next-line no-console
                    console.log(e);
                    setLoading(false);
                  }
                }
              }}
            >
              삭제
            </Button>
          </>
        );
      },
    },
  ];

  return (
    <Box>
      {loading && <Loading />}
      <Typography variant="h5">{menu.title}</Typography>
      <Box sx={{ mt: '10px', textAlign: 'right' }}>
        <Button
          sx={{ mb: '15px' }}
          variant="contained"
          onClick={() => {
            setOpenAdd(true);
          }}
        >
          추가
        </Button>
      </Box>
      <Box>
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
      <CreateBoard
        key={openAdd}
        open={openAdd}
        onClose={() => {
          setOpenAdd(false);
          refetch();
        }}
        menu={menu}
      />
      <EditBoard
        key={openEdit}
        open={openEdit}
        onClose={() => {
          setOpenEdit(false);
          refetch();
        }}
        menu={menu}
        boardId={selectedBoardId}
      />
    </Box>
  );
}

export default CommonList;

CommonList.propTypes = {
  menu: PropTypes.shape({
    title: PropTypes.string,
    id: PropTypes.number,
    type: PropTypes.number,
  }).isRequired,
};
