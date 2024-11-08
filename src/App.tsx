import "./App.css";
import styled from "styled-components";
import axios from "axios";
import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Button,
    Select,
    MenuItem,
    FormControl,
    TableSortLabel,
} from "@mui/material";

interface Transaction {
    id: string;
    date: string;
    description: string;
    amount: number;
}

const Body = styled.div<{ error: boolean }>`
    display: flex;
    width: 80vw;
    max-width: 1280px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    align-self: center;
    justify-self: center;
    display: ${({ error }) => error && "none"};
    color: black;
`;

const Pagination = styled.div`
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
    align-items: center;
`;

const Summary = styled.div`
    display: flex;
    justify-content: space-between;
    width: 380px;
    margin: 0 0 20px;
    padding: 10px;
    background-color: #f1f1f1;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Error = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 30%;
    left: 45%;
    padding: 30px;
    background-color: lightpink;
    color: black;
    border-radius: 12px;
    border: 1px solid white;
`;

const App: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [filteredTransactions, setFilteredTransactions] = useState<
        Transaction[]
    >([]);
    const [showError, setShowError] = useState<boolean>(false);
    const [dateRange, setDateRange] = useState<
        [Date | undefined, Date | undefined]
    >([undefined, undefined]);
    const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [transactionsPerPage, setTransactionsPerPage] = useState<number>(5);

    const [order, setOrder] = useState<"asc" | "desc">("asc");
    const [orderBy, setOrderBy] = useState<keyof Transaction | null>(null);

    const totalTransactionCount = filteredTransactions.length;
    const totalAmount = filteredTransactions.reduce(
        (acc, transaction) => acc + transaction.amount,
        0
    );

    const toggleDatePicker = () => {
        setShowDatePicker(!showDatePicker);
        setCurrentPage(1);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    useEffect(() => {
        axios
            .get(
                "https://672be4011600dda5a9f6ae2c.mockapi.io/mockapi/transactions"
            )
            .then((response) => {
                const transactionsData = response.data;
                setTransactions(transactionsData);
                setFilteredTransactions(transactionsData);

                const transactionDates = transactionsData.map(
                    (transaction: Transaction) => new Date(transaction.date)
                );

                const minDate = new Date(
                    Math.min(
                        ...transactionDates.map((date: Date) => date.getTime())
                    )
                );
                const maxDate = new Date(
                    Math.max(
                        ...transactionDates.map((date: Date) => date.getTime())
                    )
                );

                minDate.setHours(0, 0, 0, 0);
                maxDate.setHours(23, 59, 59, 999);
                setDateRange([minDate, maxDate]);
            })
            .catch(() => {
                setShowError(true);
            });
    }, []);

    useEffect(() => {
        if (dateRange[0] && dateRange[1]) {
            if (dateRange[0]!.getDate() === dateRange[1]!.getDate()) {
                const startOfDay = new Date(dateRange[0]!);
                startOfDay.setHours(0, 0, 0, 0);

                const endOfDay = new Date(dateRange[0]!);
                endOfDay.setHours(23, 59, 59, 999);

                setDateRange([startOfDay, endOfDay]);
            }

            // Filter transactions based on the selected date range
            const filtered = transactions.filter((transaction) => {
                const transactionDate = new Date(transaction.date);
                return (
                    transactionDate >= dateRange[0]! &&
                    transactionDate <= dateRange[1]!
                );
            });
            setFilteredTransactions(filtered);
        } else {
            // Reset filter if no date range selected
            setFilteredTransactions(transactions);
        }
    }, [dateRange, transactions]);

    // Sorting function
    const handleRequestSort = (property: keyof Transaction) => {
        const isAsc = orderBy === property && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(property);
    };

    const sortTransactions = (array: Transaction[]) => {
        const sortedArray = [...array];
        sortedArray.sort((a, b) => {
            if (orderBy === "date") {
                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();
                return order === "asc" ? dateA - dateB : dateB - dateA;
            } else if (orderBy === "amount") {
                return order === "asc"
                    ? a.amount - b.amount
                    : b.amount - a.amount;
            }
            return 0;
        });
        return sortedArray;
    };

    const sortedTransactions = sortTransactions(filteredTransactions);

    // Pagination logic
    const indexOfLastTransaction = currentPage * transactionsPerPage;
    const indexOfFirstTransaction =
        indexOfLastTransaction - transactionsPerPage;
    const currentTransactions = sortedTransactions.slice(
        indexOfFirstTransaction,
        indexOfLastTransaction
    );

    const nextPage = () =>
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

    const totalPages = Math.ceil(
        filteredTransactions.length / transactionsPerPage
    );

    return (
        <>
            <Body error={showError}>
                <h1>Transactions</h1>

                <Summary>
                    <div>
                        <strong>Total Transactions:</strong>{" "}
                        {totalTransactionCount}
                    </div>
                    <div>
                        <strong>Total Amount:</strong> ${totalAmount.toFixed(2)}
                    </div>
                </Summary>

                <button onClick={toggleDatePicker}>Select Date Range</button>
                <p>
                    {dateRange[0] && dateRange[1]
                        ? `Selected Date Range: ${dateRange[0].toLocaleDateString()} - ${dateRange[1].toLocaleDateString()}`
                        : "Please select a date range"}
                </p>

                {showDatePicker && (
                    <DatePicker
                        selected={dateRange[0]}
                        onChange={(dates: [Date | null, Date | null]) => {
                            const [start, end] = dates;
                            setDateRange([
                                start || undefined,
                                end || undefined,
                            ]);
                            if (start && end) toggleDatePicker();
                        }}
                        startDate={dateRange[0]}
                        endDate={dateRange[1]}
                        selectsRange
                        inline
                    />
                )}

                {!showDatePicker && (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Transaction ID</TableCell>
                                    <TableCell>
                                        <TableSortLabel
                                            active={orderBy !== "amount"}
                                            direction={
                                                orderBy === "date"
                                                    ? order
                                                    : "asc"
                                            }
                                            onClick={() =>
                                                handleRequestSort("date")
                                            }
                                        >
                                            Date
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>
                                        <TableSortLabel
                                            active={orderBy !== "date"}
                                            direction={
                                                orderBy === "amount"
                                                    ? order
                                                    : "asc"
                                            }
                                            onClick={() =>
                                                handleRequestSort("amount")
                                            }
                                        >
                                            Amount
                                        </TableSortLabel>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {currentTransactions.map((transaction) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell>{transaction.id}</TableCell>
                                        <TableCell>
                                            {formatDate(transaction.date)}
                                        </TableCell>
                                        <TableCell>
                                            {transaction.description}
                                        </TableCell>
                                        <TableCell>
                                            {transaction.amount}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                <Pagination>
                    <FormControl>
                        <Select
                            value={transactionsPerPage}
                            onChange={(e) => {
                                setTransactionsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                        >
                            <MenuItem value={5}>5 per page</MenuItem>
                            <MenuItem value={10}>10 per page</MenuItem>
                            <MenuItem value={15}>15 per page</MenuItem>
                        </Select>
                    </FormControl>

                    <Button
                        onClick={prevPage}
                        disabled={currentPage === 1 || totalPages <= 1}
                    >
                        Previous
                    </Button>

                    <span>{`Page ${currentPage} of ${totalPages}`}</span>

                    <Button
                        onClick={nextPage}
                        disabled={currentPage === totalPages || totalPages <= 1}
                    >
                        Next
                    </Button>
                </Pagination>
            </Body>
            {showError && (
                <Error>
                    <h2>Something went wrong!</h2>
                    <p>Unable to load data</p>
                    <button onClick={() => setShowError(false)}>
                        Understood
                    </button>
                </Error>
            )}
        </>
    );
};

export default App;
