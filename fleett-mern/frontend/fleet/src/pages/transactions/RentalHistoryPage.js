import React, { useState } from 'react';

const RentalHistoryPage = () => {
  const [history, setHistory] = useState([
    { id: 1, customer: 'John Doe', vehicle: 'Toyota Corolla', period: '2023-11-01 to 2023-11-07', cost: 200 },
    { id: 2, customer: 'Jane Smith', vehicle: 'Ford Mustang', period: '2023-11-03 to 2023-11-10', cost: 300 },
  ]);

  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState('');

  const filteredHistory = history.filter((rental) => {
    const matchesSearch =
      rental.customer.toLowerCase().includes(search.toLowerCase()) ||
      rental.vehicle.toLowerCase().includes(search.toLowerCase());
    const matchesDate = !dateRange || rental.period.includes(dateRange);
    return matchesSearch && matchesDate;
  });

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Rental History</h2>

      {/* Search and Filters */}
      <div className="d-flex justify-content-between mb-3">
        <input
          type="text"
          className="form-control w-50"
          placeholder="Search by customer or vehicle..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          type="date"
          className="form-control w-25"
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
        />
      </div>

      {/* History List */}
      <table className="table table-hover">
        <thead className="table-primary">
          <tr>
            <th>Customer Name</th>
            <th>Vehicle</th>
            <th>Rental Period</th>
            <th>Cost</th>
          </tr>
        </thead>
        <tbody>
          {filteredHistory.map((rental) => (
            <tr key={rental.id}>
              <td>{rental.customer}</td>
              <td>{rental.vehicle}</td>
              <td>{rental.period}</td>
              <td>${rental.cost}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RentalHistoryPage;
