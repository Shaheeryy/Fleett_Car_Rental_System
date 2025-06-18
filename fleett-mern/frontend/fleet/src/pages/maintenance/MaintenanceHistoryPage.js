import React, { useState } from 'react';

const MaintenanceHistoryPage = () => {
  const [history, setHistory] = useState([
    {
      id: 1,
      vehicle: 'Toyota Corolla',
      issue: 'Brake Pads Replacement',
      resolutionDate: '2023-11-07',
    },
    {
      id: 2,
      vehicle: 'Ford Mustang',
      issue: 'Oil Change',
      resolutionDate: '2023-11-15',
    },
  ]);

  const [search, setSearch] = useState('');

  // Filter logic
  const filteredHistory = history.filter((entry) => {
    return entry.vehicle.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Maintenance History</h2>

      {/* Search */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search by vehicle..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Maintenance History List */}
      <table className="table table-hover">
        <thead className="table-primary">
          <tr>
            <th>Vehicle</th>
            <th>Issue</th>
            <th>Resolution Date</th>
          </tr>
        </thead>
        <tbody>
          {filteredHistory.map((entry) => (
            <tr key={entry.id}>
              <td>{entry.vehicle}</td>
              <td>{entry.issue}</td>
              <td>{entry.resolutionDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MaintenanceHistoryPage;
