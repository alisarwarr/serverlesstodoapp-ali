const dotenv = require('dotenv');
dotenv.config();


const { ApolloServer, gql } = require('apollo-server-lambda');
var faunadb = require('faunadb'),
q = faunadb.query;


const typeDefs = gql`
    type todosType {
        id: ID!
        detail: String!
    }

    type Query {
        allTodos: [todosType]
    }

    type Mutation {
        createTodo(words: String!): todosType
        deleteTodo(id: ID!): todosType
        updateTodo(id: ID!, words: String!): todosType
    }
`

var adminClient = new faunadb.Client({
    secret: process.env.FAUNADB_ADMIN_SECRET
})

const resolvers = {
    Query: {
        allTodos: async() => {
            try {
                const result = await adminClient.query(
                    q.Map(
                        q.Paginate(q.Documents(q.Collection('todos'))),
                        q.Lambda(x => q.Get(x))
                    )
                )
        
                console.log(result.data);                                   //returns array from Database
    
                const modifiedData = result.data.map(obj => {
                    return { id: obj.ref.id, detail: obj.data.detail }      //array holding only 'id' & 'detail' property value
                })
    
                return modifiedData;                                        //return that array
            }
            catch(error) {
                console.log(error);
            }
        }
    },

    Mutation: {
        createTodo: async(_, {words}) => {
            try {
                const result = await adminClient.query(
                    q.Create(
                        q.Collection('todos'),
                        { data: { detail: words } }                         //'words' assigned
                    )
                )
            }
            catch(error) {
                console.log(error);
            }
        },

        deleteTodo: async(_, {id}) => {
            try {
                const result = await adminClient.query(
                    q.Delete(
                        q.Ref(q.Collection('todos'), id)                    //'id' assigned
                    )
                )
            }
            catch(error) {
                console.log(error);
            }
        },

        updateTodo: async(_, {id, words}) => {
            try {
                const result = await adminClient.query(
                    q.Update(
                        q.Ref(q.Collection('todos'), id),                   //'id' assigned
                        { data: { detail: words } }                         //'words' assigned
                    )
                )
            }
            catch(error) {
                console.log(error);
            }
        }
    }
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
    playground: true,
    introspection: true
})

exports.handler = server.createHandler();