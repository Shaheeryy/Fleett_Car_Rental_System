import React from 'react';
import PropTypes from 'prop-types';

const RentalStatusBadge = ({ status }) => {
  // Determine badge color based on status
  const getBadgeStyle = () => {
    switch (status.toLowerCase()) {
      case 'active':
        return { background: '#4CAF50', color: 'white' }; // Green
      case 'pending':
        return { background: '#FFC107', color: 'black' }; // Amber
      case 'overdue':
        return { background: '#F44336', color: 'white' }; // Red
      case 'completed':
        return { background: '#9E9E9E', color: 'white' }; // Gray
      case 'returned':
        return { background: '#607D8B', color: 'white' }; // Blue gray
      default:
        return { background: '#2196F3', color: 'white' }; // Blue
    }
  };

  return (
    <span style={{
      padding: '5px 10px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 'bold',
      textTransform: 'capitalize',
      display: 'inline-block',
      ...getBadgeStyle()
    }}>
      {status}
    </span>
  );
};

RentalStatusBadge.propTypes = {
  status: PropTypes.string.isRequired
};

export default RentalStatusBadge;