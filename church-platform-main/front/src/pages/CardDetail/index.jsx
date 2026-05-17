import React, { useState } from 'react';
// import PropTypes from 'prop-types';
import queryString from 'query-string';
import { Box, Divider, Chip, Stack, Button, Typography } from '@mui/material';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import qs from 'qs';
import dayjs from 'dayjs';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { menuState, currentMenuId, detailState } from '../../atoms';
import { boardApi } from '../../api/board';
import Viewer from '../../lib/Editor/Viewer';
import ShareIcon from '../../assets/images/ic_share.svg?react';
import AttachIcon from '../../assets/images/ic_attatch.svg?react';
import PrevIcon from '../../assets/images/ic_prev.svg?react';
import NextIcon from '../../assets/images/ic_next.svg?react';
import PrevIconM from '../../assets/images/ic_prev_m.svg?react';
import NextIconM from '../../assets/images/ic_next_m.svg?react';
import { showError, getfindBoard } from '../../lib/utils';
import ShareDialog from '../../components/common/ShareDialog';

const CardDetail = () => {
  let { idx } = useParams();
  const navigate = useNavigate();
  idx = parseInt(idx, 10);
  // console.log('idx', idx);
  const location = useLocation();
  const menuId = useRecoilValue(currentMenuId);
  const query = queryString.parse(location.search);
  const menuList = useRecoilValue(menuState);
  const [content, setContent] = useState(null);
  const [prevContent, setPrevContent] = useState(null);
  const [nextContent, setNextContent] = useState(null);
  const [openShare, setOpenShare] = useState(false);
  // const [title, setTitle] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('desktop'));
  const setDetailData = useSetRecoilState(detailState);
  const param = {
    board_type: 'card',
    idx,
    rownum: parseInt(query.rownum, 10),
    search_type: query.search_type,
    search_text: query.search_text,
  };

  React.useLayoutEffect(() => {
    const requestList = async () => {
      try {
        if (query.category1_idx) {
          param.category1_idx = parseInt(query.category1_idx, 10);
        }
        if (query.category2_idx) {
          param.category2_idx = parseInt(query.category2_idx, 10);
        }
        const { data } = await boardApi.basicDetail(param);
        setContent(data.data.board_data);
        setDetailData(data.data.board_data);
        setPrevContent(data.data.prev_board_data);
        setNextContent(data.data.next_board_data);
        // console.log(data.data);
      } catch (err) {
        showError(err);
      }
    };
    requestList();
    window.scrollTo(0, 0);
  }, [idx]);

  const handleShare = () => {
    setOpenShare(true);
  };
  const handleShareEvent = () => {
    const currentUrl = window.document.location.href;
    const t = document.createElement('textarea');
    document.body.appendChild(t);
    t.value = currentUrl;
    t.select();
    document.execCommand('copy');
    document.body.removeChild(t);
    alert('링크가 복사되었습니다.');
  };
  const handleClickTag = tag => {
    navigate(`/search/${encodeURIComponent(tag)}`);
  };
  const moveConent = (conent_idx, rownum) => {
    const data = {
      rownum,
      search_type: query.search_type,
      search_text: query.search_text,
      category1_idx: query.category1_idx,
      category2_idx: query.category2_idx,
    };
    const newQuery = qs.stringify(data);
    navigate(`/board/card/${conent_idx}?${newQuery}`);
  };
  const handlePrevContent = () => {
    if (prevContent) moveConent(prevContent.idx, prevContent.rownum);
    // else alert('이전글이 없습니다.');
  };
  const handleNextContent = () => {
    if (nextContent) moveConent(nextContent.idx, nextContent.rownum);
    // else alert('다음글이 없습니다.');
  };
  const handleMovetoList = () => {
    const newQeury = qs.stringify({ page: query.page || 1 });
    if (query.board_id) {
      const menu = getfindBoard(menuList, Number(query.board_id));
      if (menu) navigate(`/menu/${menu.menu_idx}?${newQeury}`);
    } else {
      navigate(`/menu/${menuId}?${newQeury}`);
    }
  };

  const handleClickFile = async file => {
    try {
      const downloadPath = file.attachment_url;

      window.URL = window.URL || window.webkitURL;

      const xhr = new XMLHttpRequest();
      const a = document.createElement('a');

      xhr.open('GET', downloadPath, true);
      xhr.responseType = 'blob';
      xhr.onload = () => {
        const downfile = new Blob([xhr.response], {
          type: 'application/octet-stream',
        });
        a.href = window.URL.createObjectURL(downfile);
        a.download = file.attachment_file_name || file.attachment_url;
        a.click();
      };
      xhr.send();
    } catch (err) {
      showError(err);
    }
  };

  React.useLayoutEffect(() => {
    // const rootTitle = findRoot(
    //   menuList,
    //   Number(localStorage.getItem('menuId')),
    // );
    // setTitle(rootTitle?.menu_title);
  }, [menuList]);

  return (
    <Box sx={{ width: '100%' }} display="flex" justifyContent="center">
      {isMobile ? (
        <Box
          display="flex"
          flexDirection="column"
          sx={{
            mt: '32px',
            maxWidth: '1096px',
            width: '1096px',
            minWidth: '360px',
            pr: '16px',
            pl: '16px',
          }}
        >
          <Box
            sx={{
              color: '#495057',
              fontSize: '15px',
              lineHeight: '24px',
              fontWeight: '400',
            }}
          >
            {content?.category1_title ? content?.category1_title : ''}
            {content?.category2_title ? ` > ${content?.category2_title}` : ''}
          </Box>
          <Box
            sx={{
              color: '#212529',
              fontSize: '24px',
              lineHeight: '34px',
              fontWeight: '700',
              mt: '12px',
            }}
          >
            {content?.title}
          </Box>
          <Box
            display="flex"
            alignItems="center"
            sx={{ mt: '12px', width: '100%' }}
          >
            {content?.important_yn === 'Y' ? (
              <Box
                sx={{
                  fontWeight: '700',
                  fontSize: '15px',
                  lineHeight: '24px',
                  color: '#00b2b2',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  mr: '12px',
                }}
              >
                중요
              </Box>
            ) : null}
            <Box
              sx={{
                color: '#495057',
                fontSize: '15px',
                lineHeight: '24px',
                fontWeight: '400',
              }}
            >
              {content?.reg_name}
            </Box>
            <Box
              sx={{
                color: '#495057',
                fontSize: '15px',
                lineHeight: '24px',
                fontWeight: '400',
                ml: '12px',
              }}
            >
              {content?.reg_date
                ? dayjs(new Date(content.reg_date)).format('YYYY.MM.DD')
                : ''}
            </Box>
            <Box
              display="flex"
              alignItems="center"
              onClick={handleShare}
              sx={{
                color: '#495057',
                fontSize: '14px',
                lineHeight: '20px',
                fontWeight: '500',
                cursor: 'pointer',
                ml: 'auto',
              }}
            >
              공유하기
              <ShareIcon
                style={{ marginLeft: '7px', width: '14px', height: '14px' }}
              />
            </Box>
          </Box>
          <Divider
            sx={{ width: '100%', bgcolor: '#e6eaed', mt: '24px', mb: '30px' }}
          />
          <Box
            sx={{
              mb: '24px',
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              flexDirection: 'column',
            }}
          >
            <Viewer model={content?.contents} />
          </Box>
          {content?.attachment?.length > 0 ? (
            <Box display="flex" flexWrap="wrap">
              <AttachIcon />
              <Box
                sx={{
                  ml: '9px',
                  fontWeigth: '700',
                  fontSize: '14px',
                  lineHeight: '20px',
                  color: '#212529',
                }}
              >
                {' : '}
              </Box>
              {content?.attachment.map((file, index) => {
                return (
                  <Box
                    key={file.attachment_url}
                    onClick={() => handleClickFile(file)}
                    sx={{ cursor: 'pointer', ml: '8px' }}
                  >
                    <Typography
                      sx={{
                        textDecoration: 'underline',
                        fontWeight: '400',
                        fontSize: '14px',
                        lineHeight: '24px',
                        color: '#212539',
                      }}
                    >
                      {content.attachment.length - 1 > index
                        ? `${file.attachment_file_name ?? file.attachment_url},`
                        : `${file.attachment_file_name ?? file.attachment_url}`}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          ) : null}
          <Stack
            display="flex"
            direction="row"
            flexWrap="wrap"
            sx={{ width: '100%', mt: '24px' }}
          >
            {content?.hash_tag.map(item => {
              return (
                <Chip
                  key={item}
                  label={`#${item}`}
                  sx={{
                    p: '8px',
                    m: '2px',
                    height: '32px',
                    bgcolor: '#f3f4f6',
                    borderRadius: '20px',
                  }}
                  onClick={() => handleClickTag(item)}
                />
              );
            })}
          </Stack>
          <Divider sx={{ width: '100%', bgcolor: '#e6eaed', mt: '24px' }} />
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{ height: '55px', width: '100%', mt: '15px', mb: '20px' }}
          >
            <Box
              display="flex"
              alignItems="center"
              onClick={handlePrevContent}
              sx={{ cursor: prevContent ? 'pointer' : '' }}
            >
              <PrevIconM />
              <Box
                sx={{
                  ml: '10px',
                  fontWeigth: '500',
                  fontSize: '14px',
                  lineHeight: '28px',
                  color: prevContent ? '#212529' : '#adb5bd',
                }}
              >
                이전글
              </Box>
            </Box>
            <Button
              variant="outlined"
              sx={{
                height: '40px',
                width: '74px',
                color: '#495057',
                borderColor: '#495057',
                borderRadius: '3px',
              }}
              onClick={handleMovetoList}
            >
              목록
            </Button>
            <Box
              display="flex"
              alignItems="center"
              onClick={handleNextContent}
              sx={{ cursor: nextContent ? 'pointer' : '' }}
            >
              <Box
                sx={{
                  mr: '10px',
                  fontWeigth: '400',
                  fontSize: '14px',
                  lineHeight: '28px',
                  color: nextContent ? '#212529' : '#adb5bd',
                }}
              >
                다음글
              </Box>
              <NextIconM />
            </Box>
          </Box>
          <ShareDialog
            open={openShare}
            onClose={() => setOpenShare(false)}
            onEvent={handleShareEvent}
            mobile
          />
        </Box>
      ) : (
        <Box
          display="flex"
          flexDirection="column"
          sx={{
            mt: '80px',
            maxWidth: '1300px',
            width: '1300px',
            minWidth: '1097px',
            pr: '10px',
            pl: '10px',
          }}
        >
          <Box
            sx={{
              color: '#495057',
              fontSize: '18px',
              lineHeight: '28px',
              fontWeight: '400',
            }}
          >
            {content?.category1_title ? content?.category1_title : ''}
            {content?.category2_title ? ` > ${content?.category2_title}` : ''}
          </Box>
          <Box
            display="flex"
            alignItems="center"
            sx={{ mt: '16px', width: '100%' }}
          >
            <Box
              sx={{
                color: '#212529',
                fontSize: '40px',
                lineHeight: '52px',
                fontWeight: '700',
              }}
            >
              {content?.title}
            </Box>
            {content?.important_yn === 'Y' ? (
              <Box
                sx={{
                  width: '50px',
                  height: '30px',
                  bgcolor: '#00c4c4',
                  borderRadius: '3px',
                  fontWeight: '700',
                  fontSize: '14px',
                  lineHeight: '14px',
                  color: '#fff',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  ml: '15px',
                }}
              >
                중요
              </Box>
            ) : null}
          </Box>
          <Box
            display="flex"
            sx={{ mt: '16px' }}
            justifyContent="space-between"
          >
            <Box display="flex">
              <Box
                sx={{
                  color: '#495057',
                  fontSize: '18px',
                  lineHeight: '28px',
                  fontWeight: '400',
                }}
              >
                {content?.reg_name}
              </Box>
              <Box
                sx={{
                  color: '#495057',
                  fontSize: '18px',
                  lineHeight: '28px',
                  fontWeight: '400',
                  ml: '16px',
                }}
              >
                {content?.reg_date
                  ? dayjs(new Date(content.reg_date)).format('YYYY.MM.DD')
                  : ''}
              </Box>
            </Box>
            <Box
              display="flex"
              alignItems="center"
              onClick={handleShare}
              sx={{
                color: '#495057',
                fontSize: '18px',
                lineHeight: '28px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              공유하기
              <ShareIcon style={{ marginLeft: '7px' }} />
            </Box>
          </Box>
          <Divider
            sx={{ width: '100%', bgcolor: '#e6eaed', mt: '40px', mb: '55px' }}
          />
          <Box sx={{ mb: '40px', pl: '150px', pr: '150px' }}>
            <Viewer model={content?.contents} />
          </Box>
          {content?.attachment?.length > 0 ? (
            <Box
              sx={{
                mt: '40px',
                fontWeigth: '700',
                fontSize: '15px',
                lineHeight: '24px',
                color: '#212529',
                pl: '150px',
                pr: '150px',
              }}
              display="flex"
              flexWrap="wrap"
            >
              <AttachIcon />
              <Box
                sx={{
                  ml: '9px',
                  fontWeigth: '700',
                  fontSize: '15px',
                  lineHeight: '24px',
                  color: '#212529',
                }}
              >
                첨부파일 :
              </Box>
              {content?.attachment.map((file, index) => {
                return (
                  <Box
                    key={file.attachment_url}
                    onClick={() => handleClickFile(file)}
                    sx={{ cursor: 'pointer', ml: '8px' }}
                  >
                    <Typography
                      sx={{
                        textDecoration: 'underline',
                        fontWeight: '400',
                        fontSize: '15px',
                        lineHeight: '24px',
                        color: '#212539',
                      }}
                    >
                      {content.attachment.length - 1 > index
                        ? `${file.attachment_file_name ?? file.attachment_url},`
                        : `${file.attachment_file_name ?? file.attachment_url}`}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          ) : null}
          <Stack
            display="flex"
            direction="row"
            flexWrap="wrap"
            sx={{ width: '100%', pl: '150px', pr: '150px', mt: '24px' }}
          >
            {content?.hash_tag.map(item => {
              return (
                <Chip
                  key={item}
                  label={`#${item}`}
                  sx={{
                    p: '8px',
                    m: '4px',
                    height: '36px',
                    bgcolor: '#f3f4f6',
                    borderRadius: '20px',
                  }}
                  onClick={() => handleClickTag(item)}
                />
              );
            })}
          </Stack>
          <Box
            sx={{
              width: '100%',
              mt: '60px',
              mb: '100px',
              alignItems: 'center',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Divider sx={{ width: '100%', bgcolor: '#e6eaed' }} />
            <Box
              display="flex"
              alignItems="center"
              sx={{ height: '55px', width: '100%' }}
            >
              <PrevIcon />
              <Box
                sx={{
                  ml: '10px',
                  fontWeigth: '400',
                  fontSize: '16px',
                  lineHeight: '28px',
                  color: '#90949c',
                }}
              >
                이전글
              </Box>
              {prevContent ? (
                <Box
                  sx={{
                    ml: '32px',
                    fontWeigth: '400',
                    fontSize: '18px',
                    lineHeight: '24px',
                    color: '#212529',
                    cursor: 'pointer',
                  }}
                  onClick={handlePrevContent}
                >
                  {prevContent.title}
                </Box>
              ) : (
                <Box
                  sx={{
                    ml: '32px',
                    fontWeigth: '400',
                    fontSize: '18px',
                    lineHeight: '28px',
                    color: '#adb5bd',
                  }}
                >
                  이전글이 없습니다.
                </Box>
              )}
            </Box>
            <Divider sx={{ width: '100%', bgcolor: '#e6eaed' }} />
            <Box
              display="flex"
              alignItems="center"
              sx={{ height: '55px', width: '100%' }}
            >
              <NextIcon />
              <Box
                sx={{
                  ml: '10px',
                  fontWeigth: '400',
                  fontSize: '16px',
                  lineHeight: '28px',
                  color: '#90949c',
                }}
              >
                다음글
              </Box>
              {nextContent ? (
                <Box
                  sx={{
                    ml: '32px',
                    fontWeigth: '400',
                    fontSize: '18px',
                    lineHeight: '24px',
                    color: '#212529',
                    cursor: 'pointer',
                  }}
                  onClick={handleNextContent}
                >
                  {nextContent.title}
                </Box>
              ) : (
                <Box
                  sx={{
                    ml: '32px',
                    fontWeigth: '400',
                    fontSize: '18px',
                    lineHeight: '28px',
                    color: '#adb5bd',
                  }}
                >
                  다음글이 없습니다.
                </Box>
              )}
            </Box>
            <Divider sx={{ width: '100%', bgcolor: '#e6eaed' }} />
            <Button
              variant="outlined"
              sx={{
                height: '48px',
                width: '166px',
                mt: '40px',
                color: '#495057',
                borderRadius: '3px',
                borderColor: '#cdd3d8',
                fontWeight: '500',
                fontSize: '16px',
                lineHeight: '28px',
              }}
              onClick={handleMovetoList}
            >
              목록으로 돌아가기
            </Button>
          </Box>
          <ShareDialog
            open={openShare}
            onClose={() => setOpenShare(false)}
            onEvent={handleShareEvent}
          />
        </Box>
      )}
    </Box>
  );
};

CardDetail.propTypes = {};

export default CardDetail;
