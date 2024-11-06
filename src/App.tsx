import "./App.css";
import styled from "styled-components";
import axios from "axios";
import { useState } from "react";

import {
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
} from "@mui/material";

import { DateRangePicker } from "react-date-range";

const Body = styled.div<{ error: boolean }>`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    display: ${({ error }) => error && "none"};
`;

const Error = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: absolute;

    top: 30%;
    left: 45%;
    width: 300px;
    height: 200px;

    background-color: lightpink;
    color: black;

    border-radius: 12px;
    border: 1px solid white;
`;

function App() {
    const [transactions, setTransactions] = useState([]);
    const [showError, setShowError] = useState(false);

    const handleFetch = () => {
        axios
            .get(
                "https://672be4011600dda5a9f6ae2c.mockapi.io/mockapi/transactions"
            )
            .then((response) => {
                console.log({ response });
                setTransactions(response.data);
            })
            .catch((err) => {
                setShowError(true);
            });
    };

    //handleSelectDate(date){
    //  }

    return (
        <>
            <Body error={showError}>
                <h1>Transactions</h1>

                <button onClick={() => handleFetch()}>fetchTransactions</button>

                {/*<DateRangePicker
        ranges={}
        onChange={this.handleSelectDate}
      />*/}

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Transaction ID</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Amount</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {transactions.map((transactionData) => (
                                <TableRow key={transactionData.id}>
                                    <TableCell>{transactionData.id}</TableCell>
                                    <TableCell>
                                        {transactionData.date}
                                    </TableCell>
                                    <TableCell>
                                        {transactionData.description}
                                    </TableCell>
                                    <TableCell>
                                        {transactionData.amount}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Body>

            {showError && (
                <Error>
                    <h4>Sorry! There's been an error fetching the request</h4>
                    <button onClick={() => setShowError(false)}>
                        Understood
                    </button>
                </Error>
            )}
        </>
    );
}

export default App;
