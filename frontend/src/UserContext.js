import React, { createContext, useState } from 'react';

export const UserContext = createContext();

const UserContextProvider = ({ children }) => {
    const [loggedUser, setLoggedUser] = useState(null);

    return (
        <UserContext.Provider value={{ loggedUser, setLoggedUser }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContextProvider;
