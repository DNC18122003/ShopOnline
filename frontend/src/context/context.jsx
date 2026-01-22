// import { useState, createContext } from 'react';
import React from 'react';
const Context = React.createContext(null);

export const ContextProvider = ({ children }) => {
    const [dataTest, setDataTest] = React.useState(null);
    const value = {
        dataTest,
        setDataTest,
    };
    return <Context.Provider value={value}>{children}</Context.Provider>;
};
