import React from 'react';
import { AgGridReact } from 'ag-grid-react';

const MyGridComponent = () => {
  const columnDefs = [
    { headerName: '이름', field: 'name', rowGroup: true },
    { headerName: '나이', field: 'age' },
    { headerName: '도시', field: 'city' },
  ];

  const rowData = [
    { name: 'John', age: 25, city: 'Seoul' },
    { name: 'Jane', age: 30, city: 'Busan' },
    { name: 'Mike', age: 35, city: 'Incheon' },
    { name: 'Sarah', age: 28, city: 'Seoul' },
    { name: 'Chris', age: 32, city: 'Busan' },
  ];

  return (
    <div className="ag-theme-alpine" style={{ height: 400, width: 600 }}>
      <AgGridReact columnDefs={columnDefs} rowData={rowData} />
    </div>
  );
};

export default MyGridComponent;
