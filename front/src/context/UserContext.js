import { createContext, useState } from "react";

export const UserContext = createContext();

export const UserProvider = ({children}) => {
    const [usuario, setUsuario] = useState({
        nombre: "s/n",
        edad: 0
    });

    return (
        <UserContext.Provider value={{usuario, setUsuario}}>
            {children}
        </UserContext.Provider>
    );
}