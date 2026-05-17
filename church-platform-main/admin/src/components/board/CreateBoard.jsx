import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import { Dialog, Box } from '@mui/material';
import IconClose from '../../assets/svgs/common/ic_close.svg?react';
import ChButton from '../common/ChButton';
import QuillEditor from '../../lib/QuillEditor';
import ChButtonSecondary from '../common/ChButtonSecondary';
import AttachedFileButton from '../common/AttachedFileButton';
import { showToastError, showToastSucess } from '../../lib/utils';
import { boardApi } from '../../api/board';
import { menuType } from '../../define';

const StyledInputText = styled('input')(({ theme }) => ({
  width: '100%',
  borderTop: 'none',
  borderLeft: 'none',
  borderRight: 'none',
  borderBottom: '1px solid #CECECE',
  padding: '0 1px 6px 1px',
  marginTop: '24px',
  fontFamily: 'Pretendard',
  fontWeight: 400,
  fontSize: '14px',
  lineHeight: '20px',
  color: '#212121',
  '&:focus': {
    outline: 'none !important',
    borderBottom: '2px solid #0099FF',
  },
  [theme.breakpoints.down('desktop')]: {
    width: '100%',
  },
}));

const StyledKeyBox = styled(Box)({
  fontWeight: 600,
  fontSize: '14px',
  lineHeight: '24px',
  color: 'black',
});

function CreateBoard({ open, onClose, menu }) {
  const [localFiles, setLocalFiles] = useState([]);
  const [uploadImages, setUploadImages] = useState([]);

  const inputTitle = useRef(null);
  const inputEditor = useRef(null);
  const inputVideoLink = useRef(null);
  const inputFileRef = useRef();

  const handleEditorUploadImage = async image => {
    const resData = await boardApi.addImage(menu.id, image);
    setUploadImages([
      ...uploadImages,
      { id: resData.data.id, name: resData.data.originalname },
    ]);
    return resData;
  };

  const checkValidation = () => {
    const title = inputTitle.current.value;
    const content = inputEditor.current.state.value;
    const videoLink = inputVideoLink.current?.value;

    if (!title) {
      showToastError('제목을 입력해주세요.');
      return false;
    }

    if (!content) {
      showToastError('내용을 입력해주세요.');
      return false;
    }

    if (menu.type === menuType.Sermon) {
      if (!videoLink) {
        showToastError('비디오 링크를 입력해주세요');
        return false;
      }
    }

    return true;
  };

  const createFormData = isTemp => {
    const fd = new FormData();
    localFiles.forEach(file => {
      fd.append('attachedFiles', file);
    });
    uploadImages.forEach(file => {
      fd.append('attachedImageIds[]', file.id);
    });
    fd.append('title', inputTitle.current.value);
    fd.append('content', inputEditor.current.state.value);
    fd.append('videoUrl', inputVideoLink.current?.value);
    fd.append('isTemp', isTemp);

    return fd;
  };

  const saveDraft = async () => {
    try {
      const fd = createFormData(true);
      await boardApi.basicAdd(menu.id, fd);
      showToastSucess('임시 저장 되었습니다.');
      onClose();
    } catch (err) {
      window.alert(err?.response?.data?.message);
    }
  };

  const save = async () => {
    try {
      const fd = createFormData(false);
      await boardApi.basicAdd(menu.id, fd);
      onClose();
    } catch (err) {
      window.alert(err?.response?.data?.message);
    }
  };

  const handleClickApplyDraft = () => {
    saveDraft();
  };
  const handleClickApply = () => {
    if (checkValidation()) {
      save();
    }
  };

  return (
    <Dialog
      open={open}
      scroll="paper"
      PaperProps={{
        sx: { width: '1000px', minHeight: '800px', borderRadius: '10px' },
      }}
      onClose={() => onClose()}
    >
      <Box>
        <Box
          sx={{
            height: '55px',
            display: 'flex',
            justifyContent: 'space-between',
            background: '#EDF7FE',
            padding: '16px 20px 15px 20px',
          }}
        >
          <Box
            sx={{
              fontWeight: 600,
              fontSize: '18px',
              lineHeight: '24px',
              color: 'black',
            }}
          >
            작성
          </Box>
          <Box onClick={() => onClose()}>
            <IconClose />
          </Box>
        </Box>

        <Box sx={{ padding: '0px 20px 20px 20px' }}>
          <StyledInputText ref={inputTitle} placeholder="제목을 입력해주세요" />
        </Box>
        {menu.type === menuType.Sermon && (
          <Box sx={{ padding: '0px 20px 20px 20px' }}>
            <StyledInputText
              ref={inputVideoLink}
              placeholder="비디오 링크를 입력해주세요"
            />
          </Box>
        )}
        <Box sx={{ padding: '0 20px', mt: '10px' }}>
          <Box
            sx={{
              border: '1px solid #BCBCBC',
              '#quill-editor': {
                '& .ql-editor': {
                  minHeight: '400px',
                },
              },
            }}
          >
            <QuillEditor
              inputEditor={inputEditor}
              uploadFun={handleEditorUploadImage}
              formDataName="image"
              afterUploadImage={() => {}}
              onAlarm={() => {}}
            />
          </Box>
        </Box>
        <input
          type="file"
          name="myFileInput"
          id="file_input"
          style={{ display: 'none' }}
          ref={inputFileRef}
          onChange={event => {
            setLocalFiles([...localFiles, event.target.files[0]]);
          }}
        />
        <Box
          sx={{ mt: '20px', display: 'flex', alignItems: 'center', ml: '20px' }}
        >
          <StyledKeyBox>이미지 첨부</StyledKeyBox>
          <Box sx={{ ml: '20px' }}>
            {uploadImages.map((file, index) => (
              <Box
                key={`attached-file-${index.toString()}`}
                sx={{ marginTop: '15px' }}
              >
                <AttachedFileButton
                  name={file.name}
                  onClickDelete={() => {
                    const newList = uploadImages.filter(
                      (_, index2) => index !== index2,
                    );
                    setUploadImages(newList);
                  }}
                  editable
                />
              </Box>
            ))}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', margin: '20px 20px 0 20px' }}>
          <StyledKeyBox>파일첨부</StyledKeyBox>
          <Box sx={{ marginLeft: '20px' }}>
            <ChButtonSecondary
              sx={{
                padding: '13px 20px',
                fontWeight: 600,
                fontSize: '16px',
                lineHeight: '20px',
              }}
              onClick={() => {
                if (inputFileRef.current) inputFileRef.current.click();
              }}
            >
              파일첨부
            </ChButtonSecondary>

            <Box sx={{ marginTop: '3px' }}>
              {localFiles.map((file, index) => (
                <Box
                  key={`attached-file-${index.toString()}`}
                  sx={{ marginTop: '15px' }}
                >
                  <AttachedFileButton
                    name={file.name}
                    onClickDelete={() => {
                      const newList = localFiles.filter(
                        (_, index2) => index !== index2,
                      );
                      setLocalFiles(newList);
                    }}
                    editable
                  />
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-around',
            marginTop: '47px',
            marginBottom: '47px',
          }}
        >
          <Box>
            <ChButtonSecondary onClick={handleClickApplyDraft}>
              임시저장
            </ChButtonSecondary>
            <ChButton onClick={handleClickApply} sx={{ marginLeft: '15px' }}>
              완료
            </ChButton>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
}
CreateBoard.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  menu: PropTypes.object.isRequired,
};
CreateBoard.defaultProps = {
  open: false,
};
export default CreateBoard;
