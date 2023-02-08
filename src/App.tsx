import React, {useEffect, useState} from 'react';
import logo from './logo.svg';
import './App.css';
import {ApolloProvider} from '@apollo/client'
import {client} from "./apollo-client";
import {TestComponent} from "./test-component";
import Home from "./components/home/Home";
import {getSmas} from "./components/utility/api/services/smas";

function App() {

    const [data, setData] = useState();
    const fetchData = async () => {
        const result = await getSmas('2b4dfa7f-0905-4903-99c0-496b385139a7')
        setData(result);
    }

    useEffect( ()=> {
        fetchData();
    }, [])
    return (
        <ApolloProvider client={client}>
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo"/>
                    <TestComponent/>
                    {data &&  <Home/>}
                </header>

            </div>
        </ApolloProvider>
    );
}

export default App;
