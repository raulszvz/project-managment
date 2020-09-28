const graphql = require("graphql");
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require("bcryptjs");

//create a database if no exists
const database = new sqlite3.Database("./db/project-managment.db");

//create a table to insert post
const createUsuarioTable = () => {
    const query = `
    CREATE TABLE IF NOT EXISTS usuario(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre text,
        email text,
        password text,
        supervisor text,
        direccion text,
        tipo integer)`;

    return database.run(query);
}

const createProyectoTable = () => {
    const query = `
    CREATE TABLE IF NOT EXISTS proyecto(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombreProyecto text,
        tipo text,
        modelo text, 
        km2 text,
        fechaAsignacion text,
        fechaFinal text,
        estado text,
        idUsuario integer,
        FOREIGN KEY(idUsuario) REFERENCES usuario(id))`;

    return database.run(query);
}

const createEntregaTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS entrega(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            numEntrega integer,
            fechaEntrega text,
            rasgos text,
            observaciones text,
            idProyecto integer,
            FOREIGN KEY(idProyecto) REFERENCES proyecto(id))`;

    return database.run(query);
}

//call function to init the post table
createUsuarioTable();
createProyectoTable();
createEntregaTable();

// Metodos criptograficos para password
const encryptPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

const comparePassword = async (password, passwordDB) => {
    const valid = await bcrypt.compare(password, passwordDB);
    return valid;
}

//creacte graphql post object
const UsuarioType = new graphql.GraphQLObjectType({
    name: 'Usuario',
    fields:{
        id:{ type: graphql.GraphQLID },
        nombre: { type: graphql.GraphQLString },
        email: { type: graphql.GraphQLString },
        password: { type: graphql.GraphQLString },
        supervisor: { type: graphql.GraphQLString },
        direccion: { type: graphql.GraphQLString },
        tipo: { type: graphql.GraphQLInt }
    }
});

const ProyectoType = new graphql.GraphQLObjectType({
    name: 'Proyecto',
    fields:{
        id: { type: graphql.GraphQLID },
        nombreProyecto: { type: graphql.GraphQLString },
        tipo: { type: graphql.GraphQLString }, 
        modelo: { type: graphql.GraphQLString },
        km2: { type: graphql.GraphQLString },  
        fechaAsignacion: { type: graphql.GraphQLString }, 
        fechaFinal: { type: graphql.GraphQLString },
        estado: { type: graphql.GraphQLString },
        idUsuario: { type: graphql.GraphQLInt }
    }
});

const EntregaType = new graphql.GraphQLObjectType({
    name: 'Entrega',
    fields:{
        id: { type: graphql.GraphQLID },
        numEntrega: { type: graphql.GraphQLInt },
        fechaEntrega: { type: graphql.GraphQLString }, 
        rasgos: { type: graphql.GraphQLString }, 
        observaciones: { type: graphql.GraphQLString },  
        idProyecto: { type: graphql.GraphQLInt }
    }
});

// create a graphql query to select all and by id
var queryType = new graphql.GraphQLObjectType({
    name: 'Query',
    fields: {
        Login: {
            type: UsuarioType,
            args: {
                email: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                password: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                }
            }, 
            resolve:  (root, {email,password}, context, info) => {
                return new Promise((resolve, reject) =>{
                    database.all("SELECT * FROM usuario WHERE email = (?);", [email],  async (err,row) => {
                        if(err || !(await comparePassword(password, row[0]["password"]))){
                            reject(null);
                        } 
                        resolve(row[0]);
                    });
                });
            }
        },
        Usuarios: {
            type: graphql.GraphQLList(UsuarioType),
            resolve: (root, args, context, info) => {
                return new Promise((resolve, reject) => {
                    database.all("SELECT * FROM usuario;", function(err,rows){
                        if(err){
                            reject([]);
                        }
                        resolve(rows);
                    });
                });
            }
        },
        ProyectosUsuario: {
            type: graphql.GraphQLList(ProyectoType),
            args: {
                idUsuario: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLInt)
                }
            },
            resolve: (root, {idUsuario}, context, info) => {
                return new Promise((resolve, reject) =>{
                    database.all("SELECT * FROM proyecto WHERE idUsuario = (?);", [idUsuario], function(err,rows) {
                       if(err){
                           reject([]);
                       } 
                       resolve(rows);
                    });
                });
            }
        },
        Proyectos: {
            type: graphql.GraphQLList(ProyectoType),
            resolve: (root, args, context, info) => {
                return new Promise((resolve, reject) => {
                    database.all("SELECT * FROM proyecto;", function(err,rows){
                        if(err){
                            reject([]);
                        }
                        resolve(rows);
                    });
                });
            }
        },
        Proyecto: {
            type: ProyectoType,
            args: {
                id: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLID)
                }
            },
            resolve: (root, {id}, context, info) => {
                return new Promise((resolve, reject) =>{
                    database.all("SELECT * FROM proyecto WHERE id = (?);", [id], function(err,rows) {
                       if(err){
                           reject(null);
                       } 
                       resolve(rows[0]);
                    });
                });
            }
        },
        Entregas: {
            type: graphql.GraphQLList(EntregaType),
            resolve: (root, args, context, info) => {
                return new Promise((resolve, reject) => {
                    database.all("SELECT * FROM entrega;", function(err,rows){
                        if(err){
                            reject([]);
                        }
                        resolve(rows);
                        console.log(rows);
                    });
                });
            }
        },
        Entrega: {
            type: EntregaType,
            args: {
                id: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLID)
                }
            },
            resolve: (root, {id}, context, info) => {
                return new Promise((resolve, reject) =>{
                    database.all("SELECT * FROM entrega WHERE id = (?);", [id], function(err,rows) {
                       if(err){
                           reject(null);
                       } 
                       resolve(rows[0]);
                    });
                });
            }
        },
        EntregasDeProyecto: {
            type: graphql.GraphQLList(EntregaType),
            args: {
                idProyecto: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLInt)
                }
            },
            resolve: (root, {idProyecto}, context, info) => {
                return new Promise((resolve, reject) =>{
                    database.all("SELECT * FROM entrega WHERE idProyecto = (?);", [idProyecto], function(err,rows) {
                       if(err){
                           reject([]);
                       } 
                       resolve(rows);
                    });
                });
            }
        }
    }
});

//mutation type is a type of object to modify data (INSERT,DELETE,UPDATE)
var mutationType = new graphql.GraphQLObjectType({
    name: 'Mutation',
    fields: {
        //Mutations Usuario
        createUsuario: {
            type: UsuarioType,
            args: {
                nombre: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                email: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                password: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                supervisor: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                direccion: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                tipo: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLInt)
                },
            },
            resolve: async (root, {nombre, email, password, supervisor, direccion, tipo}) => {
                let pass = await encryptPassword(password)
                return new Promise((resolve, reject) =>{
                    database.run('INSERT INTO usuario (nombre, email, password, supervisor, direccion, tipo) VALUES (?,?,?,?,?,?);', [nombre, email, pass, supervisor, direccion, tipo], (err) => {
                        if(err){
                            reject(err);
                        }
                        database.get('SELECT last_insert_rowid() as id', (err, row) => {
                            resolve({
                                id: row["id"],
                                nombre: nombre,
                                email: email, 
                                password: pass,
                                supervisor: supervisor, 
                                direccion: direccion,
                                tipo: tipo
                            })
                        });
                    });
                });
            }
        },
        updateUsuario: {
            type: graphql.GraphQLString,
            args: {
                nombre: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                email: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                password: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                supervisor: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                direccion: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                tipo: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
            },
            resolve: (root, {nombre, email, password, supervisor, direccion, tipo}) => {
                return new Promise((resolve, reject) => {
                    //raw SQLite to update a post in post table
                    database.run('UPDATE usuario SET nombre = (?), email = (?), password = (?), supervisor = (?), direccion = (?), tipo = (?) WHERE id = (?);', [id, nombre, email, password, supervisor, direccion, tipo], (err) => {
                        if(err) {
                            reject(err);
                        }
                        resolve(`Usuario #${id} updated`);
                    });
                })
            }
        },
        deleteUsuario: {
            type: graphql.GraphQLString,
            args: {
                id:{
                    type: new graphql.GraphQLNonNull(graphql.GraphQLID)
                }
            },
            resolve: (root, {id}) => {
                return new Promise((resolve, reject) => {
                    database.run('DELETE FROM usuario WHERE id = (?);', [id], (err) => {
                        if(err){
                            reject(err);
                        }
                        resolve(`Usuario #${id} deleted`)
                    });
                });
            }
        },
        // Mutations Proyecto
        createProyecto: {
            type: ProyectoType,
            args: {
                nombreProyecto: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                tipo: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                modelo: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                km2: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                fechaAsignacion: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                fechaFinal: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                estado: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                idUsuario:{
                    type: new graphql.GraphQLNonNull(graphql.GraphQLInt)
                },
            },
            resolve: (root, {nombreProyecto, tipo, modelo, km2, fechaAsignacion, fechaFinal, estado, idUsuario}) => {
                return new Promise((resolve, reject) =>{
                    database.run('INSERT INTO proyecto (nombreProyecto, tipo, modelo, km2, fechaAsignacion, fechaFinal, estado, idUsuario) VALUES (?,?,?,?,?,?,?,?);', [nombreProyecto, tipo, modelo, km2, fechaAsignacion, fechaFinal, estado, idUsuario], (err) => {
                        if(err){
                            reject(null);
                        }
                        database.get('SELECT last_insert_rowid() as id', (err, row) => {
                            resolve({
                                id: row["id"],
                                nombreProyecto: nombreProyecto, 
                                tipo: tipo, 
                                modelo: modelo,
                                km2: km2,
                                fechaAsignacion: fechaAsignacion, 
                                fechaFinal: fechaFinal,
                                estado: estado,
                                idUsuario: idUsuario
                            })
                        });
                    });
                });
            }
        },
        updateProyecto: {
            type: graphql.GraphQLString,
            args: {
                id:{
                    type: new graphql.GraphQLNonNull(graphql.GraphQLID)
                },
                nombreProyecto: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                tipo: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                modelo: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                km2: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                fechaAsignacion: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                fechaFinal: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                estado: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                idUsuario:{
                    type: new graphql.GraphQLNonNull(graphql.GraphQLInt)
                },
            },
            resolve: (root, {id, nombreProyecto, tipo, modelo, km2, fechaAsignacion, fechaFinal, estado, idUsuario}) => {
                return new Promise((resolve, reject) => {
                    //raw SQLite to update a post in post table
                    database.run('UPDATE proyecto SET nombreProyecto = (?), tipo = (?), modelo = (?), km2 = (?), fechaAsignacion = (?), fechaFinal = (?), estado = (?), idUsuario = (?) WHERE id = (?);', [id, nombreProyecto, tipo, modelo, km2, fechaAsignacion, fechaFinal, estado, idUsuario], (err) => {
                        if(err) {
                            reject(err);
                        }
                        resolve(`Proyecto #${id} updated`);
                    });
                })
            }
        },
        deleteProyecto: {
            type: graphql.GraphQLString,
            args: {
                id:{
                    type: new graphql.GraphQLNonNull(graphql.GraphQLID)
                }
            },
            resolve: (root, {id}) => {
                return new Promise((resolve, reject) => {
                    database.run('DELETE FROM proyecto WHERE id = (?);', [id], (err) => {
                        if(err){
                            reject(err);
                        }
                        resolve(`Proyecto #${id} deleted`)
                    });
                });
            }
        },
        // Mutations Entrega
        createEntrega: {
            type: EntregaType,
            args: {
                numEntrega: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLInt)
                },
                fechaEntrega: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                rasgos: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                observaciones: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                idProyecto: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLInt)
                }
            },
            resolve: (root, {numEntrega, fechaEntrega, rasgos, observaciones, idProyecto}) => {
                return new Promise((resolve, reject) =>{
                    database.run('INSERT INTO entrega (numEntrega, fechaEntrega, rasgos, observaciones, idProyecto) VALUES (?,?,?,?,?);', [numEntrega, fechaEntrega, rasgos, observaciones, idProyecto], (err) => {
                        if(err){
                            reject(null);
                        }
                        database.get('SELECT last_insert_rowid() as id', (err, row) => {
                            resolve({
                                id: row["id"],
                                numEntrega: numEntrega, 
                                fechaEntrega: fechaEntrega, 
                                rasgos: rasgos, 
                                observaciones: observaciones, 
                                idProyecto: idProyecto
                            })
                        });
                    });
                });
            }
        },
        updateEntrega: {
            type: graphql.GraphQLString,
            args: {
                id:{
                    type: new graphql.GraphQLNonNull(graphql.GraphQLID)
                },
                numEntrega: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLInt)
                },
                fechaEntrega: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                rasgos: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                observaciones: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                idProyecto: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLInt)
                }
            },
            resolve: (root, {id, numEntrega, fechaEntrega, rasgos, observaciones, idProyecto}) => {
                return new Promise((resolve, reject) => {
                    //raw SQLite to update a post in post table
                    database.run('UPDATE entrega SET numEntrega = (?), fechaEntrega = (?), rasgos = (?), observaciones = (?), idProyecto = (?) WHERE id = (?);', [id, numEntrega, fechaEntrega, rasgos, observaciones, idProyecto], (err) => {
                        if(err) {
                            reject(err);
                        }
                        resolve(`Entrega #${id} updated`);
                    });
                })
            }
        },
        deleteEntrega: {
            type: graphql.GraphQLString,
            args: {
                id:{
                    type: new graphql.GraphQLNonNull(graphql.GraphQLID)
                }
            },
            resolve: (root, {id}) => {
                return new Promise((resolve, reject) => {
                    database.run('DELETE FROM entrega WHERE id = (?);', [id], (err) => {
                        if(err){
                            reject(err);
                        }
                        resolve(`Entrega #${id} deleted`)
                    });
                });
            }
        }
    }
});

//define schema with post object, queries, and mustation 
const schema = new graphql.GraphQLSchema({
    query: queryType,
    mutation: mutationType 
});

//export schema to use on index.js
module.exports = {
    schema
}