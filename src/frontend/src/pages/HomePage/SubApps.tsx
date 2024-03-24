import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';

function MyDataGridComponent() {
  const [data, setData] = useState([]);
  const url =
    'https://script.google.com/macros/s/AKfycbyCUsZOwaJQuk3Hie8i6HCAVyyXIdM3T_OCjkL9mZ_4GLIZyqW6-N5hFIInA6SchM8kZQ/exec';

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Using fetch with redirect follow configuration
        const response = await fetch(url, {
          method: 'GET',
          redirect: 'follow'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const jsonData = await response.json();
        setData(jsonData);
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };

    fetchData();
  }, []);

  const columns = [
    { field: 'Timestamp', headerName: 'Timestamp', width: 200 },
    { field: 'Name', headerName: 'Name', width: 130 },
    { field: 'Email', headerName: 'Email', width: 200 },
    { field: 'importantThing', headerName: "What's one important thing you learned in class today?", width: 330 },
    { field: 'prepared', headerName: "Did you feel prepared for today's lesson? Why or why not?", width: 330 },
    { field: 'helpful', headerName: "What would help make today's lesson more effective?", width: 330 }
  ];

  const rows = (
    data as {
      Timestamp: string;
      Name: string;
      Email: string;
      ["What's one important thing you learned in class today?"]: string;
      ["Did you feel prepared for today's lesson? Why or why not?"]: string;
      ["What would help make today's lesson more effective?"]: string;
    }[]
  ).map((item, index) => ({
    id: index,
    Timestamp: item.Timestamp,
    Name: item.Name,
    Email: item.Email,
    importantThing: item["What's one important thing you learned in class today?"],
    prepared: item["Did you feel prepared for today's lesson? Why or why not?"],
    helpful: item["What would help make today's lesson more effective?"]
  }));

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid rows={rows} columns={columns} pageSize={5} checkboxSelection />
    </div>
  );
}

export default MyDataGridComponent;
