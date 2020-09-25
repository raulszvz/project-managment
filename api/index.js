const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const schema = require("./graphql/schema.js");
const cors = require('cors');
const app = express();

app.use(cors());
app.use("/", graphqlHTTP({ schema: schema.schema, graphiql: true}));

app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), () => {
    console.log("GraphQL server running at http://localhost:3000.");
});