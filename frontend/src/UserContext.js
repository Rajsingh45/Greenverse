import React, { createContext, useState } from 'react';

export const UserContext = createContext();

const UserContextProvider = ({ children }) => {
    const [loggedUser, setLoggedUser] = useState(null);
    const [users, setUsers] = useState([]);

    const handleUserUpdated = (updatedUser) => {
        setUsers((prevUsers) =>
          prevUsers.map((user) => (user._id === updatedUser._id ? updatedUser : user))
        );
    };

    return (
        <UserContext.Provider value={{ loggedUser, setLoggedUser, users, handleUserUpdated }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContextProvider;
