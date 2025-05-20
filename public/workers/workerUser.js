self.onmessage = function (e) {
  const { users, action, payload } = e.data;

  switch (action) {
    case 'SORT_BY_NAME':
      const sortedUsers = [...users].sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        return nameA.localeCompare(nameB);
      });
      self.postMessage(sortedUsers);
      break;

    case 'FILTER_BY_ROLE':
      const filteredUsers = users.filter(user => user.role === payload.role);
      self.postMessage(filteredUsers);
      break;

    case 'RESET':
      self.postMessage(users);
      break;

    default:
      self.postMessage(users);
  }
};