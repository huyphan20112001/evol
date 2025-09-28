const mockData = {
    user: {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        isAuthenticated: true
    },
    posts: [
        {
            id: 1,
            title: 'First Post',
            content: 'This is the content of the first post.',
            authorId: 1
        },
        {
            id: 2,
            title: 'Second Post',
            content: 'This is the content of the second post.',
            authorId: 1
        }
    ],
    comments: [
        {
            id: 1,
            postId: 1,
            content: 'Great post!',
            authorId: 1
        },
        {
            id: 2,
            postId: 2,
            content: 'Thanks for sharing!',
            authorId: 1
        }
    ]
};

export default mockData;