require('dotenv').config()

const { ApolloServer, gql } = require('apollo-server')
const MyDatabase = require('./datasources/sql')
const { paginateResults } = require('./utils')

const knexConfig = {
    client: "mysql",
    connection: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
    }
}
const db = new MyDatabase(knexConfig)

const port = process.env.PORT || 1337

const typeDefs = gql`
    type Listing {
        id: String!
        url: String
        title: String
        address: String
        category: String
        image_url: String
        meta: [ListingMeta]
    }
    
    type ListingMeta {
        key: String 
        value: String
    }
    
    type ListingConnection {
        cursor: String!
        hasMore: Boolean!
        listings: [Listing]!
    }

    type Query {
        listings(pageSize: Int, after: String): ListingConnection!
        getListing(id: String!): Listing!
    }
`

const resolvers = {
    Query: {
        listings: async (_, { pageSize = 20, after }, { dataSources }) => {
            console.log('query:listings', pageSize, after)

            let allListings = await dataSources.db.getListings()
            allListings = allListings.map((l) => {
                l.meta = JSON.parse(l.meta)

                return l
            })
            const listings = paginateResults({
                pageSize,
                after,
                results: allListings
            })

            return {
                listings,
                cursor: listings.length ? listings[listings.length - 1].cursor : null,
                hasMore: listings.length
                  ? listings[listings.length - 1].cursor !== allListings[allListings.length - 1].cursor
                  : false
            }
        },
        getListing: async (_, { id }, { dataSources }) => {
            const listing = await dataSources.db.getListing(id)
            if (listing.meta) {
                listing.meta = JSON.parse(listing.meta)
            }

            return listing
        }
    }
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
    dataSources: () => ({ db })
})
server
  .listen({ port })
  .then(({ url }) => {
      console.log(`🚀  Server ready at ${url}`);
  })
