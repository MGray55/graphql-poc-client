import {useQuery} from "@apollo/client";
import {loader} from 'graphql.macro';
import {Book} from "./types/gql/graphql";

const TestQuery = loader('./queries/books.gql');

const TestComponent = () => {
    const {data, loading, error} = useQuery(TestQuery)
    if (error) {
        return (
            <div>
                Error: {error.message}
            </div>
        )
    }
    if (loading) {
        return (
            <div>
                Loading...
            </div>
        )
    }
    const listItems = data.books.map((book: Book) =>
        <li>{`Title: ${book.title} Author: ${book.author}`}</li>
    );

    return (
        <div>
            {listItems}
        </div>
    )
}

export {TestComponent}