export const MemoryRouter = ({ children }) => {
    return <div>{children}</div>;
};

export const Route = ({ children }) => {
    return <div>{children}</div>;
};

export const Link = ({ to, children }) => {
    return <a href={to}>{children}</a>;
};

export const useHistory = () => {
    return {
        push: jest.fn(),
        replace: jest.fn(),
        goBack: jest.fn(),
    };
};

export const useLocation = () => {
    return {
        pathname: '/',
        search: '',
        hash: '',
        state: undefined,
    };
};

export const useParams = () => {
    return {};
};