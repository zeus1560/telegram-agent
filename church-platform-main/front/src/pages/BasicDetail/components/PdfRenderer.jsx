import React, { useState } from 'react';
import { useWindowWidth } from '@react-hook/window-size';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

// eslint-disable-next-line react/prop-types
const PdfRenderer = ({ url }) => {
  const onlyWidth = useWindowWidth();
  const [numPages, setNumPages] = useState();

  const onDocumentLoadSuccess = ({ _pdfInfo }) => {
    setNumPages(_pdfInfo?.numPages);
  };

  let widthSize = onlyWidth - 40;
  if (widthSize > 1400) {
    widthSize = 1400;
  }

  return (
    <div>
      <Document file={url} onLoadSuccess={onDocumentLoadSuccess}>
        {Array.from(new Array(numPages), (el, index) => (
          <Page
            key={`page_${index + 1}`}
            pageNumber={index + 1}
            width={widthSize}
          />
        ))}
      </Document>
    </div>
  );
};

export default PdfRenderer;
