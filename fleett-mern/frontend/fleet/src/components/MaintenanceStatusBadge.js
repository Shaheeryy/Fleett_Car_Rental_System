import React from 'react';
import PropTypes from 'prop-types';

const MaintenanceStatusBadge = ({ status }) => {
  // Determine badge style based on status
  const getBadgeStyle = () => {
    switch (status.toLowerCase()) {
      case 'under maintenance':
        return { background: '#FFA500', color: 'black' }; // Orange
      case 'completed':
        return { background: '#4CAF50', color: 'white' }; // Green
      case 'scheduled':
        return { background: '#2196F3', color: 'white' }; // Blue
      default:
        return { background: '#9E9E9E', color: 'white' }; // Gray
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

MaintenanceStatusBadge.propTypes = {
  status: PropTypes.string.isRequired
};

export default MaintenanceStatusBadge;