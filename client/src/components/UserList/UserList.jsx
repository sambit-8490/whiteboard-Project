import React from 'react';

const UserList = ({ users = [] }) => {
  if (!Array.isArray(users)) {
    return null;
  }

  return (
    <div className="user-list">
      <h3>Users</h3>
      {users.length === 0 ? (
        <p>No users connected</p>
      ) : (
        <ul>
          {users.map((u) => (
            <li key={u.userId}>
              <span>{u.userName || 'Anonymous'}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserList;


