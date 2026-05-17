import React, { useMemo } from 'react';
import Resizer from 'react-image-file-resizer';
import ReactQuill, { Quill } from 'react-quill-2';
import PropTypes from 'prop-types';
import QuillImageDropAndPaste from 'quill-image-drop-and-paste';
import QuillBetterTable from 'quill-better-table';
import 'react-quill-2/dist/quill.snow.css';
import moment from 'moment';

const resizeFile = file =>
  new Promise(resolve => {
    Resizer.imageFileResizer(
      file,
      1080, // maxWidth
      1920, // maxHeight
      'PNG', // img Type
      100,
      0,
      uri => {
        resolve(uri);
      },
      'file', // output Type
    );
  });

Quill.register({ 'modules/better-table': QuillBetterTable }, true);
Quill.register('modules/imageDropAndPaste', QuillImageDropAndPaste);

const Editor = ({
  inputEditor,
  content,
  uploadFun,
  id,
  formDataName,
  afterUploadImage,
  onAlarm,
}) => {
  // foucs 문제로 인해 useMemo 를 사용
  // useMemo 를 사용하지 않으면 렌더링 할때마다 quill editor 에 포커싱이 된다.
  const modules = useMemo(() => {
    const uploadImageAndInsertEmbed = async formData => {
      try {
        const {
          config: { baseURL },
          data,
        } = await uploadFun(id, formData);

        const quill = inputEditor.current.editor;

        const range = quill.getSelection(true);

        quill.insertEmbed(
          range.index,
          'image',
          `${baseURL}/savedFileName/${data[0].savedFileName}`,
        );
        quill.setSelection(range.index + 1);

        afterUploadImage();
      } catch {
        if (onAlarm) {
          onAlarm({ title: '이미지 삽입 실패', color: 'red' });
        }
      }
    };
    return {
      uploader: false,
      imageDropAndPaste: {
        handler: async (_imageDataUrl, _type, imageData) => {
          const image = await resizeFile(imageData);
          const file = image.toFile(
            `image_${moment().format('YY-MM-DD-HH:mm:ss')}.png`,
          );
          const formData = new FormData();
          formData.append(formDataName, file);

          await uploadImageAndInsertEmbed(formData);
        },
      },
      table: false,
      'better-table': {},
      toolbar: {
        container: [
          [{ header: [1, 2, false] }],
          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
          [{ color: [] }, { background: [] }],
          [
            { list: 'ordered' },
            { list: 'bullet' },
            { indent: '-1' },
            { indent: '+1' },
          ],
          [{ align: [] }],
          ['link', 'image', 'video'],
          ['clean'],
          ['betterTable'],
        ],
        handlers: {
          image() {
            const input = document.createElement('input');

            input.setAttribute('type', 'file');
            input.setAttribute('accept', 'image/*');
            input.click();

            input.onchange = async () => {
              const file = input.files[0];
              const image = await resizeFile(file);
              const formData = new FormData();
              formData.append(formDataName, image);

              await uploadImageAndInsertEmbed(formData);
            };
          },
          betterTable() {
            const quill = inputEditor.current.editor;
            const tableModule = quill.getModule('better-table');
            tableModule.insertTable(3, 3);
          },
        },
      },
    };
  }, [inputEditor, formDataName, afterUploadImage, id, uploadFun, onAlarm]);

  return (
    <div id="quill-editor">
      <ReactQuill
        defaultValue={content}
        theme="snow"
        ref={inputEditor}
        modules={modules}
      />
    </div>
  );
};

Editor.propTypes = {
  inputEditor: PropTypes.shape({ current: PropTypes.instanceOf(Object) })
    .isRequired,
  content: PropTypes.string,
  uploadFun: PropTypes.func.isRequired,
  id: PropTypes.number.isRequired,
  formDataName: PropTypes.string.isRequired,
  afterUploadImage: PropTypes.func.isRequired,
  onAlarm: PropTypes.func.isRequired,
};

Editor.defaultProps = {
  content: '',
};

export default Editor;
